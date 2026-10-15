import { Module } from "@nestjs/common";
import { ClubsService } from "./clubs.service";
import { ClubsController } from "./clubs.controller";
import { PlayersModule } from "../players/players.module";
import { PrismaModule } from "../../prisma/prisma.module";

@Module({
    imports: [PrismaModule, PlayersModule],
    controllers: [ClubsController],
    providers: [ClubsService],
})
export class ClubsModule { }