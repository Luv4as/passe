import { Type } from "class-transformer";
import { IsInt, IsNotEmpty, IsNumber, IsString, Matches, Min } from "class-validator";

export class BuyPlayerDto {
    @IsNotEmpty({ message: 'club_id não pode ser vazio' })
    @IsInt({ message: 'club_id deve ser um número inteiro' })
    @Type(() => Number)
    @Min(1, { message: 'club_id deve ser um número inteiro positivo' })
    club_id: number;

    @IsNotEmpty({ message: 'Loyalty_until não pode ser vazio' })
    @IsString()
    @Matches(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?-03:00$|^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}-03:00$/,
        {
            message:
                'loyalty_until deve estar no formato ISO com fuso -03:00 (ex: 2027-03-02T10:15:00-03:00 ou 2027-03-02T10:15-03:00)',
        })
    loyalty_until: string;
}