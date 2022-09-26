import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsNumber,
} from 'class-validator';

export class OrderIdDto {
  @IsNotEmpty()
  @IsString()
  readonly OrderId: string;
}

export class EditOrderDto {
  @IsNotEmpty()
  @IsString()
  readonly orderStatus: string;
}

export class OrderDto {
  @IsNotEmpty()
  @IsString()
  readonly OrderId: string;
}

export class GetOrderDto {
  @IsOptional()
  @IsEmail()
  readonly email: string;
}

export class RefrenceDto {
  @IsOptional()
  @IsString()
  readonly reference: string;
}

export class UserIdDto {
  @IsOptional()
  @IsString()
  readonly userId: string;
}
