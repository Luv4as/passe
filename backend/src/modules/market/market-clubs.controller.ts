import { Controller, Get, Param, Query, Res } from "@nestjs/common";
import { MarketService } from "./market.service";
import { ParseIdPipe } from "../../common/pipes/parse-id.pipe";

@Controller('clubs')
export class MarketClubsController {
    constructor(private readonly marketService: MarketService) { }

    @Get(':id/transactions')
    async getTransactions(
        @Param('id', ParseIdPipe) clubId: number,
        @Query('page') page?: number,
        @Query('limit') limit?: number,
    ) {
        return 'this.marketService.getClubTransactions(clubId, page, limit)';
    }

    @Get(':id/transactions/export')
    async exportTransactionsCsv(
        @Param('id', ParseIdPipe) clubId: number,
        @Res() res: Response,
    ) {
        return 'csvStream.pipe(res)';
    }
}