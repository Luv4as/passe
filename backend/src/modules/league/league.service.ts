import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { SetLineupDto } from "./dto/set-lineup.dto";
import { LeagueMapper } from "./mappers/league.mapper";

@Injectable()
export class LeagueService {
    constructor(private readonly prisma: PrismaService) { }

    private validarFormacaoTatitica(formation: string, players: any[]) {
        const contagem = {
            GOL: 0,
            DEF: 0,
            MEI: 0,
            ATA: 0,
        };

        players.forEach((p) => {
            if (p.posicao === 'GOL') contagem.GOL++;
            else if (p.posicao === 'ZAG' || p.posicao === 'LAT') contagem.DEF++;
            else if (p.posicao === 'MEI') contagem.MEI++;
            else if (p.posicao === 'ATA') contagem.ATA++;
        });

        if (contagem.GOL !== 1) {
            throw new ConflictException({ message: 'A escalação deve conter exatamente 1 Goleiro (GOL).' });
        }

        const regrasFormacao: Record<string, { DEF: number; MEI: number; ATA: number }> = {
            '3-1': { DEF: 3, MEI: 0, ATA: 1 },
            '2-2': { DEF: 2, MEI: 0, ATA: 2 },
            '2-1-1': { DEF: 2, MEI: 1, ATA: 1 },
            '1-2-1': { DEF: 1, MEI: 2, ATA: 1 },
        };

        const esperada = regrasFormacao[formation];

        if (
            contagem.DEF !== esperada.DEF ||
            contagem.MEI !== esperada.MEI ||
            contagem.ATA !== esperada.ATA
        ) {
            throw new ConflictException({
                message: `As posições dos jogadores não fecham com a formação ${formation}.`,
            });
        }
    }

    private ordenarElenco(players: any[]) {
        const ordemPosicao: Record<string, number> = {
            GOL: 1,
            ZAG: 2,
            LAT: 3,
            MEI: 4,
            ATA: 5,
        };

        return players.sort((a, b) => {
            const posA = ordemPosicao[a.posicao] || 99;
            const posB = ordemPosicao[b.posicao] || 99;
            if (posA !== posB) return posA - posB;

            const nomeA = a.nome.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
            const nomeB = b.nome.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
            if (nomeA !== nomeB) return nomeA < nomeB ? -1 : 1;

            return a.id - b.id;
        });
    }

    async updateLineup(clubId: number, dto: SetLineupDto) {
        const clubs = await this.prisma.clubes.findUnique({
            where: { id: clubId },
        });

        if (!clubs) {
            throw new NotFoundException({ message: `Clube com ID:${clubId} não encontrado.` });
        }

        const players = await this.prisma.jogadores.findMany({
            where: {
                id: { in: dto.player_ids },
                excluido_em: null,
            }
        });
        if (players.length !== 5) {
            throw new NotFoundException({ message: 'A escalação deve conter exatamente 5 jogadores válidos.' });
        }

        const foraDoElenco = players.some((p) => p.clube_id !== clubId);
        if (foraDoElenco) {
            throw new ConflictException({ message: 'Todos os jogadores escalados devem pertencer ao elenco do clube.' });
        }

        const temDoente = players.some((p) => p.condicao === 'DOENTE');
        if (temDoente) {
            throw new ConflictException({ message: 'Não é permitido escalar jogadores com condição DOENTE.' });
        }

        this.validarFormacaoTatitica(dto.formation, players);

        const agora = new Date();
        await this.prisma.$transaction(async (tx) => {
            await tx.clubes.update({
                where: { id: clubId },
                data: { formacao: dto.formation }
            });

            await tx.escalacoes.deleteMany({
                where: { clube_id: clubId }
            });

            await tx.escalacoes.createMany({
                data: dto.player_ids.map((jogador_id) => ({
                    clube_id: clubId,
                    jogador_id,
                    criado_em: agora,
                })),
            });
        });

        const jogadoresOrdenados = this.ordenarElenco(players);

        return LeagueMapper.toLineupResponse({
            clubId,
            formation: dto.formation,
            complete: true,
            players: jogadoresOrdenados,
        });
    }

    async getLineup(clubId: number) {
        const club = await this.prisma.clubes.findUnique({
            where: { id: clubId },
            include: {
                escalacoes: {
                    include: {
                        jogador: true,
                    }
                }
            }
        })
        if (!club) {
            throw new NotFoundException({ message: `Clube com ID:${clubId} não encontrado.` });
        }

        if (!club.formacao || club.escalacoes.length === 0) {
            return LeagueMapper.toLineupResponse({
                clubId,
                formation: null,
                complete: false,
                players: [],
            });
        }

        const titularesValidos = club.escalacoes.map((e) => e.jogador).filter((j) => j.excluido_em === null && j.clube_id === clubId && j.condicao !== 'DOENTE');

        const complete = titularesValidos.length === 5;

        const jogadoresOrdenados = this.ordenarElenco(titularesValidos);

        return LeagueMapper.toLineupResponse({
            clubId,
            formation: club.formacao,
            complete,
            players: jogadoresOrdenados,
        });
    }
}