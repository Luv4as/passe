import { BadRequestException, ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { TransactionMapper } from "./mappers/market.mapper";
import { BuyPlayerDto } from "./dto/buy-player.dto";
import { calcularValorMercado } from "../../common/utils/player.utils";
import { GetTransactionsQueryDto } from "./dto/get-transactions-query.dto";

@Injectable()
export class MarketService {
    constructor(private readonly prisma: PrismaService) { }

    private validarFidelidade(loyaltyUntil: string): Date {
        const agora = new Date();
        const fimFidelidade = new Date(loyaltyUntil);

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

    private async validarElegibilidadeCompra(player: any, clubId: number) {
        if (player.clube_id !== null) {
            throw new ConflictException({ message: `O jogador já está vinculado a um clube. Clube atual: ${player.clube_id}` });
        }

        const totalElenco = await this.prisma.jogadores.count({
            where: { clube_id: clubId, excluido_em: null },
        });

        if (totalElenco >= 12) {
            throw new ConflictException({ message: 'O clube já atingiu o limite de 12 jogadores no elenco.' });
        }

        const jaVendeu = await this.prisma.transacoes.findFirst({
            where: { clube_id: clubId, jogador_id: player.id, tipo: 'VENDA' },
        });

        if (jaVendeu) {
            throw new ConflictException({
                message: 'O clube não pode comprar um jogador que ele mesmo já vendeu anteriormente.',
            });
        }
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


    async buyPlayer(id: number, dto: BuyPlayerDto) {
        const player = await this.prisma.jogadores.findFirst({
            where: { id, excluido_em: null },
        });

        const club = await this.prisma.clubes.findUnique({
            where: { id: dto.club_id },
        });

        if (!club) {
            throw new NotFoundException({ message: `Clube com ID:${dto.club_id} não encontrado.` });
        }
        if (!player) {
            throw new NotFoundException({ message: `Jogador com ID:${id} não encontrado.` });
        }

        const agora = new Date();
        const fimFidelidade = this.validarFidelidade(dto.loyalty_until);
        await this.validarElegibilidadeCompra(player, dto.club_id);
        const marketValue = calcularValorMercado(player);
        const { fee, totalCost } = this.calcularCustosCompra(marketValue, Number(club.caixa));

        const clubCash = Number(club.caixa.toFixed(2));

        const resultado = await this.prisma.$transaction(async (tx) => {
            const novoCaixa = Number((clubCash - totalCost).toFixed(2));
            await tx.clubes.update({
                where: { id: dto.club_id },
                data: { caixa: novoCaixa },
            });

            await tx.jogadores.update({
                where: { id: player.id },
                data: { clube_id: dto.club_id }
            });

            const contrato = await tx.contratos.create({
                data: {
                    jogador_id: player.id,
                    clube_id: dto.club_id,
                    valor_compra: marketValue,
                    fidelidade_ate: fimFidelidade,
                    situacao: 'ATIVO',
                    iniciado_em: agora,
                }
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
                }
            });
            return { transacao, contrato, novoCaixa };
        });

        return TransactionMapper.toResponse(resultado.transacao, resultado.contrato, resultado.novoCaixa);
    }

    async sellPlayer(id: number) {
        const player = await this.prisma.jogadores.findFirst({
            where: { id, excluido_em: null },
        });

        if (!player) {
            throw new NotFoundException({ message: `Jogador com ID:${id} não encontrado.` });
        }
        if (player.clube_id === null) {
            throw new ConflictException({ message: 'O jogador não está vinculado a nenhum clube.' });
        }

        const clubId = player.clube_id;
        const club = await this.prisma.clubes.findUnique({
            where: { id: clubId },
        })

        if (!club) {
            throw new NotFoundException({ message: `Clube com ID:${clubId} não encontrado.` });
        }

        const contratoAtivo = await this.prisma.contratos.findFirst({
            where: {
                jogador_id: player.id,
                clube_id: clubId,
                situacao: 'ATIVO'
            },
        });

        if (!contratoAtivo) {
            throw new ConflictException({ message: 'Não há contrato ativo para este jogador no clube.' });
        }

        const agora = new Date();
        const marketValue = calcularValorMercado(player);

        let penalty = 0.00;
        if (contratoAtivo.fidelidade_ate && agora < new Date(contratoAtivo.fidelidade_ate)) {
            penalty = Number((marketValue * 0.10).toFixed(2));
        }

        const cashChange = Number((marketValue - penalty).toFixed(2)); //novo caixa
        const purchaseValue = Number(contratoAtivo.valor_compra); //valor de compra
        const profit = Number((cashChange - purchaseValue).toFixed(2)); //lucro

        const clubCash = Number(club.caixa.toFixed(2)); //caixa atual do clube
        const newCash = Number((clubCash + cashChange).toFixed(2)); //caixa final do clube após a venda

        const resultado = await this.prisma.$transaction(async (tx) => {
            await tx.clubes.update({
                where: { id: clubId },
                data: { caixa: newCash },
            });

            await tx.jogadores.update({
                where: { id: player.id },
                data: { clube_id: null }
            });

            const contratoEncerrado = await tx.contratos.update({
                where: { id: contratoAtivo.id },
                data: { situacao: 'RESCINDIDO' }
            });

            await tx.escalacoes.deleteMany({
                where: { jogador_id: player.id }
            });

            const transacao = await tx.transacoes.create({
                data: {
                    clube_id: clubId,
                    jogador_id: player.id,
                    nome_jogador: player.nome,
                    tipo: 'VENDA',
                    valor: marketValue,
                    taxa: 0.00,
                    multa: penalty,
                    lucro: profit,
                    variacao_caixa: cashChange,
                    criado_em: agora,
                },
            });

            return { transacao, contrato: contratoEncerrado, newCash };
        });
        return TransactionMapper.toResponse(
            resultado.transacao,
            resultado.contrato,
            resultado.newCash,
        );
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
            orderBy: [
                { criado_em: 'desc' },
                { id: 'desc' }
            ],
        });

        const summary = transactions.reduce((acc, t) => {
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
            }
        );
        return TransactionMapper.toTransactionsResponse(transactions, summary);
    }
}