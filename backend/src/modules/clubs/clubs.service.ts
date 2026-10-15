import { BadRequestException, ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { PlayersService } from "../players/players.service";
import { ClubSortOptions, FilterClubDto } from "./dto/filter-club.dto";
import { ClubMapper } from "./mappers/club.mappers";
import { compararNomes, normalizarTexto } from "../../common/utils/string.util";
import { PlayerMapper } from "../players/mappers/player.mapper";
import { CreateClubsDto } from "./dto/create-clubs.dto";

function validarSiglaNoNome(nome: string, sigla: string): boolean {
    const normNome = normalizarTexto(nome);
    const normSigla = normalizarTexto(sigla);

    if (normNome[0] !== normSigla[0]) return false;

    let pos = 0;
    for (const char of normNome) {
        if (char === normSigla[pos]) {
            pos++;
            if (pos === normSigla.length) return true;
        }
    }
    return false;
}

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

    async create(dto: CreateClubsDto) {
        const nomeLimpo = dto.name.trim().replace(/\s+/g, ' ');
        const siglaLimpa = dto.acronym.trim().toUpperCase();

        if (nomeLimpo === '' || siglaLimpa === '') {
            throw new BadRequestException({ message: `Nome ou sigla não podem ser vazios` });
        }
        const palavras = nomeLimpo.split(' ');
        if (palavras.length < 2 || palavras.length > 5) {
            throw new BadRequestException({ message: `Nome deve ter entre 2 e 5 palavras` });
        }
        if (nomeLimpo.length < 3 || nomeLimpo.length > 60) {
            throw new BadRequestException({ message: `Nome deve ter entre 3 e 60 caracteres` });
        }
        if (siglaLimpa[0] === siglaLimpa[1] && siglaLimpa[1] === siglaLimpa[2]) {
            throw new BadRequestException({ message: `Sigla não pode ter todas as letras iguais` });
        }
        if (siglaLimpa.length !== 3) {
            throw new BadRequestException({ message: `Sigla deve ter exatamente 3 caracteres` });
        }
        if(!validarSiglaNoNome(nomeLimpo, siglaLimpa)) {
            throw new BadRequestException({ message: `As letras da sigla devem aparecer no nome do clube na mesma ordem.` });
        }

        const totalClubes = await this.prisma.clubes.count();
        if (totalClubes >= 20) {
            throw new ConflictException({ message: `O limite de 20 clubes por liga foi atingido` });
        }

        const existingClub = await this.prisma.clubes.findFirst({
            where: {
                OR: [
                    { nome: { equals: nomeLimpo, mode: 'insensitive' } },
                    { sigla: { equals: siglaLimpa, mode: 'insensitive' } }
                ]
            }
        })
        if (existingClub) {
            if (existingClub.sigla === siglaLimpa) {
                throw new ConflictException({ message: `Clube com sigla ${dto.acronym} já existe` });
            }
            throw new ConflictException({ message: `Clube com nome ${dto.name} já existe` });
        }

        const newClub = await this.prisma.clubes.create({
            data: {
                nome: nomeLimpo,
                sigla: siglaLimpa,
                caixa: 300.00,
            }
        });

        return ClubMapper.toResponse(newClub, 0);
    }
}