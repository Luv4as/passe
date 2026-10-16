import { Module } from "@nestjs/common";
import { PrismaModule } from "../../prisma/prisma.module";
import { LeagueService } from "./league.service";
import { LeagueClubsController } from "./league-clubs.controller";
import { LeagueMatchesController } from "./league-matches.controller";
import { LeagueStandingsController } from "./league-standings.controller";

@Module({
    imports: [PrismaModule],
    controllers: [LeagueClubsController, LeagueMatchesController, LeagueStandingsController],
    providers: [LeagueService],

})
export class LeagueModule { }