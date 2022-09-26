import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { User } from './user.entity';
import { ContactDto } from '../auth/dto';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  async sendUserConfirmation(user: User, token: string) {
    const url = `example.com/auth/confirm?token=${token}`;

    await this.mailerService.sendMail({
      to: user.email,
      from: process.env.MAIL_USER,
      subject: 'Welcome to Nice App! Confirm your Email',
      template: './confirmation', // `.hbs` extension is appended automatically
      context: {
        name: user.name,
        url,
      },
    });
  }

  async sendRegistrationMail(payload: {
    token: string;
    email: string;
  }): Promise<boolean> {
    const { email, token } = payload;
    const link = `${process.env.CLIENT_URL}/verify-user/${token}`;
    await this.mailerService.sendMail({
      to: email,
      from: process.env.MAIL_USER,
      subject: 'Glad You Came Onboard',
      template: './registration',
      context: { email, link: link },
    });
    return true;
  }

  async sendForgottenPasswordMail(payload: {
    firstname: string;
    email: string;
    token: string;
  }): Promise<boolean> {
    const { email, token } = payload;
    const link = `${process.env.CLIENT_URL}/reset-password/${token}`;
    await this.mailerService.sendMail({
      to: email,
      from: process.env.MAIL_USER,
      subject: 'Password Reset',
      template: './reset',
      context: {
        email,
        token,
        link,
      },
    });
    return true;
  }

  async sendVerificationMail(payload: {
    firstname: string;
    email: string;
    token: string;
  }): Promise<boolean> {
    const { firstname, email, token } = payload;
    const link = `${process.env.CLIENT_URL}/reset password/${token}`;
    await this.mailerService.sendMail({
      to: email,
      from: process.env.MAIL_USER,
      subject: 'Verify Account',
      template: './verification',
      context: { name: firstname, email, link: link },
    });
    return true;
  }

  async contact(payload: ContactDto): Promise<boolean> {
    const { firstname, lastname, email, message, phoneNumber } = payload;
    const link = `${process.env.CLIENT_URL}`;
    await this.mailerService.sendMail({
      to: process.env.MAIL_USER,
      from: process.env.MAIL_USER,
      subject: 'Enquiries',
      template: './contact',
      context: {
        firstname,
        email,
        lastname,
        link,
        message,
        phoneNumber,
      },
    });
    return true;
  }

  async confirmOrder(payload: {
    trackingId: string;
    email: string;
  }): Promise<boolean> {
    const { email, trackingId } = payload;
    const link = `${process.env.CLIENT_URL}`;
    await this.mailerService.sendMail({
      to: email,
      from: process.env.MAIL_USER,
      subject: 'Order Confirmed',
      template: './confirmOrder',
      context: { email, trackingId, link: link },
    });
    return true;
  }

  async mailAdmin(payload: { trackingId: string }): Promise<boolean> {
    const { trackingId } = payload;
    const link = `${process.env.CLIENT_URL}`;
    await this.mailerService.sendMail({
      to: process.env.MAIL_USER,
      subject: 'New Order',
      template: './admin',
      context: { trackingId, link: link },
    });
    return true;
  }

  async newsletter(payload: { email: string }): Promise<boolean> {
    const { email } = payload;
    const link = `${process.env.CLIENT_URL}`;
    await this.mailerService.sendMail({
      to: email,
      from: process.env.MAIL_USER,
      subject: 'Welcome',
      template: './newsletter',
      context: { email, link: link },
    });
    return true;
  }
}
