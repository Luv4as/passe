// src/modules/players/dto/create-player.dto.ts
import { IsDecimal, IsInt, IsNotEmpty, IsString, Max, Min } from 'class-validator';

export class CreatePlayerDto {
    @IsString()
    @IsNotEmpty()
    nome: string;

    @IsString()
    @IsNotEmpty()
    posicao: 'GOL' | 'ZAG' | 'LAT' | 'MEI' | 'ATA';
    
    @IsInt()
    @Min(16)
    @Max(45)
    idade: number;
    
    @IsString()
    @IsNotEmpty()
    condicao: 'APTO' | 'MAL_CONDICIONADO' | 'DOENTE';
    
    @IsInt()
    @Min(1)
    @Max(100)
    agilidade: number;

    @IsInt()
    @Min(1)
    @Max(99)
    velocidade: number;

    @IsInt()
    @Min(1)
    @Max(99)
    finalizacao: number;

    @IsInt()
    @Min(1)
    @Max(99)
    passe: number;

    @IsInt()
    @Min(1)
    @Max(99)
    drible: number;

    @IsInt()
    @Min(1)
    @Max(99)
    defesa: number;

    @IsInt()
    @Min(1)
    @Max(99)
    fisico: number;

    @IsInt()
    @Min(1)
    @Max(99)
    potencial: number;
}