import { Controller, Get } from "@nestjs/common";

@Controller('standings')
export class LeagueStandingsController {

    @Get()
    async getStandings() {}

}