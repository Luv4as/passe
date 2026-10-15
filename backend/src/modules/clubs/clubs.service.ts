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
                        contratos:{
                            where: { situacao: 'ATIVO' },
                        }
                    }
                }
            }
        });

        if(!clube){
            throw new NotFoundException(`Clube com id ${id} não encontrado`);
        }

        return ClubMapper.toResponse(clube, clube.jogadores.reduce((total, jogador) => {
            const marketValue = this.playerService.calcularValorMercado(jogador);
            return total + marketValue;
        }, 0));
    }
}