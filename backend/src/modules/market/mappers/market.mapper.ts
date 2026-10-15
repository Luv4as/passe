export class TransactionMapper {

    static toResponse(transaction: any, contract: any, clubCash: number) {
        return {
            id: transaction.id,
            club_id: transaction.clube_id,
            player_id: transaction.jogador_id,
            player_name: transaction.nome_jogador,
            type: transaction.tipo,
            value: Number(transaction.valor),
            fee: Number(transaction.taxa),
            penalty: Number(transaction.multa),
            profit: transaction.lucro !== null ? Number(transaction.lucro) : null,
            cash_change: Number(transaction.variacao_caixa),
            created_at: transaction.criado_em,
            contract: {
                purchase_value: Number(contract.valor_compra),
                loyalty_until: contract.fidelidade_ate,
                status: contract.situacao,
            },
            club_cash: Number(clubCash),
        };
    }
}