
import { Body, Controller, Delete, Get, HttpStatus, HttpCode, Param, Patch, Post, Put, Query, Res } from '@nestjs/common';
import type { Response } from 'express';
import { PlayersService } from './players.service';
import { CreatePlayerDto } from './dto/create-player.dto';
import { UpdateConditionDto } from './dto/update-condition.dto';
import { UpdatePlayerDto } from './dto/update-player.dto';
import { ParseIdPipe } from '../../common/pipes/parse-id.pipe';
import { FilterPlayerDto } from './dto/filter-player.dto';

@Controller('players')
export class PlayersController {
    constructor(private readonly playersService: PlayersService) { }

    @Get()
    findAll(@Query() query: FilterPlayerDto) {
        return this.playersService.findAll(query);
    }

    @Get(':id')
    findOne(@Param('id', ParseIdPipe) id: number) {
        return this.playersService.findOne(id);
    }

    @Post()
    async create(@Body() dto: CreatePlayerDto, @Res({ passthrough: true }) res: Response) {
        const player = await this.playersService.create(dto);
        res.setHeader('Location', `/api/v1/players/${player.id}`);
        return player;
    }

    @Put(':id')
    update(
        @Param('id', ParseIdPipe) id: number,
        @Body() dto: UpdatePlayerDto
    ) {
        return this.playersService.update(id, dto);
    }

    @Patch(':id/condition')
    partialUpdate(
        @Param('id', ParseIdPipe) id: number,
        @Body() dto: UpdateConditionDto
    ) {
        return this.playersService.updateCondition(id, dto);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async deletePlayer(@Param('id', ParseIdPipe) id: number) {
        return this.playersService.deletePlayer(id);
    }
}
