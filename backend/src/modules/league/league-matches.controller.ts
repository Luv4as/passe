import { Body, Controller, Get, Param, Post, Query } from "@nestjs/common";
import { CreateMatchDto } from "./dto/create-match.dto";
import { LeagueService } from "./league.service";
import { ParseIdPipe } from "../../common/pipes/parse-id.pipe";
import { GetMatchesQueryDto } from "./dto/get-matches-query.dto";

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
    async getMatches(@Query() query: GetMatchesQueryDto) { 
        return this.leagueService.getMatches(query);
    }

    @Get(':id')
    async getMatch(@Param('id', ParseIdPipe) clubId: number,) { 
        return this.leagueService.getMatchById(clubId);
    }

}