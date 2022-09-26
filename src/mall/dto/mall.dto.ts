import { Type } from 'class-transformer';
import mongoose from 'mongoose';
import { Review } from '../schema/review.schema';
import {
  IsEmail,
  IsNotEmpty,
  MinLength,
  MaxLength,
  IsOptional,
  IsString,
  IsNumber,
  Min,
} from 'class-validator';

export class CreateProductDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  @MaxLength(25)
  readonly title: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(50)
  @MaxLength(1000)
  readonly description: string;

  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(30)
  readonly brand?: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  @MaxLength(30)
  readonly category: string;

  @IsNotEmpty()
  @IsString()
  readonly currentPrice: number;

  @IsNotEmpty()
  @IsString()
  readonly quantity: number;

  @IsOptional()
  @IsString()
  readonly discount?: number;

  @IsNotEmpty()
  @IsString()
  readonly rating: number;

  @IsOptional()
  @IsString()
  readonly formerprice?: number;

  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(30)
  readonly size?: string;

  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(30)
  readonly color?: string;
}

export class PaginationParams {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(10)
  perPage?: number;
}

export class CategoryPaginationParams {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(10)
  perPage?: number;

  @IsNotEmpty()
  @Type(() => String)
  @IsString()
  readonly category: string;
}

export class SingleProductDto {
  @IsNotEmpty()
    @IsString()
  readonly productId: string;
}

export class QuantityDto {
  @IsNotEmpty()
  @IsString()
  readonly productId: string;

  @IsNotEmpty()
  readonly quantity: number;
}

export class EditProductPrice {
  @IsNotEmpty()
  @IsString()
  readonly discount: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(50)
  @MaxLength(1000)
  readonly description: string;
}

export class CartItemDto {
  @IsNotEmpty()
  @IsString()
  readonly _id: string;

  @IsNotEmpty()
  @Type(() => String)
  @IsString()
  readonly title: string;

  @IsNotEmpty()
  @Type(() => String)
  @IsString()
  readonly img: string;

  @IsOptional()
  @Type(() => String)
  @IsString()
  brand?: string;

  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  readonly currentPrice: number;

  @IsNotEmpty()
  @Type(() => String)
  @IsString()
  readonly category: string;

  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  readonly quantity: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  discount?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  formerprice?: number;

  @IsOptional()
  @Type(() => String)
  @IsString()
  size?: string;

  @IsOptional()
  @Type(() => String)
  @IsString()
  color?: string;

  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  rating: number;
}


export class NewReviewDto {
  @IsNotEmpty()
  @Type(() => String)
  @IsString()
  readonly review: string;

  @IsNotEmpty()
  @Type(() => String)
  @IsString()
  readonly name: string;
}

export class EditReviewDto {
  @IsNotEmpty()
  @Type(() => String)
  @IsString()
  readonly newReview: string;
}

export class ReviewIdDto {
  @IsNotEmpty()
  @IsString()
  readonly reviewId: string;
}

export class ProductIdDto {
  @IsNotEmpty()
  @IsString()
  readonly productId: string;
}


export class CreateLocalDto {
  @IsNotEmpty()
  @IsString()
  readonly localGovernment: string;

  @IsNotEmpty()
  @IsString()
  readonly state: string;

  @IsNotEmpty()
  @IsNumber()
  readonly price: number;
}

export class StateDto {
  @IsNotEmpty()
  @IsString()
  readonly state: string;
}


export class EditLocalGovernmentDto {
  @IsNotEmpty()
  @IsString()
  readonly state: string;

  @IsNotEmpty()
  @IsString()
  readonly localGovernment: string;

  @IsNotEmpty()
  @IsNumber()
  readonly price: number;
}

export class StateIdDto {
  @IsNotEmpty()
  @IsString()
  readonly stateId: string;
}

export class LocalGovernmentIdDto {
  @IsNotEmpty()
  @IsString()
  readonly LocalGovernmentId: string;
}

export class DeliveryFeeDto {
  @IsNotEmpty()
  @IsString()
  readonly localGovernment: string;
}
