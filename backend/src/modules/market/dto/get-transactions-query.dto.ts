import { IsInt, IsOptional, IsString, Matches, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class GetTransactionsQueryDto {
  @IsOptional()
  @IsString()
  @Matches(/^(COMPRA|VENDA)(,(COMPRA|VENDA))*$/, {
    message: 'type deve ser COMPRA, VENDA ou COMPRA,VENDA em maiúsculas.',
  })
  type?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'player_id deve ser um número inteiro' })
  @Min(1, { message: 'player_id deve ser um número inteiro positivo' })
  player_id?: number;
}