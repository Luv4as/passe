import { Body, Controller, Get, Param, Post, Query, Res } from "@nestjs/common";
import type { Response } from 'express';
import { ClubsService } from "./clubs.service";
import { ParseIdPipe } from "../../common/pipes/parse-id.pipe";
import { FilterClubDto } from "./dto/filter-club.dto";
import { CreateClubsDto } from "./dto/create-clubs.dto";

@Controller('clubs')
export class ClubsController {
    constructor(private readonly clubsService: ClubsService) { }

    @Get()
    findAll(@Query() query: FilterClubDto) {
        return this.clubsService.findAll(query);
    }

    @Get(':id')
    findOne(@Param('id', ParseIdPipe) id: number) {
        return this.clubsService.findOne(id);
    }

    @Post()
    async create(
        @Body() dto: CreateClubsDto,
        @Res({ passthrough: true }) res: Response
    ) {
        const club = await this.clubsService.create(dto);
        res.setHeader('Location', `/clubs/${club.id}`);
        return club;
    }
}