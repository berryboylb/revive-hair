import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { User } from './user.schema';

export type Carto = {
  _id: string;
  title: string;
  img: string;
  brand?: string;
  currentPrice: number;
  category: string;
  quantity: number;
  discount?: number;
  formerprice?: number;
  size?: string;
  color?: string;
  rating?: number;
};

export type CartDocument = Cart & Document;

@Schema()
export class Cart {
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

  @Prop({
    default: null,
    type: mongoose.Types.ObjectId,
    ref: () => User,
  })
  userId: string;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const CartSchema = SchemaFactory.createForClass(Cart);
