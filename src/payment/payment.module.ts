import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { Payment, PaymentSchema } from './schema';
import { MallModule } from '../mall/mall.module'
import { UserModule } from '../user/user.module';
import { OrdersModule } from '../orders/orders.module';
import { MailModule } from '../mail/mail.module';
@Module({
  imports: [
    MongooseModule.forFeature([{ name: Payment.name, schema: PaymentSchema }]),
    ConfigModule,
    MallModule,
    UserModule,
    OrdersModule,
    MailModule,
  ],
  providers: [PaymentService],
  controllers: [PaymentController],
  exports: [PaymentService],
})
export class PaymentModule {}
