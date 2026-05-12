import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { GamesModule } from './games/games.module';
import { PaymentsModule } from './payments/payments.module';
import { ReferralModule } from './referral/referral.module';
import { BonusModule } from './bonus/bonus.module';
import { AdminModule } from './admin/admin.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    GamesModule,
    PaymentsModule,
    ReferralModule,
    BonusModule,
    AdminModule,
  ],
})
export class AppModule {}