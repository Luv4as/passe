import { calcularValorMercado } from "../../../common/utils/player.utils";

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
            overall: player.overall,
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
}