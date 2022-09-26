import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PaymentDocument = Payment & Document;

@Schema()
export class Payment {
  @Prop({ required: true, minlength: 2, trim: true })
  firstname: string;

  @Prop({ required: true, minlength: 2, trim: true })
  lastname: string;

  @Prop({
    unique: true,
    required: true,
    lowercase: true,
    trim: true,
    type: String,
  })
  email: string;

  @Prop({ required: true })
  paymentStatus: boolean;

  @Prop({ required: true, minlength: 2, trim: true })
  referenceId: string;
  

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);
