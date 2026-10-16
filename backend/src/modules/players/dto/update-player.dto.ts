// src/modules/players/dto/update-player.dto.ts
import { IsEnum, IsInt, IsNotEmpty, IsString, Max, MaxLength, Min, MinLength } from 'class-validator';

export class UpdatePlayerDto {
    @IsString()
    @IsNotEmpty()
    @MinLength(3, { message: 'name deve ter no mínimo 3 caracteres' })
    @MaxLength(100, { message: 'name deve ter no máximo 100 caracteres' })
    name: string;

    @IsEnum(['GOL', 'ZAG', 'LAT', 'MEI', 'ATA'], {
        message: 'position deve ser GOL, ZAG, LAT, MEI ou ATA',
    })
    position: 'GOL' | 'ZAG' | 'LAT' | 'MEI' | 'ATA';

    @IsInt()
    @Min(16)
    @Max(45)
    age: number;

    @IsInt()
    @Min(1)
    @Max(100)
    agility: number;
}