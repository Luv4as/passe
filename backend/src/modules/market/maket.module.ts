import { Module } from "@nestjs/common";
import { PrismaModule } from "../../prisma/prisma.module";
import { MarketPlayersController } from "./market-players.controller";
import { MarketService } from "./market.service";
import { MarketClubsController } from "./market-clubs.controller";

@Module({
    imports: [PrismaModule],
    controllers: [MarketPlayersController, MarketClubsController],
    providers: [MarketService],
})
export class MarketModule {}