import { Controller, Get } from "@nestjs/common";
import { LeagueService } from "./league.service";

@Controller('standings')
export class LeagueStandingsController {
    constructor(private readonly leagueService: LeagueService){ }

    @Get()
    async getStandings() {
        return await this.leagueService.getStandings();
    }
}