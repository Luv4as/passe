import { Parser } from '@json2csv/plainjs';

export function generateTransactionsCsv(transactions: any[]): string {
    const data = transactions.map((t) => ({
        data_hora: t.criado_em instanceof Date
            ? t.criado_em.toISOString().replace('Z', '-03:00')
            : String(t.criado_em),
        tipo: t.tipo,
        jogador: t.nome_jogador,
        valor: Number(t.valor).toFixed(2).replace('.', ','),
        taxa_ou_comissao: Number(t.taxa).toFixed(2).replace('.', ','),
        multa: Number(t.multa).toFixed(2).replace('.', ','),
        lucro: t.lucro !== null && t.lucro !== undefined ? Number(t.lucro).toFixed(2).replace('.', ',') : '',
        variacao_caixa: Number(t.variacao_caixa).toFixed(2).replace('.', ','),
    }));

    const parser = new Parser({
        delimiter: ';',
        header: true,
        fields: [
            'data_hora',
            'tipo',
            'jogador',
            'valor',
            'taxa_ou_comissao',
            'multa',
            'lucro',
            'variacao_caixa',
        ],
    });

    const csv = parser.parse(data);
    return csv.endsWith('\n') ? csv : `${csv}\n`;
}