import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { PaymentGatewayService } from './payment-gateway.service';
import { TonkeeperService } from './tonkeeper.service';

@Module({
  controllers: [PaymentsController],
  providers: [PaymentGatewayService, TonkeeperService],
})
export class PaymentsModule {}