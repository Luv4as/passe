// src/modules/players/dto/update-condition.dto.ts
import { IsEnum, IsNotEmpty } from 'class-validator';

export enum PlayerCondition {
    APTO = 'APTO',
    MAL_CONDICIONADO = 'MAL_CONDICIONADO',
    DOENTE = 'DOENTE',
}

export class UpdateConditionDto {
    @IsNotEmpty()
    @IsEnum(PlayerCondition, {
    message: 'A condição deve ser APTO, MAL_CONDICIONADO ou DOENTE',
  })
    condition: 'APTO' | 'MAL_CONDICIONADO' | 'DOENTE';
}