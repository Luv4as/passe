
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePlayerDto } from './dto/create-player.dto';

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

    private calcularValorBase(dto: CreatePlayerDto): number {
        const pesos = PESOS_POSICAO[dto.posicao];
        
        if (!pesos) {
            throw new BadRequestException({ message: `Posição inválida: ${dto.posicao}` });
        }

        const overall =
            dto.velocidade * pesos.velocidade +
            dto.finalizacao * pesos.finalizacao +
            dto.passe * pesos.passe +
            dto.drible * pesos.drible +
            dto.defesa * pesos.defesa +
            dto.fisico * pesos.fisico;
        
        let valorBase = 0;
        if (overall <= 50){
            valorBase = overall * 0.1;
        } else if (overall <= 70){
            valorBase = 5.0 + (overall - 50) * 0.25;
        } else if(overall <= 85){
            valorBase = 10.0 + (overall - 70) * 0.5;
        } else {
            valorBase = 17.5 + (overall - 85) * 1.0;
        }

        if (dto.idade <= 21){
            const jovemPromessa = (22 - dto.idade) * 0.05;
            valorBase += valorBase * jovemPromessa;
        }

        return Number(valorBase.toFixed(2));
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
        return player;
    }
}
