import {
  BadRequestException,
  Controller,
  Get,
  Query,
  Logger,
  Redirect,
} from '@nestjs/common';
import { PaymentService } from './payment.service';
import { UserDto, VerifyDto } from './dto';
import { Public } from '../auth/decorators/meta';
import { MallService } from '../mall/mall.service';
import { UserService } from '../user/user.service';
import { OrderService } from '../orders/orders.service';
import { MailService } from '../mail/mail.service';
import mongoose from 'mongoose';
import { ObjectId } from 'mongodb';
import * as Paystack from 'paystack';
const paystack = Paystack(process.env.API_KEY);

type Transaction = {
  status: boolean;
  message: string;
  data: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
};

type Cred = {
  firstname: string;
  lastname: string;
  email: string;
  reference: number;
  address: string;
  country: string;
  state: string;
  localGovernment: string;
};

@Controller('payment')
export class PaymentController {
  constructor(
    private paymentService: PaymentService, // @InjectPaystackClient() private readonly paystackClient:
    private mallService: MallService,
    private userService: UserService,
    private orderService: OrderService,
    private mailSerive: MailService,
  ) {}

  private readonly logger = new Logger('Payment');

  @Redirect(process.env.REDIRECT_URL, 302)
  @Public()
  @Get('/')
  async redirectUrl(@Query() query: UserDto) {
    const ObjectId = mongoose.Types.ObjectId;
    if (!ObjectId.isValid(query.userId))
      throw new BadRequestException('Invalid User Id');
    const user = await this.userService.findById(query.userId, '+_id');
    if (user.isVerified === false)
      // throw new BadRequestException('User is not verified');
     return { url: `${process.env.CLIENT_URL}/profile` };
    const { email, localGovernment, firstname, lastname } = user;
    const userId = await this.userService.returnUserId(email);
    //this gets our cart items
    const cartItems = await this.userService.getAllCartItems({
      userId,
    });

    if (!email) throw new BadRequestException('Email is missing');

    if (!localGovernment)
      throw new BadRequestException(
        'Please add a local Government to your profile',
      );
    if (cartItems.length === 0) throw new BadRequestException('Cart is empty');
    const amount = await this.mallService.getTotal(email, localGovernment);
    const reference = new Date().getTime().toString();
    const newTransaction: Transaction = await paystack.transaction.initialize({
      name: `${firstname} ${lastname}`,
      email: email,
      amount: amount * 100,
      quantity: cartItems.length,
      reference: reference,
      callback_url: `${process.env.REDIRECT_URL}/payment/verify?trxref=${reference}&reference=${reference}`,
      metadata: {
        userId: query.userId,
      },
    });
    // this.logger.log(newTransaction);
    if (!newTransaction.status)
      throw new BadRequestException('Transaction failed');
    await this.userService.findOneAndUpdate(
      { email },
      { trackingId: reference },
      {
        new: true,
      },
    );
    return { url: newTransaction.data.authorization_url };
  }

  //we are to redirect this guys to payment verified page
  @Redirect(process.env.CLIENT_URL, 302)
  @Public()
  @Get('/verify')
  async verifyPayment(@Query() query: VerifyDto) {
    const condition: { trxref?: number } = {};
    const user = await this.userService.findOne({
      trackingId: query.trxref,
    });
    if (!user) throw new BadRequestException('Invalid Tracking Id');
    const userId = await this.userService.returnUserId(user.email);

    if (Array.isArray(query.trxref)) {
      condition.trxref = query.trxref[0];
    } else {
      condition.trxref = query.trxref;
    }

    const payment = await paystack.transaction.verify(condition.trxref);
    if (!payment.status) throw new BadRequestException('Transaction failed');

    //extract user
    const extractUser: Cred = {
      firstname: user.firstname,
      lastname: user.lastname,
      email: user.email,
      reference: condition.trxref,
      address: user.address,
      country: user.country,
      state: user.state,
      localGovernment: user.localGovernment,
    };

    //this gets our cart items
    const cartItems = await this.userService.getAllCartItems({
      userId: new ObjectId(userId),
    });
    //map and add
    if (cartItems.length === 0) throw new BadRequestException('Empty Cart');

    //they said this is better
    for (const item of cartItems) {
      await this.orderService.createNewOrder(item, extractUser, true);
    }

    //remove the documents from cart model
    await this.userService.emptyCart({ userId: new ObjectId(userId) });

    //send mail to user 
    await this.mailSerive.confirmOrder({
      email: user.email,
      trackingId: String(condition.trxref),
    });

    //send mail admin
    await this.mailSerive.mailAdmin({
      trackingId: String(condition.trxref),
    });

    return { url: `${process.env.CLIENT_URL}/payment-verified` };
  }
}
