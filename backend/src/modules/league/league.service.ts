import { BadRequestException, ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { SetLineupDto } from "./dto/set-lineup.dto";
import { LeagueMapper } from "./mappers/league.mapper";
import { CreateMatchDto } from "./dto/create-match.dto";
import { GetMatchesQueryDto } from "./dto/get-matches-query.dto";
import { normalizarTexto } from "../../common/utils/string.util";

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

    private calcularValorComCondicao(valorAtributo: number, condicao: string): number {
        if (condicao === 'MAL_CONDICIONADO') {
            return Math.round(valorAtributo * 0.85);
        }
        return valorAtributo;
    }

    private obterAtributoAtaque(posicao: string): { nome: string; campoPrisma: string } {
        if (posicao === 'ATA') return { nome: 'shooting', campoPrisma: 'finalizacao' };
        if (posicao === 'MEI') return { nome: 'passing', campoPrisma: 'passe' };
        return { nome: 'dribbling', campoPrisma: 'drible' }; // ZAG e LAT
    }

    private ordenarTabelaStandings(tabela: any[]) {
        return tabela.sort((a, b) => {
            if (b.points !== a.points) return b.points - a.points;
            if (b.goal_difference !== a.goal_difference) return b.goal_difference - a.goal_difference;
            if (b.goals_for !== a.goals_for) return b.goals_for - a.goals_for;
            if (b.wins !== a.wins) return b.wins - a.wins;

            const nomeA = normalizarTexto(a.club_name);
            const nomeB = normalizarTexto(b.club_name);
            if (nomeA !== nomeB) return nomeA < nomeB ? -1 : 1;

            return a.club_id - b.club_id;
        });
    }

    private async obterTitularesValidos(clubId: number) {
        const club = await this.prisma.clubes.findUnique({
            where: { id: clubId },
            include: {
                escalacoes: {
                    include: { jogador: true },
                },
            },
        });

        if (!club) {
            throw new NotFoundException({ message: `Clube com ID:${clubId} não encontrado.` });
        }

        if (!club.formacao || club.escalacoes.length === 0) {
            throw new ConflictException({ message: `O clube ${club.nome} não possui escalação definida.` });
        }

        const titulares = club.escalacoes
            .map((e) => e.jogador)
            .filter((j) => j.excluido_em === null && j.clube_id === clubId && j.condicao !== 'DOENTE');

        if (titulares.length !== 5) {
            throw new ConflictException({ message: `O clube ${club.nome} não possui escalação completa para jogar.` });
        }
        const ordenados = this.ordenarElenco(titulares);

        return {
            club,
            goleiro: ordenados[0],
            linha: [ordenados[1], ordenados[2], ordenados[3], ordenados[4]],
        };
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

    async createMatch(dto: CreateMatchDto) {
        if (dto.home_club_id === dto.away_club_id) {
            throw new BadRequestException({ message: 'O clube da casa e o clube visitante não podem ser o mesmo.' });
        }

        const homeClubData = await this.obterTitularesValidos(dto.home_club_id);
        const awayClubData = await this.obterTitularesValidos(dto.away_club_id);


        const duelos: any[] = [];
        let golsMandante = 0;
        let golsVisitante = 0;

        const processarDuelo = (
            ordem: number,
            clubeAtacanteId: number,
            atacante: any,
            defensor: any,
        ) => {
            const atributoAtaque = this.obterAtributoAtaque(atacante.posicao);
            const valorAtaque = Number(atacante[atributoAtaque.campoPrisma]);
            const valorAtaqueComCondicao = this.calcularValorComCondicao(valorAtaque, atacante.condicao);

            const valorDefesa = Number(defensor.defesa);
            const valorDefesaComCondicao = this.calcularValorComCondicao(valorDefesa, defensor.condicao);

            const virouGol = valorAtaqueComCondicao > valorDefesaComCondicao;

            if (virouGol) {
                if (clubeAtacanteId === dto.home_club_id) golsMandante++;
                else golsVisitante++;
            }
            duelos.push({
                ordem,
                clube_atacante_id: clubeAtacanteId,
                atacante_id: atacante.id,
                defensor_id: defensor.id,
                nome_atacante: atacante.nome,
                nome_defensor: defensor.nome,
                posicao_atacante: atacante.posicao,
                posicao_defensor: defensor.posicao,
                condicao_atacante: atacante.condicao,
                condicao_defensor: defensor.condicao,
                atributo_ataque: atributoAtaque.nome,
                atributo_defesa: 'defending',
                valor_ataque: valorAtaqueComCondicao,
                valor_defesa: valorDefesaComCondicao,
                gol: virouGol,
            });
        }

        processarDuelo(1, dto.home_club_id, homeClubData.linha[3], awayClubData.goleiro);
        processarDuelo(2, dto.home_club_id, homeClubData.linha[2], awayClubData.linha[0]);
        processarDuelo(3, dto.home_club_id, homeClubData.linha[1], awayClubData.linha[1]);


        processarDuelo(4, dto.away_club_id, awayClubData.linha[3], homeClubData.goleiro);
        processarDuelo(5, dto.away_club_id, awayClubData.linha[2], homeClubData.linha[0]);
        processarDuelo(6, dto.away_club_id, awayClubData.linha[1], homeClubData.linha[1]);

        let resultado: 'MANDANTE' | 'VISITANTE' | 'EMPATE' = 'EMPATE';
        if (golsMandante > golsVisitante) resultado = 'MANDANTE';
        else if (golsVisitante > golsMandante) resultado = 'VISITANTE';

        const agora = new Date();
        const partidaSalva = await this.prisma.$transaction(async (tx) => {
            const partida = await tx.partidas.create({
                data: {
                    mandante_id: dto.home_club_id,
                    visitante_id: dto.away_club_id,
                    gols_mandante: golsMandante,
                    gols_visitante: golsVisitante,
                    formacao_mandante: homeClubData.club.formacao!,
                    formacao_visitante: awayClubData.club.formacao!,
                    jogada_em: agora,
                },
            });
            await tx.duelos_partida.createMany({
                data: duelos.map((d) => ({
                    ...d,
                    partida_id: partida.id,
                }))
            });

            return partida;
        });

        return LeagueMapper.toMatchResponse(partidaSalva, homeClubData.club, awayClubData.club, duelos);
    }

    async getMatches(query: GetMatchesQueryDto) {
        if (query.club_id) {
            const club = await this.prisma.clubes.findUnique({
                where: { id: query.club_id },
            });
            if (!club) {
                throw new NotFoundException({ message: `Clube com ID:${query.club_id} não encontrado.` });
            }
        }

        const where: any = {};
        if (query.club_id) {
            where.OR = [
                { mandante_id: query.club_id },
                { visitante_id: query.club_id },
            ];
        }

        const partidas = await this.prisma.partidas.findMany({
            where,
            include: {
                mandante: true,
                visitante: true,
            },
            orderBy: [
                { jogada_em: 'desc' },
                { id: 'desc' },
            ],
        });

        return partidas.map((p) => LeagueMapper.toMatchSummaryItem(p));
    }

    async getMatchById(id: number) {
        const partida = await this.prisma.partidas.findUnique({
            where: { id },
            include: {
                mandante: true,
                visitante: true,
                partidas_duelos: {
                    orderBy: { ordem: 'asc' },
                },
            },
        });

        if (!partida) {
            throw new NotFoundException({ message: `Partida com ID:${id} não encontrada.` });
        }

        return LeagueMapper.toMatchDetailResponse(partida);
    }

    async getStandings() {
        const clubs = await this.prisma.clubes.findMany({
            include: {
                partidas_mandante: true,
                partidas_visitante: true,
            },
        });

        const tabela = clubs.map((c) => {
            let points = 0;
            let wins = 0;
            let draws = 0;
            let losses = 0;
            let goals_for = 0;
            let goals_against = 0;

            c.partidas_mandante.forEach((p) => {
                goals_for += p.gols_mandante;
                goals_against += p.gols_visitante;

                if (p.gols_mandante > p.gols_visitante) {
                    points += 3;
                    wins += 1;
                } else if (p.gols_mandante === p.gols_visitante) {
                    points += 1;
                    draws += 1;
                } else {
                    losses += 1;
                }
            });

            c.partidas_visitante.forEach((p) => {
                goals_for += p.gols_visitante;
                goals_against += p.gols_mandante;

                if (p.gols_visitante > p.gols_mandante) {
                    points += 3;
                    wins += 1;
                } else if (p.gols_visitante === p.gols_mandante) {
                    points += 1;
                    draws += 1;
                } else {
                    losses += 1;
                }
            });

            const played = wins + draws + losses;
            const goal_difference = goals_for - goals_against;

            return {
                club_id: c.id,
                club_name: c.nome,
                points,
                played,
                wins,
                draws,
                losses,
                goals_for,
                goals_against,
                goal_difference
            };
        });

        const tabelaOrdenada = this.ordenarTabelaStandings(tabela);

        return tabelaOrdenada.map((item, index) => LeagueMapper.toStandingItem({
            ...item,
            position: index + 1
        }));
    }
}