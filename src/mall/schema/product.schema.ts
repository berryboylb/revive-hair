import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as paginate from 'mongoose-paginate';

export type ProductDocument = Product & Document;

@Schema()
export class Product {
  @Prop({
    required: true,
    unique: true,
    minlength: 2,
    trim: true,
    lowercase: true,
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

  @Prop({ required: true, minlength: 2, trim: true, type: String })
  description: string;

  @Prop({ default: null })
  discount: number;

  @Prop({ default: null })
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
}

export const ProductSchema = SchemaFactory.createForClass(Product);

ProductSchema.plugin(paginate);
