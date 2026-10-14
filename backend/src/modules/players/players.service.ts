
import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePlayerDto } from './dto/create-player.dto';
import { UpdateConditionDto } from './dto/update-condition.dto';
import { UpdatePlayerDto } from './dto/update-player.dto';

const PESOS_POSICAO: Record<string, Record<string, number>> = {
    GOL: { velocidade: 0.10, finalizacao: 0.00, passe: 0.20, drible: 0.00, defesa: 0.40, fisico: 0.30 },
    ZAG: { velocidade: 0.10, finalizacao: 0.00, passe: 0.15, drible: 0.00, defesa: 0.45, fisico: 0.30 },
    LAT: { velocidade: 0.25, finalizacao: 0.00, passe: 0.20, drible: 0.15, defesa: 0.25, fisico: 0.15 },
    MEI: { velocidade: 0.10, finalizacao: 0.15, passe: 0.35, drible: 0.25, defesa: 0.05, fisico: 0.10 },
    ATA: { velocidade: 0.20, finalizacao: 0.40, passe: 0.10, drible: 0.20, defesa: 0.00, fisico: 0.10 },
};

@Injectable()
export class PlayersService {
    constructor(private readonly prisma: PrismaService) { }

    private calcularOverall(player: {
        position?: string;
        posicao?: string;
        pace?: number;
        velocidade?: number;
        shooting?: number;
        finalizacao?: number;
        passing?: number;
        passe?: number;
        dribbling?: number;
        drible?: number;
        defending?: number;
        defesa?: number;
        physical?: number;
        fisico?: number;
    }): number {
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

    private calcularValorBase(dto: CreatePlayerDto): number {
        const overall = this.calcularOverall(dto);

        let parteOverall = 0;
        if (overall > 40) {
            const faixa1 = Math.min(overall, 60) - 40;
            parteOverall += faixa1 * 0.5;
        } else if (overall > 60) {
            const faixa2 = Math.min(overall, 75) - 60;
            parteOverall += faixa2 * 2.0;
        } else if (overall > 75) {
            const faixa3 = overall - 75;
            parteOverall += faixa3 * 6.0;
        }
        let valorBase = parteOverall;

        if (dto.age <= 21) {
            valorBase = parteOverall * ((100 + dto.potential - overall) / 100);
        }

        if (valorBase < 1.0) {
            valorBase = 1.0;
        }

        return Number(valorBase.toFixed(2));
    }

    private calcularDescontoCondicao(player: { condition: string; agility: number }): number {
        if (player.condition === 'APTO') {
            return 0;
        }
        let baseDesconto = player.condition === 'MAL_CONDICIONADO' ? 15 : 30;

        if (player.agility >= 80) {
            baseDesconto /= 2;
        } else if (player.agility <= 30) {
            baseDesconto += 10;
        }

        return baseDesconto;
    }

    public calcularValorMercado(player: any): number {
        const valorBase = Number(player.valor_base);
        const descontoCondicao = this.calcularDescontoCondicao(player);

        let ajusteIdade = 0;
        if (player.age <= 21) {
            ajusteIdade = 10;
        } else if (player.age >= 32) {
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

    async create(dto: CreatePlayerDto) {
        const valorBase = this.calcularValorBase(dto);

        return this.prisma.jogadores.create({
            data: {
                nome: dto.name,
                idade: dto.age,
                posicao: dto.position,
                agilidade: dto.agility,
                velocidade: dto.pace,
                finalizacao: dto.shooting,
                passe: dto.passing,
                drible: dto.dribbling,
                defesa: dto.defending,
                fisico: dto.physical,
                potencial: dto.potential,
                condicao: 'APTO',
                valor_base: valorBase,
            },
        })
    }

    async findAll() {
        return this.prisma.jogadores.findMany({
            where: { excluido_em: null },
        });
    }

    async findOne(id: number) {
        const player = await this.prisma.jogadores.findFirst({
            where: { id, excluido_em: null },
        });

        if (!player) {
            throw new NotFoundException({ message: `Jogador com id ${id} não encontrado` });
        }

        const overall = this.calcularOverall(player);
        const marketValue = this.calcularValorMercado(player);
        return {
            ...player,
            overall,
            valor_mercado: marketValue,
        };
    }

    async update(id: number, dto: UpdatePlayerDto) {
        const player = await this.prisma.jogadores.findFirst({
            where: { id, excluido_em: null },
        });

        if (!player) {
            throw new NotFoundException({ message: `Jogador com ID:${id} não encontrado` });
        }

        if (dto.age < player.idade) {
            throw new ConflictException({ message: `A idade do jogador não pode ser reduzida. Idade atual: ${player.idade}, idade fornecida: ${dto.age}` });
        }

        if (player.clube_id !== null && dto.position !== player.posicao) {
            throw new ConflictException({ message: `Um jogador vinculado a um clube não pode alterar sua posição. Posição atual: ${player.posicao}, posição fornecida: ${dto.position}` });
        }

        if (dto.age >= 35 && dto.agility > 85) {
            throw new ConflictException({ message: `Jogadores com 35 anos ou mais não podem ter agilidade superior a 85. Idade atual: ${dto.age}, agilidade fornecida: ${dto.agility}` });
        }

        return this.prisma.jogadores.update({
            where: { id },
            data: {
                nome: dto.name,
                idade: dto.age,
                posicao: dto.position,
                agilidade: dto.agility,
            },
        });
    }

    async updateCondition(id: number, dto: UpdateConditionDto) {

        const player = await this.prisma.jogadores.findFirst({
            where: { id, excluido_em: null },
        });

        if (!player) {
            throw new NotFoundException({ message: `Jogador com ID:${id} não encontrado.` });
        }

        if (dto.condition == 'APTO' && player.condicao == 'DOENTE') {
            throw new ConflictException({ message: `Um jogador que está doente não pode ser marcado como APTO.` });
        }

        return this.prisma.$transaction(async (tx) => {
            if (dto.condition == 'DOENTE') {
                await tx.escalacoes.deleteMany({
                    where: { jogador_id: id },
                });
            }

            return tx.jogadores.update({
                where: { id },
                data: {
                    condicao: dto.condition,
                },
            });
        });
    }

    async deletePlayer(id: number) {
        const player = await this.prisma.jogadores.findFirst({
            where: { id, excluido_em: null },
        });

        if (!player) {
            throw new NotFoundException({ message: `Jogador com ID:${id} não encontrado.` });
        }

        if (player.clube_id !== null) {
            throw new ConflictException({ message: `Um jogador vinculado a um clube não pode ser excluído. Clube atual: ${player.clube_id}` });
        }

        return this.prisma.jogadores.update({
            where: { id },
            data: {
                excluido_em: new Date(),
            },
        });
    }
}
