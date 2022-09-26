import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class VerifyAccountDto {
  @MaxLength(225)
  @IsString()
  @IsNotEmpty()
  readonly token: string;
}
