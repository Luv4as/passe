import { Type } from "class-transformer";
import { IsInt, IsNotEmpty, IsString, Matches, Min } from "class-validator";

export class BuyPlayerDto {
    @IsNotEmpty({ message: 'club_id não pode ser vazio' })
    @IsInt({ message: 'club_id deve ser um número inteiro' })
    @Type(() => Number)
    @Min(1, { message: 'club_id deve ser um número inteiro positivo' })
    club_id: number;

    @IsNotEmpty({ message: 'Loyalty_until não pode ser vazio' })
    @IsString()
    @Matches(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}-03:00$/, {
        message: 'loyalty_until deve estar no formato AAAA-MM-DDTHH:MM-03:00'
    })
    loyalty_until: string;
}