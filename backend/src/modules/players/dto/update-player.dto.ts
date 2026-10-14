// src/modules/players/dto/update-player.dto.ts
import { IsInt, IsNotEmpty, IsString, Max, Min } from 'class-validator';

export class UpdatePlayerDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
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