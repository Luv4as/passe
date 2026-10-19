import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { PlayersModule } from './modules/players/players.module';
import { ClubsModule } from './modules/clubs/clubs.module';
import { MarketModule } from './modules/market/maket.module';
import { LeagueModule } from './modules/league/league.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    PlayersModule,
    ClubsModule,
    MarketModule,
    LeagueModule,
  ],
})
export class AppModule { }