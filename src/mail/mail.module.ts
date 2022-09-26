import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { MailService } from './mail.service';
import { join } from 'path';

@Module({
  imports: [
    // MailerModule.forRoot({
    //   transport: {
    //     host: process.env.MAIL_HOST,
    //     secure: false,
    //     logger: true,
    //     debug: true,
    //     ignoreTLS: true,
    //     auth: {
    //       user: process.env.MAIL_USER,
    //       pass: process.env.MAIL_PASSWORD,
    //     },
    //     tls: {
    //       rejectUnauthorized: true,
    //     },
    //   },
    //   defaults: {
    //     from: `"No Reply" <${process.env.MAIL_FROM}>`,
    //   },
    //   template: {
    //     dir: join(__dirname, 'templates'),
    //     adapter: new HandlebarsAdapter(),
    //     options: {
    //       strict: true,
    //     },
    //   },
    // }),
    MailerModule.forRootAsync({
      useFactory: async () => ({
        transport: {
          port: 25,
          host: process.env.MAIL_HOST,
          secure: false,
          auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASSWORD,
          },
          tls: {
            rejectUnauthorized: false, //this is dangerous
          },
        },
        defaults: {
          from: `"No Reply" <${process.env.MAIL_USER}>`,
        },
        template: {
          dir: join(__dirname, './templates'),
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
          },
        },
      }),
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
