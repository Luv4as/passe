export class PlayerMapper {
  static toResponse(player: any, overall: number, marketValue: number) {
    return {
      id: player.id,
      name: player.nome,
      position: player.posicao,
      agility: player.agilidade,
      age: player.idade,
      condition: player.condicao,
      base_value: Number(player.valor_base),
      market_value: marketValue,
      pace: player.velocidade,
      shooting: player.finalizacao,
      passing: player.passe,
      dribbling: player.drible,
      defending: player.defesa,
      physical: player.fisico,
      potential: player.potencial,
      overall: overall,
      club_id: player.clube_id ?? null,
    };
  }
}