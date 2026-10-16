import { Type } from "class-transformer";
import { IsInt, IsNotEmpty, Min } from "class-validator";

export class CreateMatchDto {

    @IsInt({ message: 'O id do clube da casa deve ser um número inteiro.' })
    @Type(() => Number)
    @IsNotEmpty({ message: 'home_club_id não pode ser vazio' })
    @Min(1, { message: 'O id do clube da casa deve ser um inteiro positivo.' })
    home_club_id: number;

    @IsInt({ message: 'O id do clube visitante deve ser um número inteiro.' })
    @Type(() => Number)
    @IsNotEmpty({ message: 'away_club_id não pode ser vazio' })
    @Min(1, { message: 'O id do clube visitante deve ser um inteiro positivo.' })
    away_club_id: number;
}