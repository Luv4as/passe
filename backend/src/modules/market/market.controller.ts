import { Body, Controller, Param, Post, Res } from "@nestjs/common";
import { MarketService } from "./market.service";
import { ParseIdPipe } from "../../common/pipes/parse-id.pipe";
import { BuyPlayerDto } from "./dto/buy-player.dto";

@Controller('players')
export class MarketController {
    constructor(private readonly marketService: MarketService) { }
    
    
    @Post(':id/buy')
    async buyPlayer(
        @Param('id', ParseIdPipe) id: number,
        @Body() dto: BuyPlayerDto,){
        return await this.marketService.buyPlayer(id, dto);
    }

    
}
