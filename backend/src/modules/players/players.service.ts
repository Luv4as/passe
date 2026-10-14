
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
        posicao: string;
        velocidade: number;
        finalizacao: number;
        passe: number;
        dribble?: number;
        drible?: number;
        defesa: number;
        fisico: number;
    }): number {
        const pesos = PESOS_POSICAO[player.posicao];

        if (!pesos) {
            throw new BadRequestException({ message: `Posição inválida: ${player.posicao}` });
        }

        const dribleVal = player.drible ?? player.dribble ?? 0;

        const overall =
            player.velocidade * pesos.velocidade +
            player.finalizacao * pesos.finalizacao +
            player.passe * pesos.passe +
            dribleVal * pesos.drible +
            player.defesa * pesos.defesa +
            player.fisico * pesos.fisico;

        return Number(overall.toFixed(2));
    }

    private calcularValorBase(dto: CreatePlayerDto): number {
        const overall = this.calcularOverall(dto);

        let valorBase = 0;
        if (overall <= 50) {
            valorBase = overall * 0.1;
        } else if (overall <= 70) {
            valorBase = 5.0 + (overall - 50) * 0.25;
        } else if (overall <= 85) {
            valorBase = 10.0 + (overall - 70) * 0.5;
        } else {
            valorBase = 17.5 + (overall - 85) * 1.0;
        }

        if (dto.idade <= 21) {
            const jovemPromessa = (22 - dto.idade) * 0.05;
            valorBase += valorBase * jovemPromessa;
        }

        return Number(valorBase.toFixed(2));
    }

    public calcularValorMercado(player: any): number {
        const valorBase = Number(player.valor_base);

        let percDescontoCondicao = 0;
        if (player.condicao === 'MAL_CONDICIONADO') {
            percDescontoCondicao = 0.10 * (1 - player.condicao_nivel / 100);
        } else if (player.condicao === 'DOENTE') {
            percDescontoCondicao = 0.30 * (1 - player.condicao_nivel / 100);
        }

        let percAjusteIdade = 0;
        if (player.idade >= 32) {
            percAjusteIdade = (player.idade - 31) * 0.05;
        } else if (player.idade <= 21) {
            percAjusteIdade = -(22 - player.idade) * 0.03;
        }

        let percDescontoTotal = percDescontoCondicao + percAjusteIdade;
        if (percDescontoTotal > 0.40) {
            percDescontoTotal = 0.40;
        }

        let valorMercado = valorBase * (1 - percDescontoTotal);
        if (valorMercado < 1.00) {
            valorMercado = 1.00;
        }

        return Number(valorMercado.toFixed(2));
    }

    async create(dto: CreatePlayerDto) {
        const valorBase = this.calcularValorBase(dto);

        return this.prisma.jogadores.create({
            data: {
                nome: dto.nome,
                idade: dto.idade,
                posicao: dto.posicao,
                agilidade: dto.agilidade,
                velocidade: dto.velocidade,
                finalizacao: dto.finalizacao,
                passe: dto.passe,
                drible: dto.drible,
                defesa: dto.defesa,
                fisico: dto.fisico,
                potencial: dto.potencial,
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

        if (dto.idade < player.idade) {
            throw new ConflictException({ message: `A idade do jogador não pode ser reduzida. Idade atual: ${player.idade}, idade fornecida: ${dto.idade}` });
        }

        if (player.clube_id !== null && dto.posicao !== player.posicao) {
            throw new ConflictException({ message: `Um jogador vinculado a um clube não pode alterar sua posição. Posição atual: ${player.posicao}, posição fornecida: ${dto.posicao}` });
        }

        if (dto.idade >= 35 && dto.agilidade > 85) {
            throw new ConflictException({ message: `Jogadores com 35 anos ou mais não podem ter agilidade superior a 85. Idade atual: ${dto.idade}, agilidade fornecida: ${dto.agilidade}` });
        }

        return this.prisma.jogadores.update({
            where: { id },
            data: {
                nome: dto.nome,
                idade: dto.idade,
                posicao: dto.posicao,
                agilidade: dto.agilidade,
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

        if (dto.condicao == 'APTO' && player.condicao == 'DOENTE') {
            throw new ConflictException({ message: `Um jogador que está doente não pode ser marcado como APTO.` });
        }

        return this.prisma.$transaction(async (tx) => {
            if (dto.condicao == 'DOENTE') {
                await tx.escalacoes.deleteMany({
                    where: { jogador_id: id },
                });
            }

            return tx.jogadores.update({
                where: { id },
                data: {
                    condicao: dto.condicao,
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
