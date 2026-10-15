
import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePlayerDto } from './dto/create-player.dto';
import { UpdateConditionDto } from './dto/update-condition.dto';
import { UpdatePlayerDto } from './dto/update-player.dto';
import { PlayerMapper } from './mappers/player.mapper';
import { FilterPlayerDto } from './dto/filter-player.dto';
import { compararNomes, normalizarTexto } from '../../common/utils/string.util';

const PESOS_POSICAO: Record<string, Record<string, number>> = {
    GOL: { velocidade: 0.10, finalizacao: 0.00, passe: 0.20, drible: 0.00, defesa: 0.40, fisico: 0.30 },
    ZAG: { velocidade: 0.10, finalizacao: 0.00, passe: 0.15, drible: 0.00, defesa: 0.45, fisico: 0.30 },
    LAT: { velocidade: 0.25, finalizacao: 0.00, passe: 0.20, drible: 0.15, defesa: 0.25, fisico: 0.15 },
    MEI: { velocidade: 0.10, finalizacao: 0.15, passe: 0.35, drible: 0.25, defesa: 0.05, fisico: 0.10 },
    ATA: { velocidade: 0.20, finalizacao: 0.40, passe: 0.10, drible: 0.20, defesa: 0.00, fisico: 0.10 },
};

function ordenarJogadores(mapped: any[], sortOption: string = 'name'): any[] {
  const posOrder: Record<string, number> = { GOL: 1, ZAG: 2, LAT: 3, MEI: 4, ATA: 5 };

  return mapped.sort((a, b) => {
    let diff = 0;

    if (sortOption === 'position') {
      diff = (posOrder[a.position] || 99) - (posOrder[b.position] || 99);
    } else if (sortOption === 'value_desc') {
      diff = b.market_value - a.market_value;
    } else if (sortOption === 'value_asc') {
      diff = a.market_value - b.market_value;
    } else if (sortOption === 'age_desc') {
      diff = b.age - a.age;
    } else if (sortOption === 'age_asc') {
      diff = a.age - b.age;
    }

    if (diff !== 0) return diff;

    const diffNome = compararNomes(a.name, b.name);
    if (diffNome !== 0) return diffNome;

    return a.id - b.id;
  });
}

@Injectable()
export class PlayersService {
    constructor(private readonly prisma: PrismaService) { }

    private calcularOverall(player: any): number {
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
            parteOverall += (Math.min(overall, 60) - 40) * 0.5;
        }
        if (overall > 60) {
            parteOverall += (Math.min(overall, 75) - 60) * 2.0;
        }
        if (overall > 75) {
            parteOverall += (overall - 75) * 6.0;
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

    public calcularValorMercado(player: any): number {
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

    async create(dto: CreatePlayerDto) {
        const atributos = [
            dto.pace,
            dto.shooting,
            dto.passing,
            dto.dribbling,
            dto.defending,
            dto.physical,
        ];
        const maiorArtibuto = Math.max(...atributos);
        const somaAtributos = atributos.reduce((total, val) => total + val, 0);

        if(somaAtributos > 480){
            throw new BadRequestException({ message: `A soma dos atributos não pode ser maior que 480. Soma atual: ${somaAtributos}` });
        }
        if(dto.potential < maiorArtibuto){
            throw new BadRequestException({ message: `O potencial do jogador não pode ser menor que o maior atributo. Potencial atual: ${dto.potential}, maior atributo: ${maiorArtibuto}` });
        }

        if(dto.age >= 35 && dto.agility > 85){
            throw new BadRequestException({ message: `Jogadores com 35 anos ou mais não podem ter agilidade superior a 85. Idade atual: ${dto.age}, agilidade fornecida: ${dto.agility}` });
        }

        const nomeLimpo = dto.name.trim().replace(/\s+/g, ' ');
        const palavras = nomeLimpo.split(' ');

        if (palavras.length < 2) {
            throw new BadRequestException({ message: 'O nome do jogador deve conter pelo menos duas palavras.'});
        }

        if (/\d/.test(nomeLimpo)){
            throw new BadRequestException({ message: 'O nome do jogador não pode conter números.'});
        }
        const valorBase = this.calcularValorBase(dto);

        const player = await this.prisma.jogadores.create({
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
        });

        const overall = this.calcularOverall(player);
        const marketValue = this.calcularValorMercado(player);

        return PlayerMapper.toResponse(player, overall, marketValue);
    }

    async findAll(query: FilterPlayerDto) {
        if (query.free == true && query.club_id) {
            throw new BadRequestException({ message: 'Não é possível filtrar jogadores livres e por clube ao mesmo tempo.' });
        }

        if (query.min_age && query.max_age && query.min_age > query.max_age) {
            throw new BadRequestException({ message: 'O valor de min_age não pode ser maior que max_age.' });
        }

        if (query.min_value && query.max_value && query.min_value > query.max_value) {
            throw new BadRequestException({ message: 'O valor de min_value não pode ser maior que max_value.' });
        }

        const where: any = { excluido_em: null };

        if (query.position) where.posicao = query.position;
        if (query.condition) where.condicao = query.condition;
        
        if (query.free === true) where.clube_id = null;
        else if(query.free === false) where.clube_id = {not: null};

        if (query.club_id) {
            const clubExists = await this.prisma.clubes.findUnique({
                where: { id: query.club_id },
            });
            if (!clubExists) {
                throw new NotFoundException({ message: `Clube com id${query.club_id} não encontrado.` });
            }
            where.clube_id = query.club_id;
        }

        if (query.min_age || query.max_age) {
            where.idade = {};
            if (query.min_age) where.idade.gte = query.min_age;
            if (query.max_age) where.idade.lte = query.max_age;
        }

        let players = await this.prisma.jogadores.findMany({ where })

        if (query.search) {
            const normalizedSearch = normalizarTexto(query.search);

            players = players.filter((p) => {
                const normalizedPlayerName = normalizarTexto(p.nome);
                return normalizedPlayerName.includes(normalizedSearch);
            });
        }

        let mapped = players.map((p) => {
            const overall = this.calcularOverall(p);
            const marketValue = this.calcularValorMercado(p);
            return PlayerMapper.toResponse(p, overall, marketValue);
        })

        if (query.min_value !== undefined) {
            mapped = mapped.filter((p) => p.market_value >= query.min_value!);
        }
        if (query.max_value !== undefined) {
            mapped = mapped.filter((p) => p.market_value <= query.max_value!);
        }

        mapped = ordenarJogadores(mapped, query.sort);

        const totalItems = mapped.length;
        const page = query.page || 1;
        const limit = query.limit || 10;
        const totalPages = Math.ceil(totalItems / limit) || 0;

        const startIndex = (page - 1) * limit;
        const paginatedData = mapped.slice(startIndex, startIndex + limit);

        return {
            data: paginatedData,
            meta: {
                page,
                limit,
                total_items: totalItems,
                total_pages: totalPages,
            }
        }
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
        return PlayerMapper.toResponse(player, overall, marketValue);
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
            throw new BadRequestException({ message: `Jogadores com 35 anos ou mais não podem ter agilidade superior a 85. Idade atual: ${dto.age}, agilidade fornecida: ${dto.agility}` });
        }

        const updated = await this.prisma.jogadores.update({
            where: { id },
            data: {
                nome: dto.name,
                idade: dto.age,
                posicao: dto.position,
                agilidade: dto.agility,
            },
        });

        const overall = this.calcularOverall(updated);
        const marketValue = this.calcularValorMercado(updated);

        return PlayerMapper.toResponse(updated, overall, marketValue);
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

        const updated = await this.prisma.$transaction(async (tx) => {
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
        const overall = this.calcularOverall(updated);
        const marketValue = this.calcularValorMercado(updated);

        return PlayerMapper.toResponse(updated, overall, marketValue);
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

        await this.prisma.jogadores.update({
            where: { id },
            data: { excluido_em: new Date() },
        });
    }
}
