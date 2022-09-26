import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Payment, PaymentDocument } from './schema';
import { PaymentDto } from './dto';

@Injectable()
export class PaymentService {
  constructor(
    @InjectModel(Payment.name)
    private paymentModel: Model<PaymentDocument>,
   
  ) {}

  private readonly logger = new Logger('Payment');

  async onModuleInit() {
    this.logger.log('Payment module started...');
  }

  async createNewPayment(paymentDetails: PaymentDto) {
    return this.paymentModel.create(paymentDetails);
  }

}
