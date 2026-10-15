import { IsOptional, IsString, Matches } from 'class-validator';
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
  player_id?: number;
}