import { Body, Controller, Get, Param, Put } from "@nestjs/common";
import { ParseIdPipe } from "../../common/pipes/parse-id.pipe";
import { SetLineupDto } from "./dto/set-lineup.dto";
import { LeagueService } from "./league.service";

@Controller('clubs')
export class LeagueClubsController {
    constructor(private readonly leagueService: LeagueService) { }

    @Put(':id/lineup')
    async updateLineup(
        @Param('id', ParseIdPipe) clubId: number,
        @Body() dto: SetLineupDto
    ) {
        return await this.leagueService.updateLineup(clubId, dto);
    }

    @Get(':id/lineup')
    async getLineup(
        @Param('id', ParseIdPipe) clubId: number
    ) {
        return this.leagueService.getLineup(clubId);
    }
}