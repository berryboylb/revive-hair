import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  Post,
  Request,
  UseGuards,
  Logger,
} from '@nestjs/common';
import {
  ChangePasswordDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  CreateUserDto,
  VerifyAccountDto,
  ContactDto,
  NewsLetterDto,
} from './dto';
import { Public } from './decorators/meta';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { LocalAuthGuard } from './guards/auth.guard';
import { MailService } from '../mail/mail.service';
// import * as emailValidator from 'deep-email-validator';
// import * as emailExistence from 'email-existence';
//mail service to be added
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UserService,
    private mailService: MailService,
  ) {}

  private readonly logger = new Logger('Auth');

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('/signin')
  async login(@Request() req) {
    return this.authService.login(req.user);
  }

  @Public()
  @Post('/signup')
  async signup(@Body() body: CreateUserDto) {
    const { email } = body;
    // const res = await emailValidator.validate(email);
    // if (!res.valid)
    //   throw new BadRequestException(
    //     'Email is invalid due to ' + res.validators.smtp.reason,
    //   );
    const user = await this.usersService.create(body);
    const loggedInUser = await this.authService.login(user);
    const token = await this.authService.createAccountVerificationToken(email);
    await this.mailService.sendRegistrationMail({
      email,
      token,
    });
    return loggedInUser;
  }

  @HttpCode(204)
  @Post('/resend-verify-mail')
  async resendVerificationMail(@Request() req): Promise<boolean> {
    const { isVerified, firstname, email } = req.user;
    if (isVerified) throw new BadRequestException('Account already verified');
    const token = await this.authService.createAccountVerificationToken(email);
    await this.mailService.sendVerificationMail({ email, firstname, token });
    return true;
  }

  @Public()
  @HttpCode(204)
  @Post('/verify-account')
  async verifyAccount(@Body() body: VerifyAccountDto): Promise<boolean> {
    await this.authService.verifyAccount(body.token);
    return true;
  }

  @Public()
  @HttpCode(204)
  @Post('/forgot-password')
  async sendForgotPasswordMail(
    @Body() body: ForgotPasswordDto,
  ): Promise<boolean> {
    const { email } = body;
    const user = await this.usersService.findOne({ email });
    if (!user) throw new BadRequestException('Invalid Email');

    if (user) {
      const { firstname } = user;
      const token = await this.authService.createForgotPasswordToken(email);
      this.logger.log(token);
      await this.mailService.sendForgottenPasswordMail({
        email,
        token,
        firstname,
      });
    }
    return null;
  }

  @Public()
  @HttpCode(204)
  @Post('/reset-password')
  async resetPassword(@Body() body: ResetPasswordDto): Promise<boolean> {
    const user = await this.authService.getResetToken(body.token);
    if (!user) throw new BadRequestException('Invalid token');
    await this.usersService.changePassword(user._id, body.password);
    await this.authService.nullifyResetToken(user?.email);
    return null;
  }

  @HttpCode(204)
  @Post('/change-password')
  async changePassword(
    @Body() body: ChangePasswordDto,
    @Request() req,
  ): Promise<boolean> {
    const user = await this.authService.validateUser(
      req.user.email,
      body.currentPassword,
    );
    if (!user) throw new BadRequestException('Incorrect password');
    await this.usersService.changePassword(req.user._id, body.password);
    return true;
  }

  @Public()
  @HttpCode(204)
  @Post('/contact')
  async contact(@Body() body: ContactDto) {
    return this.mailService.contact(body);
  }

  @Public()
  @HttpCode(204)
  @Post('/newsletter')
  async newsLetter(@Body() body: NewsLetterDto) {
    await this.usersService.createNewsLetter(body.email);
    return this.mailService.newsletter({ email: body.email });
  }
}
