import { Module } from '@nestjs/common';
import { UserModule } from '../user/user.module';
import { OrderService } from './orders.service';
import { OrdersController } from './orders.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { MailModule } from '../mail/mail.module';
import { Order, OrderSchema } from './schema';


@Module({
  imports: [
    MongooseModule.forFeature([{ name: Order.name, schema: OrderSchema }]),
    UserModule,
    ConfigModule,
    MailModule,
  ],
  providers: [OrderService],
  controllers: [OrdersController],
  exports: [OrderService],
})
export class OrdersModule {}
