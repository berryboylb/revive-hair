import { Type } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  MinLength,
  MaxLength,
  IsOptional,
  IsString,
  ValidateNested,
  IsNumber,
  Min,
  IsBoolean,
} from 'class-validator';

export class PaymentDto {
  @IsNotEmpty()
  @IsString()
  readonly firstname: string;

  @IsNotEmpty()
  @IsString()
  readonly lastname: string;

  @IsEmail()
  @IsNotEmpty()
  readonly email: string;

  @IsNotEmpty()
  @IsBoolean()
  readonly paymentStatus: boolean;

  @IsNotEmpty()
  @IsString()
  readonly referenceId: string;

  @IsNotEmpty()
  @IsNumber()
  readonly amount: number;
}

export class UserDto {
  @IsNotEmpty()
  @IsString()
  readonly userId: string;
}

export class VerifyDto {
  @IsNotEmpty()
  readonly trxref: number;
}
