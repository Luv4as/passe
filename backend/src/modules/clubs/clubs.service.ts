import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { PlayersService } from "../players/players.service";
import { ClubSortOptions, FilterClubDto } from "./dto/filter-club.dto";
import { ClubMapper } from "./mappers/club.mappers";
import { compararNomes } from "../../common/utils/string.util";
import { PlayerMapper } from "../players/mappers/player.mapper";

@Injectable()
export class ClubsService {
    constructor(private readonly prisma: PrismaService,
        private readonly playerService: PlayersService
    ) { }

    private ordenarElenco(jogadores: any[]): any[] {
        const posOrder: Record<string, number> = { GOL: 1, ZAG: 2, LAT: 3, MEI: 4, ATA: 5 };

        return jogadores.sort((a, b) => {
            if (!a || !b) return 0;

            const diffPos = (posOrder[a.position] || 99) - (posOrder[b.position] || 99);
            if (diffPos !== 0) return diffPos;

            const diffNome = compararNomes(a.name, b.name);
            if (diffNome !== 0) return diffNome;

            return a.id - b.id;
        });
    }

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
            throw new NotFoundException({ message: `Clube com id ${id} não encontrado` });
        }

        let squadValue = 0;

        const mappedPlayers = clube.jogadores.map((jogador) => {
            const marketValue = this.playerService.calcularValorMercado(jogador);
            const overall = this.playerService.calcularOverall(jogador);
            squadValue += marketValue;

            return PlayerMapper.toSquadPlayerResponse(jogador, overall, marketValue, clube.id);
        });

        const sortedPlayers = this.ordenarElenco(mappedPlayers);

        return ClubMapper.toDetailResponse(clube, squadValue, sortedPlayers);
    }
}