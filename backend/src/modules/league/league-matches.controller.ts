import { Body, Controller, Get, Post } from "@nestjs/common";
import { CreateMatchDto } from "./dto/create-match.dto";
import { LeagueService } from "./league.service";

@Controller('matches')
export class LeagueMatchesController {
    constructor(readonly leagueService: LeagueService) { }

    @Post()
    async createMatch(
        @Body() dto: CreateMatchDto
    ) {
        return await this.leagueService.createMatch(dto);
    }

    @Get()
    async getMatches() {}

    @Get(':id')
    async getMatch() {}

}