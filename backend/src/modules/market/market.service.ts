import { BadRequestException, ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { TransactionMapper } from "./mappers/market.mapper";
import { BuyPlayerDto } from "./dto/buy-player.dto";
import { calcularValorMercado } from "../../common/utils/player.utils";
import { GetTransactionsQueryDto } from "./dto/get-transactions-query.dto";
import { generateTransactionsCsv } from "../../common/utils/csv.utils";

@Injectable()
export class MarketService {
    constructor(private readonly prisma: PrismaService) { }

    private validarFidelidade(loyaltyUntil: string): Date {
        const dateMatch = loyaltyUntil.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})-03:00$/);
        if (!dateMatch) {
            throw new BadRequestException({ message: 'Formato de data inválido. Use AAAA-MM-DDTHH:MM-03:00.' });
        }

        const [, year, month, day, hour, minute] = dateMatch.map(Number);
        const testDate = new Date(Date.UTC(year, month - 1, day, hour + 3, minute));

        if (
            testDate.getUTCFullYear() !== year ||
            testDate.getUTCMonth() !== month - 1 ||
            testDate.getUTCDate() !== day
        ) {
            throw new BadRequestException({ message: 'A data/hora informada não existe no calendário.' });
        }

        const agora = new Date();
        const fimFidelidade = new Date(loyaltyUntil);

        if (fimFidelidade <= agora) {
            throw new BadRequestException({
                message: 'A data de fim de fidelidade deve ser uma data futura válida.',
            });
        }

        if (isNaN(fimFidelidade.getTime()) || fimFidelidade <= agora) {
            throw new BadRequestException({
                message: 'A data de fim de fidelidade deve ser uma data futura válida.',
            });
        }

        const diffDias = (fimFidelidade.getTime() - agora.getTime()) / (1000 * 60 * 60 * 24);
        if (diffDias > 1095) {
            throw new BadRequestException({
                message: 'A fidelidade não pode ser superior a 1.095 dias (3 anos).',
            });
        }

        return fimFidelidade;
    }

    private calcularCustosCompra(marketValue: number, caixaAtual: number) {
        let fee = 0.00;
        if (marketValue > 30.00) {
            fee = Number((marketValue * 0.05).toFixed(2));
        }

        const totalCost = Number((marketValue + fee).toFixed(2));
        const limiteCaixa = caixaAtual / 2;

        if (totalCost > limiteCaixa) {
            throw new ConflictException({
                message: `O custo da compra (${totalCost.toFixed(2)}) ultrapassa o limite de 50% do caixa (${limiteCaixa.toFixed(2)}).`,
            });
        }

        return { fee, totalCost };
    }

    private calcularMultaVenda(fidelidadeAte: Date, agora: Date, marketValue: number) {
        if (agora >= fidelidadeAte) {
            return { remainingDays: 0, penaltyRate: 0, penalty: 0.00, contractStatus: 'ENCERRADO' };
        }

        const diffMs = fidelidadeAte.getTime() - agora.getTime();
        const remainingDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

        let penaltyRate = 0;
        if (remainingDays >= 181) {
            penaltyRate = 20;
        } else if (remainingDays >= 31) {
            penaltyRate = 10;
        } else if (remainingDays >= 1) {
            penaltyRate = 5;
        }

        let penalty = Number((marketValue * (penaltyRate / 100)).toFixed(2));
        if (penalty > 10.00) {
            penalty = 10.00;
        }

        return {
            remainingDays,
            penaltyRate,
            penalty,
            contractStatus: 'RESCINDIDO',
        };
    }

    private calcularComissaoVenda(marketValue: number, purchaseValue: number) {
        const profit = Number((marketValue - purchaseValue).toFixed(2));

        if (profit <= 0) {
            return { profit, commission: 0.00 };
        }

        let commission = 0.00;
        if (profit <= 10.00) {
            commission = profit * 0.10;
        } else {
            commission = (10.00 * 0.10) + ((profit - 10.00) * 0.20);
        }

        return {
            profit,
            commission: Number(commission.toFixed(2)),
        };
    }

    async buyPlayer(id: number, dto: BuyPlayerDto) {
        const fimFidelidade = this.validarFidelidade(dto.loyalty_until);

        return this.prisma.$transaction(async (tx) => {
            const player = await tx.jogadores.findFirst({
                where: { id, excluido_em: null },
            });
            if (!player) {
                throw new NotFoundException({ message: `Jogador com ID:${id} não encontrado.` });
            }
            if (player.clube_id !== null) {
                throw new ConflictException({ message: `O jogador já está vinculado a um clube. Clube atual: ${player.clube_id}` });
            }

            const club = await tx.clubes.findUnique({
                where: { id: dto.club_id },
            });
            if (!club) {
                throw new NotFoundException({ message: `Clube com ID:${dto.club_id} não encontrado.` });
            }

            const totalElenco = await tx.jogadores.count({
                where: { clube_id: dto.club_id, excluido_em: null },
            });
            if (totalElenco >= 12) {
                throw new ConflictException({ message: 'O clube já atingiu o limite de 12 jogadores no elenco.' });
            }

            const jaVendeu = await tx.transacoes.findFirst({
                where: { clube_id: dto.club_id, jogador_id: player.id, tipo: 'VENDA' },
            });
            if (jaVendeu) {
                throw new ConflictException({
                    message: 'O clube não pode comprar um jogador que ele mesmo já vendeu anteriormente.',
                });
            }

            const marketValue = calcularValorMercado(player);
            const { fee, totalCost } = this.calcularCustosCompra(marketValue, Number(club.caixa));

            const agora = new Date();
            const clubCash = Number(club.caixa);
            const novoCaixa = Number((clubCash - totalCost).toFixed(2));

            await tx.clubes.update({
                where: { id: dto.club_id },
                data: { caixa: novoCaixa },
            });

            await tx.jogadores.update({
                where: { id: player.id },
                data: { clube_id: dto.club_id },
            });

            const contrato = await tx.contratos.create({
                data: {
                    jogador_id: player.id,
                    clube_id: dto.club_id,
                    valor_compra: marketValue,
                    fidelidade_ate: fimFidelidade,
                    situacao: 'ATIVO',
                    iniciado_em: agora,
                },
            });

            const transacao = await tx.transacoes.create({
                data: {
                    clube_id: dto.club_id,
                    jogador_id: player.id,
                    nome_jogador: player.nome,
                    tipo: 'COMPRA',
                    valor: marketValue,
                    taxa: fee,
                    multa: 0.00,
                    lucro: null,
                    variacao_caixa: -totalCost,
                    criado_em: agora,
                },
            });

            return TransactionMapper.toBuyResponse(transacao, contrato, novoCaixa);
        });
    }

    async sellPlayer(id: number) {
        return this.prisma.$transaction(async (tx) => {
            const player = await tx.jogadores.findFirst({
                where: { id, excluido_em: null },
            });

            if (!player) {
                throw new NotFoundException({ message: `Jogador com ID:${id} não encontrado.` });
            }
            if (player.clube_id === null) {
                throw new ConflictException({ message: 'O jogador não está vinculado a nenhum clube.' });
            }

            const clubId = player.clube_id;
            const club = await tx.clubes.findUnique({
                where: { id: clubId },
            });

            if (!club) {
                throw new NotFoundException({ message: `Clube com ID:${clubId} não encontrado.` });
            }

            const contratoAtivo = await tx.contratos.findFirst({
                where: {
                    jogador_id: player.id,
                    clube_id: clubId,
                    situacao: 'ATIVO',
                },
            });

            if (!contratoAtivo) {
                throw new ConflictException({ message: 'Não há contrato ativo para este jogador no clube.' });
            }

            const agora = new Date();
            const marketValue = calcularValorMercado(player);
            const purchaseValue = Number(contratoAtivo.valor_compra);

            const { remainingDays, penaltyRate, penalty, contractStatus } = this.calcularMultaVenda(
                new Date(contratoAtivo.fidelidade_ate),
                agora,
                marketValue,
            );

            const { profit, commission } = this.calcularComissaoVenda(marketValue, purchaseValue);

            const cashChange = Number((marketValue - penalty - commission).toFixed(2));
            const clubCash = Number(club.caixa);
            const newCash = Number((clubCash + cashChange).toFixed(2));

            await tx.clubes.update({
                where: { id: clubId },
                data: { caixa: newCash },
            });

            await tx.jogadores.update({
                where: { id: player.id },
                data: { clube_id: null },
            });

            await tx.contratos.update({
                where: { id: contratoAtivo.id },
                data: { situacao: contractStatus, encerrado_em: agora },
            });

            await tx.escalacoes.deleteMany({
                where: { jogador_id: player.id },
            });

            const transacao = await tx.transacoes.create({
                data: {
                    clube_id: clubId,
                    jogador_id: player.id,
                    nome_jogador: player.nome,
                    tipo: 'VENDA',
                    valor: marketValue,
                    taxa: commission,
                    multa: penalty,
                    lucro: profit,
                    variacao_caixa: cashChange,
                    criado_em: agora,
                },
            });

            return TransactionMapper.toSellResponse({
                transaction: transacao,
                purchaseValue,
                remainingDays,
                penaltyRate,
                contractStatus,
                clubCash: newCash,
            });
        });
    }

    async getClubTransactions(clubId: number, query: GetTransactionsQueryDto) {
        const club = await this.prisma.clubes.findUnique({
            where: { id: clubId },
        });
        if (!club) {
            throw new NotFoundException({ message: `Clube com ID:${clubId} não encontrado.` });
        }

        if (query.player_id) {
            const player = await this.prisma.jogadores.findFirst({
                where: { id: query.player_id, excluido_em: null },
            });
            if (!player) {
                throw new NotFoundException({ message: `Jogador com ID:${query.player_id} não encontrado.` });
            }
        }

        const where: any = { clube_id: clubId };
        if (query.type) {
            const types = query.type.split(',');
            where.tipo = { in: types };
        }

        if (query.player_id) {
            where.jogador_id = query.player_id;
        }

        const transactions = await this.prisma.transacoes.findMany({
            where,
            orderBy: [{ criado_em: 'desc' }, { id: 'desc' }],
        });

        const summary = transactions.reduce(
            (acc, t) => {
                const val = Number(t.valor);
                const fee = Number(t.taxa);
                const penalty = Number(t.multa);
                const profit = t.lucro !== null ? Number(t.lucro) : 0;
                const cashChange = Number(t.variacao_caixa);

                if (t.tipo === 'COMPRA') {
                    acc.total_spent += val + fee;
                } else if (t.tipo === 'VENDA') {
                    acc.total_received += cashChange;
                    acc.total_profit += profit;
                }

                acc.total_fees += fee;
                acc.total_penalties += penalty;

                return acc;
            },
            {
                total_spent: 0,
                total_received: 0,
                total_fees: 0,
                total_penalties: 0,
                total_profit: 0,
            },
        );

        return TransactionMapper.toTransactionsResponse(transactions, summary);
    }

    async exportTransactionsCsv(clubId: number, query: GetTransactionsQueryDto): Promise<string> {
        const club = await this.prisma.clubes.findUnique({
            where: { id: clubId },
        });
        if (!club) {
            throw new NotFoundException({ message: `Clube com ID ${clubId} não encontrado.` });
        }

        if (query.player_id) {
            const player = await this.prisma.jogadores.findFirst({
                where: { id: query.player_id, excluido_em: null },
            });
            if (!player) {
                throw new NotFoundException({ message: `Jogador com ID ${query.player_id} não encontrado.` });
            }
        }

        const where: any = { clube_id: clubId };

        if (query.type) {
            const types = query.type.split(',');
            where.tipo = { in: types };
        }

        if (query.player_id) {
            where.jogador_id = query.player_id;
        }

        const transactions = await this.prisma.transacoes.findMany({
            where,
            orderBy: [{ criado_em: 'desc' }, { id: 'desc' }],
        });

        return generateTransactionsCsv(transactions);
    }
}