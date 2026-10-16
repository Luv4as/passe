export class TransactionMapper {
    static toTransactionItem(t: any) {
        return {
            id: t.id,
            club_id: t.clube_id,
            player_id: t.jogador_id,
            player_name: t.nome_jogador,
            type: t.tipo,
            value: Number(t.valor),
            fee: Number(t.taxa),
            penalty: Number(t.multa),
            profit: t.lucro !== null ? Number(t.lucro) : null,
            cash_change: Number(t.variacao_caixa),
            created_at: t.criado_em,
        };
    }

    static toTransactionsResponse(transactions: any[], summaryData: any) {
        return {
            data: transactions.map((t) => this.toTransactionItem(t)),
            summary: {
                total_spent: Number(summaryData.total_spent.toFixed(2)),
                total_received: Number(summaryData.total_received.toFixed(2)),
                total_fees: Number(summaryData.total_fees.toFixed(2)),
                total_penalties: Number(summaryData.total_penalties.toFixed(2)),
                total_profit: Number(summaryData.total_profit.toFixed(2)),
            },
        };
    }

    static toBuyResponse(transaction: any, contract: any, clubCash: number) {
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

    static toSellResponse(params: {
        transaction: any;
        purchaseValue: number;
        remainingDays: number;
        penaltyRate: number;
        contractStatus: string;
        clubCash: number;
    }) {
        const { transaction, purchaseValue, remainingDays, penaltyRate, contractStatus, clubCash } = params;
        return {
            id: transaction.id,
            club_id: transaction.clube_id,
            player_id: transaction.jogador_id,
            player_name: transaction.nome_jogador,
            type: transaction.tipo,
            value: Number(transaction.valor),
            fee: Number(transaction.taxa),
            penalty: Number(transaction.multa),
            profit: Number(transaction.lucro),
            cash_change: Number(transaction.variacao_caixa),
            created_at: transaction.criado_em,
            purchase_value: Number(purchaseValue),
            remaining_days: remainingDays,
            penalty_rate: penaltyRate,
            contract_status: contractStatus,
            club_cash: Number(clubCash),
        };
    }
}