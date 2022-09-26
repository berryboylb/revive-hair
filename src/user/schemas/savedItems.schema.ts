import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { User } from './user.schema';
export type SavedDocument = Saved & Document;

@Schema()
export class Saved {
  @Prop({
    required: true,
    unique: true,
    minlength: 2,
    trim: true,
    type: String,
  })
  title: string;

  @Prop({ default: null })
  brand: string;

  @Prop({ required: true, trim: true, type: String })
  img: string;

  @Prop({ required: true })
  currentPrice: number;

  @Prop({ required: true })
  quantity: number;

  @Prop({ required: true, minlength: 2, trim: true, type: String })
  category: string;

  @Prop({ default: null })
  discount: number;

  @Prop({ required: true })
  rating: number;

  @Prop({ default: null })
  formerprice: number;

  @Prop({ default: null })
  size: string[];

  @Prop({ default: null })
  color: string[];

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;

  @Prop({
    default: null,
    type: mongoose.Types.ObjectId,
    ref: () => User,
  })
  userId: string;
}

export const SavedSchema = SchemaFactory.createForClass(Saved);
