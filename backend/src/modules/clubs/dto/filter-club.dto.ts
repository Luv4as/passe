import { IsEnum, IsOptional } from "class-validator";

export enum ClubSortOptions {
    NAME = 'name',
    NET_WORTH_ASC = 'net_worth_asc',
    NET_WORTH_DESC = 'net_worth_desc',
}

export class FilterClubDto {
    @IsOptional()
    @IsEnum(ClubSortOptions, { message: 'sort deve ser um dos seguintes valores: name, net_worth_asc, net_worth_desc' })
    sort?: ClubSortOptions = ClubSortOptions.NAME;
}