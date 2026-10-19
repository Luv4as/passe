import { BadRequestException } from "@nestjs/common/exceptions/index.js";

export function calcularValorMercado(player: any): number {
    const valorBase = Number(player.valor_base);
    let descontoCondicao = 0;

    if (player.condicao !== 'APTO') {
        descontoCondicao = player.condicao === 'MAL_CONDICIONADO' ? 15 : 30;
        if (player.agilidade >= 80) descontoCondicao /= 2;
        else if (player.agilidade <= 30) descontoCondicao += 10;
    }

    const idade = player.age ?? player.idade ?? 0;

    let ajusteIdade = 0;
    if (idade <= 21) {
        ajusteIdade = 10;
    } else if (idade >= 32) {
        ajusteIdade = -10;
    }

    let percDescontoTotal = ajusteIdade - descontoCondicao;
    if (percDescontoTotal < -40) {
        percDescontoTotal = -40;
    }

    let valorMercado = valorBase * ((100 + percDescontoTotal) / 100);
    if (valorMercado < 1.0) {
        valorMercado = 1.0;
    }

    return Number(valorMercado.toFixed(2));
}

const PESOS_POSICAO: Record<string, Record<string, number>> = {
    GOL: { velocidade: 0.10, finalizacao: 0.00, passe: 0.20, drible: 0.00, defesa: 0.40, fisico: 0.30 },
    ZAG: { velocidade: 0.10, finalizacao: 0.00, passe: 0.15, drible: 0.00, defesa: 0.45, fisico: 0.30 },
    LAT: { velocidade: 0.25, finalizacao: 0.00, passe: 0.20, drible: 0.15, defesa: 0.25, fisico: 0.15 },
    MEI: { velocidade: 0.10, finalizacao: 0.15, passe: 0.35, drible: 0.25, defesa: 0.05, fisico: 0.10 },
    ATA: { velocidade: 0.20, finalizacao: 0.40, passe: 0.10, drible: 0.20, defesa: 0.00, fisico: 0.10 },
};

export function calcularOverall(player: any): number {
    const posicao = player.position ?? player.posicao ?? '';
    const velocidade = player.pace ?? player.velocidade ?? 0;
    const finalizacao = player.shooting ?? player.finalizacao ?? 0;
    const passe = player.passing ?? player.passe ?? 0;
    const drible = player.dribbling ?? player.drible ?? 0;
    const defesa = player.defending ?? player.defesa ?? 0;
    const fisico = player.physical ?? player.fisico ?? 0;
    const pesos = PESOS_POSICAO[posicao];

    if (!pesos) {
        throw new BadRequestException({ message: `Posição inválida: ${player.posicao}` });
    }

    const somaProdutos =
        velocidade * pesos.velocidade +
        finalizacao * pesos.finalizacao +
        passe * pesos.passe +
        drible * pesos.drible +
        defesa * pesos.defesa +
        fisico * pesos.fisico;

    return Math.round(somaProdutos);
}