import { formatBrazilianDate } from "../../../common/utils/csv.utils";
import { calcularOverall, calcularValorMercado } from "../../../common/utils/player.utils";

export class LeagueMapper {
    static toPlayerItem(player: any) {

        return {
            id: player.id,
            name: player.nome,
            position: player.posicao,
            agility: player.agilidade,
            age: player.idade,
            condition: player.condicao,
            base_value: Number(player.valor_base),
            market_value: calcularValorMercado(player),
            pace: player.velocidade,
            shooting: player.finalizacao,
            passing: player.passe,
            dribbling: player.drible,
            defending: player.defesa,
            physical: player.fisico,
            potential: player.potencial,
            overall: calcularOverall(player),
            club_id: player.clube_id,
        };
    }

    static toLineupResponse(params: {
        clubId: number;
        formation: string | null;
        complete: boolean;
        players: any[];
    }) {
        const { clubId, formation, complete, players } = params;

        return {
            club_id: clubId,
            formation,
            complete,
            players: players.map((p) => this.toPlayerItem(p)),
        }
    }

    static toMatchResponse(partida: any, homeClub: any, awayClub: any, duelos: any[]) {
        return {
            id: partida.id,
            played_at: formatBrazilianDate(partida.jogada_em),
            home: {
                club_id: homeClub.id,
                club_name: homeClub.nome,
                formation: partida.formacao_mandante,
                goals: partida.gols_mandante,
            },
            away: {
                club_id: awayClub.id,
                club_name: awayClub.nome,
                formation: partida.formacao_visitante,
                goals: partida.gols_visitante,
            },
            result: partida.gols_mandante > partida.gols_visitante
                ? 'MANDANTE'
                : partida.gols_visitante > partida.gols_mandante
                    ? 'VISITANTE'
                    : 'EMPATE',
            duels: duelos.map((d) => ({
                order: d.ordem,
                attacking_club_id: d.clube_atacante_id,
                attacker: {
                    player_id: d.atacante_id,
                    player_name: d.nome_atacante,
                    position: d.posicao_atacante,
                    condition: d.condicao_atacante,
                    attribute: d.atributo_ataque,
                    value: d.valor_ataque,
                },
                defender: {
                    player_id: d.defensor_id,
                    player_name: d.nome_defensor,
                    position: d.posicao_defensor,
                    condition: d.condicao_defensor,
                    attribute: d.atributo_defesa,
                    value: d.valor_defesa,
                },
                goal: d.gol,
            })),
        };
    }

    static toMatchSummaryItem(partida: any) {
        return {
            id: partida.id,
            played_at: formatBrazilianDate(partida.jogada_em),
            home: {
                club_id: partida.mandante.id,
                club_name: partida.mandante.nome,
                formation: partida.formacao_mandante,
                goals: partida.gols_mandante,
            },
            away: {
                club_id: partida.visitante.id,
                club_name: partida.visitante.nome,
                formation: partida.formacao_visitante,
                goals: partida.gols_visitante,
            },
            result:
                partida.gols_mandante > partida.gols_visitante
                    ? 'MANDANTE'
                    : partida.gols_visitante > partida.gols_mandante
                        ? 'VISITANTE'
                        : 'EMPATE',
        };
    }

    static toMatchDetailResponse(partida: any) {

        const duelosList = partida.partidas_duelos || partida.duelos || [];

        return {
            ...this.toMatchSummaryItem(partida),
            duels: duelosList.map((d: any) => ({
                order: d.ordem,
                attacking_club_id: d.clube_atacante_id,
                attacker: {
                    player_id: d.atacante_id,
                    player_name: d.nome_atacante,
                    position: d.posicao_atacante,
                    condition: d.condicao_atacante,
                    attribute: d.atributo_ataque,
                    value: d.valor_ataque,
                },
                defender: {
                    player_id: d.defensor_id,
                    player_name: d.nome_defensor,
                    position: d.posicao_defensor,
                    condition: d.condicao_defensor,
                    attribute: d.atributo_defesa,
                    value: d.valor_defesa,
                },
                goal: d.gol,
            })),
        };
    }

    static toStandingItem(item: any) {
        return {
            position: item.position,
            club_id: item.club_id,
            club_name: item.club_name,
            points: item.points,
            played: item.played,
            wins: item.wins,
            draws: item.draws,
            losses: item.losses,
            goals_for: item.goals_for,
            goals_against: item.goals_against,
            goal_difference: item.goal_difference,
        };
    }

}