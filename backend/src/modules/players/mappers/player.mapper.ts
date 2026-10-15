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

  static toSquadPlayerResponse(
    jogador: any,
    overall: number,
    marketValue: number,
    clubeId: number,
  ) {
    const contratoAtivo = jogador.contratos?.[0];

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
      club_id: clubeId,
      contract: contratoAtivo
        ? {
          purchase_value: Number(contratoAtivo.valor_compra),
          loyalty_until: contratoAtivo.fidelidade_ate,
          remaining_days: remainingDays,
          penalty_rate: penaltyRate,
        }
        : null,
    };
  }
}