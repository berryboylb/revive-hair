import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { User } from './user.schema';

export type GuestCartDocument = GuestCart & Document;

@Schema()
export class GuestCart {
  @Prop({ required: true, minlength: 2, trim: true, type: String })
  title: string;

  @Prop({ required: true, minlength: 2, trim: true, type: String })
  img: string;

  @Prop({ default: null })
  brand: string;

  @Prop({ default: null })
  category: string;

  @Prop({ default: null })
  size: string;

  @Prop({ default: null })
  color: string;

  @Prop({ default: null })
  rating: number;

  @Prop({ default: null, required: true })
  quantity: number;

  @Prop({ default: null, required: true })
  currentPrice: number;

  @Prop({ default: null })
  formerprice: number;

  @Prop({ default: null })
  discount: number;

  @Prop({ required: true })
  sessionId: string;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const GuestCartSchema = SchemaFactory.createForClass(GuestCart);
