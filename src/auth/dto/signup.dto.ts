import {
  IsEmail,
  IsNotEmpty,
  MinLength,
  MaxLength,
  IsString,
  IsPhoneNumber,
} from 'class-validator';

export class CreateUserDto {
  @MaxLength(20)
  @MinLength(3)
  @IsNotEmpty()
  readonly firstname: string;

  @MaxLength(20)
  @MinLength(3)
  @IsNotEmpty()
  readonly lastname: string;

  @IsEmail()
  @IsNotEmpty()
  readonly email: string;

  @MaxLength(20)
  @MinLength(10)
  @IsNotEmpty()
  readonly phoneNumber: string;

  @MaxLength(50, {
    message: "The password can't accept more than 50 characters",
  })
  @MinLength(8, { message: 'The min length of password is 8' })
  @IsString()
  @IsNotEmpty()
  readonly password: string;
}

export class ContactDto {
  @MaxLength(20)
  @MinLength(3)
  @IsNotEmpty()
  @IsString()
  readonly firstname: string;

  @MaxLength(20)
  @MinLength(3)
  @IsNotEmpty()
  @IsString()
  readonly lastname: string;

  @IsEmail()
  @IsNotEmpty()
  @IsString()
  readonly email: string;

  @MaxLength(255)
  @MinLength(50)
  @IsNotEmpty()
  @IsString()
  readonly message: string;

  @IsPhoneNumber()
  @IsNotEmpty()
  @IsString()
  readonly phoneNumber: string;
}

export class NewsLetterDto {
  @IsEmail()
  @IsNotEmpty()
  @IsString()
  readonly email: string;
}
