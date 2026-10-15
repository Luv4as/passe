import { Controller, Get, Param, Post, Query } from "@nestjs/common";
import { ClubsService } from "./clubs.service";
import { ParseIdPipe } from "../../common/pipes/parse-id.pipe";
import { FilterClubDto } from "./dto/filter-club.dto";

@Controller('clubs')
export class ClubsController {
    constructor(private readonly clubsService: ClubsService) { }

    @Get()
    findAll(@Query() query: FilterClubDto) {
        return this.clubsService.findAll(query);
    }

    @Get(':id')
    findOne(@Param('id', ParseIdPipe) id: number){
        return //this.clubsService.findOne(id);
    }

    @Post()
    async create(){
        return //this.clubsService.create();
    }
}