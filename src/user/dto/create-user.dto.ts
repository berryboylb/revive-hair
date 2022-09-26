import {
  IsEmail,
  IsNotEmpty,
  MinLength,
  MaxLength,
  IsOptional,
  IsString,
  IsNumber,
} from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  readonly firstname: string;

  @IsNotEmpty()
  readonly lastname: string;

  @IsEmail()
  @IsNotEmpty()
  readonly email: string;

  @IsNotEmpty()
  @MinLength(10)
  @MaxLength(20)
  readonly phoneNumber: string;

  @IsNotEmpty()
  @MinLength(8, { message: 'The min length of password is 8' })
  @MaxLength(50, {
    message: "The password can't accept more than 50 characters",
  })
  readonly password: string;
}

export class EditUserDto {
  @IsOptional()
  @MinLength(3)
  @MaxLength(20)
  readonly firstname: string;

  @IsOptional()
  @MinLength(3)
  @MaxLength(20)
  readonly lastname: string;

  @IsOptional()
  @MinLength(10)
  @MaxLength(20)
  readonly phoneNumber: string;
}

export class AddressDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(10)
  @MaxLength(255)
  readonly address: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(5)
  @MaxLength(20)
  readonly country: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  @MaxLength(20)
  readonly state: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  @MaxLength(20)
  readonly localGovernment: string;
}


export class ProductIdDto {
  @IsNotEmpty()
  @IsString()
  readonly productId: string;
}

export class SessionIdDto {
  @IsOptional()
  readonly sessionId: string;
}

export class SessionId2Dto {
  @IsNotEmpty()
  @IsString()
  readonly sessionId: string;
}

export class RemoveFromGuestDto {
  @IsNotEmpty()
  @IsString()
  readonly productId: string;

  @IsNotEmpty()
  @IsString()
  readonly sessionId: string;
}

export class EditGuestDto {
  @IsNotEmpty()
  @IsString()
  readonly sessionId: string;

  @IsNotEmpty()
  @IsString()
  readonly _id: string;

  @IsNotEmpty()
  @IsString()
  readonly number: string;
}

