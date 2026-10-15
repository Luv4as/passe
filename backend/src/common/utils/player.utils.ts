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