import { Injectable, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as moment from 'moment';
import { v4 as uuid } from 'uuid';
import * as bcrypt from 'bcrypt';
import { User } from '../user/schemas';
import { UserService } from '../user/user.service'
import { MailService } from '../mail/mail.service';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private mailService: MailService,
  ) {}

  async login(user: any) {
    const payload = { username: user.email, sub: user._id };
    const parsedUser = user.toJSON();
    return { ...parsedUser, accessToken: this.jwtService.sign(payload) };
  }

  //check here to user most of the select
  async validateUser(username: string, pass: string): Promise<User | null> {
    const user = await this.userService.findOne(
      { email: username },
      { select: '+password' },
    );
    if (!user) return null;
     const passwordMatch = await bcrypt.compare(pass, user?.password);
    return passwordMatch ? user : null;
  }

  // Account verification
  private async getVerificationToken(token): Promise<any> {
    return this.userService.findOne({
      verificationToken: token,
      verificationExpires: { $gt: Date.now() },
    });
  }

  async createAccountVerificationToken(email): Promise<string | null> {
    const verificationToken = uuid();
    const verificationExpires = moment().add(7, 'd').toDate();
    const user = await this.userService.findOneAndUpdate(
      { email },
      { verificationToken, verificationExpires },
    );
    return user ? verificationToken : null;
  }

  async verifyAccount(token): Promise<boolean> {
    const user = await this.getVerificationToken(token);
    if (!user) throw new BadRequestException('Invalid token');
    if (user.isVerified)
      throw new BadRequestException('Account already verified');
    await this.userService.updateOne(
      { email: user.email },
      { verificationExpires: null, verificationToken: null, isVerified: true },
    );
    await this.userService.createNewsLetter(user.email);
    return true;
  }

  async verifyAdminAccount(token): Promise<boolean> {
    const user = await this.getVerificationToken(token);
    if (!user) throw new BadRequestException('Invalid token');
    await this.userService.updateOne(
      { email: user.email },
      { verificationExpires: null, verificationToken: null, isVerified: true },
    );
    return true;
  }

  async createForgotPasswordToken(email): Promise<string | null> {
    const resetToken = uuid();
    const resetExpires = moment().add(1, 'd').toDate();
    const user = await this.userService.findOneAndUpdate(
      { email },
      { resetToken, resetExpires },
    );
    return user ? resetToken : null;
  }

  async getResetToken(token): Promise<any> {
    return this.userService.findOne({
      resetToken: token,
      resetExpires: { $gt: Date.now() },
    });
  }

  async nullifyResetToken(email): Promise<any> {
    await this.userService.updateOne(
      { email },
      { resetToken: null, resetExpires: null },
    );
    return true;
  }
}