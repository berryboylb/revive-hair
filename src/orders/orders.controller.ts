import {
  BadRequestException,
  Body,
  Controller,
  Patch,
  Query,
  Delete,
  Logger,
  Get,
  Request,
  Redirect,
} from '@nestjs/common';
import { OrderService } from './orders.service';
import {
  OrderIdDto,
  EditOrderDto,
  GetOrderDto,
  RefrenceDto,
  UserIdDto,
} from './dto';
import mongoose from 'mongoose';
import { ObjectId } from 'mongodb';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { AdminRole, UserRole } from '../user/constants';
import { Public } from '../auth/decorators/meta';
import { UserService } from '../user/user.service';
import { MailService } from '../mail/mail.service';

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

@Controller('orders')
export class OrdersController {
  constructor(
    private orderService: OrderService,
    private userService: UserService,
    private mailSerive: MailService,
  ) {}
  private readonly logger = new Logger('Orders');

  @Roles(AdminRole)
  @Get('/')
  async getAllOrders() {
    return this.orderService.getAllOrders();
  }

  @Roles(AdminRole, UserRole)
  @Get('/user')
  async getOrdersforOneUser(@Request() req, @Query() query: GetOrderDto) {
    const { role, email } = req.user;
    const condition: { email?: string } = {};
    if (role === UserRole) condition.email = email;
    if (role === AdminRole && query.email) condition.email = query.email;
    return this.orderService.getOrdersForOneUser(condition.email);
  }

  @Roles(AdminRole)
  @Patch('/edit')
  async editOrder(@Body() body: EditOrderDto, @Query() query: OrderIdDto) {
    const ObjectId = mongoose.Types.ObjectId;
    if (!ObjectId.isValid(query.OrderId))
      throw new BadRequestException('Invalid User Id');
    return this.orderService.editOrder(query.OrderId, body.orderStatus);
  }

  @Roles(AdminRole)
  @Delete('/delete')
  async deleteOrder(@Query() query: OrderIdDto) {
    const ObjectId = mongoose.Types.ObjectId;
    if (!ObjectId.isValid(query.OrderId))
      throw new BadRequestException('Invalid User Id');
    return this.orderService.deleteOrder(query.OrderId);
  }

  @Roles(AdminRole, UserRole)
  @Get('/get-by-tracking-no')
  async getByReference(@Request() req, @Query() query: RefrenceDto) {
    const { role, trackingId } = req?.user;
    const condition: { reference?: number } = {};

    if (role === UserRole) {
      if (!trackingId) throw new BadRequestException('Tracking Id is empty');
      condition.reference = trackingId;
    }

    if (role === AdminRole && query.reference)
      condition.reference = Number(query.reference);
    return this.orderService.getItems(condition);
  }

  @Redirect(process.env.CLIENT_URL, 302)
  @Public()
  @Get('/order-by-delivery')
  async orderByDelivery(@Query() query: UserIdDto) {
    //get our user
    const user = await this.userService.findOne({ _id: query.userId });
    if (!user) throw new BadRequestException('Invalid User');
    if (user.isVerified === false)
      return { url: `${process.env.CLIENT_URL}/profile` };
    // throw new BadRequestException('User is not verified');

    //this gets our cart items
    const cartItems = await this.userService.getAllCartItems({
      userId: new ObjectId(query.userId),
    });
    if (cartItems.length === 0) throw new BadRequestException('Empty Cart');

    //create reference
    const reference = Number(new Date().getTime());

    //update the user trackingId
    await this.userService.findOneAndUpdate(
      { email: user.email },
      { trackingId: reference },
      {
        new: true,
      },
    );

    //extract user
    const extractUser: Cred = {
      firstname: user.firstname,
      lastname: user.lastname,
      email: user.email,
      reference: reference,
      address: user.address,
      country: user.country,
      state: user.state,
      localGovernment: user.localGovernment,
    };

    for (const item of cartItems) {
      await this.orderService.createNewOrder(item, extractUser, false);
    }

    //remove the documents from cart model
    await this.userService.emptyCart({ userId: new ObjectId(query.userId) });

    //send mail to user
    await this.mailSerive.confirmOrder({
      email: user.email,
      trackingId: String(reference),
    });

    //send mail admin
    await this.mailSerive.mailAdmin({
      trackingId: String(reference),
    });

    return { url: `${process.env.CLIENT_URL}/payment-verified` };
  }
}
