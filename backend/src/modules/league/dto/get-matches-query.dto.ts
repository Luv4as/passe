import { IsInt, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class GetMatchesQueryDto {
    @IsOptional()
    @Type(() => Number)
    @IsInt({ message: 'club_id deve ser um número inteiro.' })
    @Min(1, { message: 'club_id deve ser um inteiro positivo.' })
    club_id?: number;
}