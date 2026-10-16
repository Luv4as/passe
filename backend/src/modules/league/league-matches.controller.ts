import { Controller, Get, Post } from "@nestjs/common";

@Controller('matches')
export class LeagueMatchesController {

    @Post()
    async createMatch() {}

    @Get()
    async getMatches() {}

    @Get(':id')
    async getMatch() {}

}