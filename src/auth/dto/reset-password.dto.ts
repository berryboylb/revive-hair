import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @MaxLength(225)
  @IsString()
  @IsNotEmpty()
  readonly token: string;

  @MaxLength(50, {
    message: "The password can't accept more than 50 characters",
  })
  @MinLength(8, { message: 'The min length of password is 8' })
  @IsString()
  @IsNotEmpty()
  readonly password: string;
}
