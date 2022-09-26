import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import  { Document } from 'mongoose';
export type NewsLetterDocument = NewsLetter & Document;

@Schema()
export class NewsLetter {
  @Prop({
    unique: true,
    required: true,
    lowercase: true,
    trim: true,
    type: String,
  })
  email: string;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}
export const NewsLetterSchema = SchemaFactory.createForClass(NewsLetter);
