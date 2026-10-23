import { IsNotEmpty, IsString, Matches, MaxLength, MinLength } from "class-validator";

export class CreateClubsDto {
    @IsString()
    @IsNotEmpty({ message: 'name não pode ser vazio' })
    @MinLength(3, { message: 'name deve ter no mínimo 3 caracteres' })
    @MaxLength(60, { message: 'name deve ter no máximo 60 caracteres' })
    @Matches(/^[a-zA-ZÀ-ÿ\s.-]+$/, {
        message: 'name deve conter apenas letras, espaços, hífen e ponto',
    })
    name: string;

    @IsString()
    @IsNotEmpty({ message: 'acronym não pode ser vazio' })
    @MinLength(3, { message: 'acronym deve ter exatamente 3 caracteres' })
    @MaxLength(3, { message: 'acronym deve ter exatamente 3 caracteres' })
    @Matches(/^[A-Z]{3}$/, {
        message: 'acronym deve conter exatamente 3 letras maiúsculas sem acento',
    })
    acronym: string;
}