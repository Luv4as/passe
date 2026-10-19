import { ArrayMinSize, ArrayMaxSize, IsArray, IsEnum, IsInt, IsNotEmpty, Min, ArrayUnique } from 'class-validator';

export enum FormationEnum {
    F_3_1 = '3-1',
    F_2_2 = '2-2',
    F_2_1_1 = '2-1-1',
    F_1_2_1 = '1-2-1',
}

export class SetLineupDto {
    @IsNotEmpty({ message: 'formation não pode ser vazia.' })
    @IsEnum(FormationEnum, { message: 'formation deve ser 3-1, 2-2, 2-1-1 ou 1-2-1.' })
    formation: string;

    @IsNotEmpty({ message: 'player_ids não pode ser vazio.' })
    @IsArray({ message: 'player_ids deve ser um array de inteiros.' })
    @ArrayMinSize(5, { message: 'player_ids deve conter exatamente 5 jogadores.' })
    @ArrayMaxSize(5, { message: 'player_ids deve conter exatamente 5 jogadores.' })
    @ArrayUnique({ message: 'player_ids não pode conter IDs repetidos.' })
    @IsInt({ each: true, message: 'Cada id em player_ids deve ser um número inteiro.' })
    @Min(1, { each: true, message: 'Cada id em player_ids deve ser um inteiro positivo.' })
    player_ids: number[];
}