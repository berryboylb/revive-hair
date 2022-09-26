import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import Mongoose, { Document } from 'mongoose';

export type OrderDocument = Order & Document;

@Schema()
export class Order {
  @Prop({ required: true, minlength: 2, trim: true })
  firstname: string;

  @Prop({ required: true, minlength: 2, trim: true })
  lastname: string;

  @Prop({
    required: true,
    lowercase: true,
    trim: true,
    type: String,
  })
  email: string;

  // @Prop({ required: true })
  // userId: Mongoose.Schema.Types.ObjectId;

  @Prop({ required: true, minlength: 2, trim: true, type: String })
  category: string;

  @Prop({
    required: true,
    minlength: 2,
    trim: true,
  })
  img: string;

  @Prop({
    required: true,
    minlength: 2,
    trim: true,
  })
  title: string;

  @Prop({ required: true })
  currentPrice: number;

  @Prop({ required: true })
  quantity: number;

  @Prop({ default: null })
  rating: number;

  @Prop({ default: null })
  discount: number;

  @Prop({ default: null })
  formerprice: number;

  @Prop({ default: null })
  brand: string;

  @Prop({ default: null })
  size: string;

  @Prop({ default: null })
  color: string;

  @Prop({ required: true })
  paymentStatus: boolean;

  @Prop({ required: true, minlength: 2, trim: true })
  reference: number;

  @Prop({ required: true, sparse: true, type: String })
  address: string;

  @Prop({ required: true, type: String })
  country: string;

  @Prop({ required: true, type: String })
  state: string;

  @Prop({ required: true, type: String })
  localGovernment: string;

  @Prop({
    default: 'Waiting',
    enum: ['Waiting', 'Packaged', 'Shipped', 'Delivered'],
  })
  orderStatus: string;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
