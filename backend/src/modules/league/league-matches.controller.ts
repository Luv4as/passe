import { Body, Controller, Get, Param, Post, Query, Res } from "@nestjs/common";
import type { Response } from 'express';
import { CreateMatchDto } from "./dto/create-match.dto";
import { LeagueService } from "./league.service";
import { ParseIdPipe } from "../../common/pipes/parse-id.pipe";
import { GetMatchesQueryDto } from "./dto/get-matches-query.dto";

@Controller('matches')
export class LeagueMatchesController {
    constructor(readonly leagueService: LeagueService) { }

    @Post()
    async createMatch(
        @Body() dto: CreateMatchDto,
        @Res({ passthrough: true }) res: Response
    ) {
        const match = await this.leagueService.createMatch(dto);
        res.setHeader('Location', `/matches/${match.id}`);
        return match;
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