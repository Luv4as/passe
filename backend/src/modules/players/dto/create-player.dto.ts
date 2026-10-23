import { Transform } from 'class-transformer';
import { IsEnum, IsInt, IsNotEmpty, IsString, Max, MaxLength, Min, MinLength } from 'class-validator';

export class CreatePlayerDto {
    @IsString()
    @IsNotEmpty()
    @Transform(({ value }) => {
        if (typeof value !== 'string') return value;
        const withoutControlCharacters = Array.from(value)
            .filter((character) => {
                const code = character.charCodeAt(0);
                return !(code <= 0x1f || (code >= 0x7f && code <= 0x9f));
            })
            .join('');

        return withoutControlCharacters
            .trim()
            .replace(/\s+/g, ' ');
    })
    @MinLength(3, { message: 'name deve ter no mínimo 3 caracteres' })
    @MaxLength(100, { message: 'name deve ter no máximo 100 caracteres' })
    name: string;

    @IsEnum(['GOL', 'ZAG', 'LAT', 'MEI', 'ATA'], {
        message: 'Posição deve ser GOL, ZAG, LAT, MEI ou ATA',
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

    @IsInt()
    @Min(1)
    @Max(99)
    pace: number;

    @IsInt()
    @Min(1)
    @Max(99)
    shooting: number;

    @IsInt()
    @Min(1)
    @Max(99)
    passing: number;

    @IsInt()
    @Min(1)
    @Max(99)
    dribbling: number;

    @IsInt()
    @Min(1)
    @Max(99)
    defending: number;

    @IsInt()
    @Min(1)
    @Max(99)
    physical: number;

    @IsInt()
    @Min(1)
    @Max(99)
    potential: number;
}