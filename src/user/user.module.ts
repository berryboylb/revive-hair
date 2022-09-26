import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { ConfigModule } from '@nestjs/config';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import {
  User,
  UserSchema,
  UserDocument,
  Cart,
  CartSchema,
  Saved,
  SavedSchema,
  NewsLetter,
  NewsLetterSchema,
  GuestCart,
  GuestCartSchema,
} from './schemas';
@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeatureAsync([
      {
        name: User.name,
        useFactory: () => {
          const schema = UserSchema;

          schema.pre('save', async function (next) {
            const user = this as UserDocument;
            if (user.isModified('password')) {
               const salt = await bcrypt.genSalt(10);
               const hashedPassword = await bcrypt.hash(user.password, salt);
               user.password = hashedPassword;
            }
            next();
          });

          schema.set('toJSON', {
            transform(doc, ret) {
              delete ret.password;
              delete ret.verificationToken;
              delete ret.verificationExpires;
              delete ret.resetToken;
              delete ret.resetExpires;
              delete ret.passwordChangedOn;
              delete ret.googleId;
              delete ret.facebookId;
              return ret;
            },
          });
          return schema;
        },
      },
    ]),
    MongooseModule.forFeature([{ name: Cart.name, schema: CartSchema }]),
    MongooseModule.forFeature([
      { name: GuestCart.name, schema: GuestCartSchema },
    ]),
    MongooseModule.forFeature([{ name: Saved.name, schema: SavedSchema }]),
    MongooseModule.forFeature([
      { name: NewsLetter.name, schema: NewsLetterSchema },
    ]),
  ],
  providers: [UserService],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}
