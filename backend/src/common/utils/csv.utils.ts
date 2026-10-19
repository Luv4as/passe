import { Parser } from '@json2csv/plainjs';

export function formatBrazilianDate(dateInput: Date | string): string {
    const date = new Date(dateInput);
    const offsetMs = -3 * 60 * 60 * 1000;
    const localDate = new Date(date.getTime() + offsetMs);

    const iso = localDate.toISOString();
    return iso.substring(0, 19) + '-03:00';
}

export function generateTransactionsCsv(transactions: any[]): string {
    const data = transactions.map((t) => ({
        data_hora: formatBrazilianDate(t.criado_em),
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