import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Product,
  ProductSchema,
  Review,
  ReviewSchema,
  Category,
  CategorySchema,
  State,
  StateSchema,
} from './schema';
import { MallController } from './mall.controller';
import { MallService } from './mall.service';
import { UserModule } from 'src/user/user.module';
import {
  LocalGovernment,
  LocalGovernmentSchema,
} from './schema/localGovernmet.schema';
@Module({
  imports: [
    MongooseModule.forFeature([{ name: Product.name, schema: ProductSchema }]),
    MongooseModule.forFeature([{ name: Review.name, schema: ReviewSchema }]),
    MongooseModule.forFeature([
      { name: Category.name, schema: CategorySchema },
    ]),
    MongooseModule.forFeature([{ name: State.name, schema: StateSchema }]),
    MongooseModule.forFeature([
      { name: LocalGovernment.name, schema: LocalGovernmentSchema },
    ]),
    ConfigModule,
    UserModule,
  ],
  providers: [MallService],
  controllers: [MallController],
  exports: [MallService],
})
export class MallModule {}
