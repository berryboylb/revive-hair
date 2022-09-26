import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
export type ReviewDocument = Review & Document;
import { User } from 'src/user/schemas';

type Likes = {
  user: string;
};
@Schema()
export class Review {
  @Prop({ required: true, minlength: 2, trim: true })
  review: string;

  @Prop({ required: true, unique: true, minlength: 2, trim: true })
  name: string;

  @Prop({ required: true,  })
  productId: string;

  @Prop({ required: true,})
  userId: string;

  @Prop({
    default: null,
    type: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: () => User,
          autopopulate: true,
        },
      },
    ],
  })
  likes: Likes[];

  @Prop({ default: Date.now, type: Date })
  createdAt: Date;

  @Prop({ default: Date.now, type: Date })
  updatedAt: Date;
}

export const ReviewSchema = SchemaFactory.createForClass(Review);
