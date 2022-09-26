import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;


@Schema()
export class User {
  @Prop({ required: true, minlength: 2, trim: true, type: String })
  firstname: string;

  @Prop({ required: true, minlength: 2, trim: true, type: String })
  lastname: string;

  @Prop({
    unique: true,
    required: true,
    lowercase: true,
    trim: true,
    type: String,
  })
  email: string;

  @Prop({ unique: true, sparse: true, type: String })
  phoneNumber: string;

  @Prop({ default: null, sparse: true, type: String })
  address: string;

  @Prop({ default: null, type: String })
  country: string;

  @Prop({ default: null, type: String })
  state: string;

  @Prop({ default: null, type: String })
  localGovernment: string;

  @Prop({
    default: 'User',
    enum: ['User', 'Admin'],
  })
  role: string;

  @Prop({ default: null, type: String })
  googleId: string;

  @Prop({ default: null, type: String })
  facebookId: string;

  @Prop({ required: true, select: false, type: String })
  password: string;

  @Prop({ default: null, select: false, type: Date })
  passwordChangedOn: Date;

  @Prop({ default: null, select: false, type: String })
  resetToken: string;

  @Prop({ default: null, select: false, type: Date })
  resetExpires: Date;

  @Prop({ default: false, type: Boolean })
  isVerified: boolean;

  @Prop({ default: null, type: String })
  trackingId: string;

  @Prop({ default: null, select: false, type: String })
  verificationToken: string;

  @Prop({ default: null, select: false, type: Date })
  verificationExpires: Date;

  @Prop({ default: Date.now, type: Date })
  createdAt: Date;

  @Prop({ default: Date.now, type: Date })
  updatedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
