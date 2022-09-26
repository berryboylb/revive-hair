import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type StateDocument = State & Document;

@Schema()
export class State {
  @Prop({ required: true, minlength: 2, trim: true })
  state: string;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const StateSchema = SchemaFactory.createForClass(State);
