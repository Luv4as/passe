// src/modules/players/dto/update-player.dto.ts
import { IsInt, IsNotEmpty, IsString, Max, Min } from 'class-validator';

export class UpdatePlayerDto {
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
    
    @IsInt()
    @Min(1)
    @Max(100)
    agilidade: number;
}