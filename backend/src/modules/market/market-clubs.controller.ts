import { Controller, Get, Param, Query, Res } from "@nestjs/common";
import express from 'express';
import { MarketService } from "./market.service";
import { ParseIdPipe } from "../../common/pipes/parse-id.pipe";
import { GetTransactionsQueryDto } from "./dto/get-transactions-query.dto";

@Controller('clubs')
export class MarketClubsController {
    constructor(private readonly marketService: MarketService) { }

    @Get(':id/transactions')
    async getTransactions(
        @Param('id', ParseIdPipe) clubId: number,
        @Query() query: GetTransactionsQueryDto,
    ) {
        return this.marketService.getClubTransactions(clubId, query);
    }

    @Get(':id/transactions/export')
    async exportTransactionsCsv(
        @Param('id', ParseIdPipe) clubId: number,
        @Query() query: GetTransactionsQueryDto,
        @Res() res: express.Response,
    ) {
        const csvData = await this.marketService.exportTransactionsCsv(clubId, query);

        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename=transactions_${clubId}.csv`);

        return res.send(csvData);
    }
}