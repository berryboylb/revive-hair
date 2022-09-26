import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type LocalGovernmentDocument = LocalGovernment & Document;

@Schema()
export class LocalGovernment {
  @Prop({ required: true, unique: true })
  localGovernment: string;

  @Prop({ required: true, minlength: 2, trim: true,})
  state: string;

  @Prop({ required: true })
  price: number;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const LocalGovernmentSchema =
  SchemaFactory.createForClass(LocalGovernment);
