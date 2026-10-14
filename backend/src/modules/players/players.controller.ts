
import { Controller, Delete, Get, Param, Patch, Post, Put } from '@nestjs/common';

@Controller('players')
export class PlayersController {
    @Get()
    findAll(): string {
        return 'This action returns all players';
    }

    @Get(':id')
    findOne(@Param('id') id: string): string {
        return `This action returns player with id: ${id}`;
    }

    @Post()
    create(): string {
        return 'This action creates a new player';
    }

    @Put(':id')
    update(@Param('id') id: string): string {
        return `This action updates player with id: ${id}`;
    }

    @Patch(':id')
    partialUpdate(@Param('id') id: string): string {
        return `This action partially updates player with id: ${id}`;
    }

    @Delete(':id')
    remove(@Param('id') id: string): string {
        return `This action removes player with id: ${id}`;
    }
}
