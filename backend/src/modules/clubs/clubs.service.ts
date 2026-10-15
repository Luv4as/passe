import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { PlayersService } from "../players/players.service";
import { ClubSortOptions, FilterClubDto } from "./dto/filter-club.dto";
import { ClubMapper } from "./mappers/club.mappers";
import { compararNomes } from "../../common/utils/string.util";

@Injectable()
export class ClubsService {
    constructor(private readonly prisma: PrismaService,
        private readonly playerService: PlayersService
    ) { }

    async findAll(query: FilterClubDto) {
        const clubes = await this.prisma.clubes.findMany({
            include: {
                jogadores: {
                    where: { excluido_em: null },
                }
            }
        });

        let mapped = clubes.map((c) => {
            const squadValue = c.jogadores.reduce((total, jogador) => {
                const marketValue = this.playerService.calcularValorMercado(jogador);
                return total + marketValue;
            }, 0);

            const squadValueArredondado = Number(squadValue.toFixed(2));

            return ClubMapper.toResponse(c, squadValueArredondado);
        });

        const sortOption = query.sort || ClubSortOptions.NAME;

        mapped.sort((a, b) => {
            let diff = 0;

            if (sortOption === ClubSortOptions.NET_WORTH_DESC) {
                diff = b.net_worth - a.net_worth;
            } else if (sortOption === ClubSortOptions.NET_WORTH_ASC) {
                diff = a.net_worth - b.net_worth;
            }

            if (diff !== 0) return diff;

            const diffNome = compararNomes(a.name, b.name);
            if (diffNome !== 0) return diffNome;

            return a.id - b.id;
        });

        return mapped;
    }

    async findOne(id: number) {
        const clube = await this.prisma.clubes.findUnique({
            where: { id },
            include: {
                jogadores: {
                    where: { excluido_em: null },
                    include: {
                        contratos: {
                            where: { situacao: 'ATIVO' },
                        }
                    }
                }
            }
        });

        if (!clube) {
            throw new NotFoundException(`Clube com id ${id} não encontrado`);
        }

        const posOrder: Record<string, number> = { GOL: 1, ZAG: 2, LAT: 3, MEI: 4, ATA: 5 };
        let squadValue = 0;

        const mappedPlayers = clube.jogadores.map((jogador) => {
            const marketValue = this.playerService.calcularValorMercado(jogador);
            squadValue += marketValue;

            const overall = this.playerService.calcularOverall(jogador);
            const contratoAtivo = jogador.contratos[0];

            let remainingDays = 0;
            let penaltyRate = 0;

            if (contratoAtivo) {
                const agora = new Date();
                const fimContrato = new Date(contratoAtivo.fidelidade_ate);
                const diffTime = fimContrato.getTime() - agora.getTime();

                if (diffTime > 0) {
                    remainingDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                }

                if (remainingDays >= 181) penaltyRate = 20;
                else if (remainingDays >= 31) penaltyRate = 10;
                else if (remainingDays >= 1) penaltyRate = 5;
            }

                return {
                    id: jogador.id,
                    name: jogador.nome,
                    position: jogador.posicao,
                    agility: jogador.agilidade,
                    age: jogador.idade,
                    condition: jogador.condicao,
                    base_value: Number(jogador.valor_base),
                    market_value: marketValue,
                    pace: jogador.velocidade,
                    shooting: jogador.finalizacao,
                    passing: jogador.passe,
                    dribbling: jogador.drible,
                    defending: jogador.defesa,
                    physical: jogador.fisico,
                    potential: jogador.potencial,
                    overall: overall,
                    club_id: clube.id,
                    contract: contratoAtivo ? {
                        purchase_value: Number(contratoAtivo.valor_compra),
                        loyalty_until: contratoAtivo.fidelidade_ate,
                        remaining_days: remainingDays,
                        penalty_rate: penaltyRate,
                    } : null,
                };
        });

        mappedPlayers.sort((a, b) => {
            if (!a || !b) return 0;

            const diffPos = (posOrder[a.position] || 99) - (posOrder[b.position] || 99);
            if (diffPos !== 0) return diffPos;

            const diffNome = compararNomes(a.name, b.name);
            if (diffNome !== 0) return diffNome;

            return a.id - b.id;
        });

        const cash = Number(clube.caixa);
        const squadValueArredondado = Number(squadValue.toFixed(2));
        const netWorth = Number((cash + squadValueArredondado).toFixed(2));

        return ClubMapper.toDetailResponse(clube, squadValueArredondado, mappedPlayers);
    }
}