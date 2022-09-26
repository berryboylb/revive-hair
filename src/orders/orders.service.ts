import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Order, OrderDocument } from './schema';
import { Model, Schema } from 'mongoose';
import * as moment from 'moment';
import { Cart } from '../user/schemas';

// export type Cart = {
//   _id: string;
//   title: string;
//   img: string;
//   brand?: string;
//   currentPrice: number;
//   category: string;
//   quantity: number;
//   discount?: number;
//   formerprice?: number;
//   size?: string;
//   color?: string;
//   rating?: number;
// };

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

@Injectable()
export class OrderService {
  constructor(
    @InjectModel(Order.name)
    private orderModel: Model<OrderDocument>,
  ) {}

  //create a logger for this model
  private readonly logger = new Logger('Order');

  async onModuleInit() {
    this.logger.log('Order module started...');
  }

  async createNewOrder(cart: Cart, cred: Cred, paymentStatus: boolean) {
    const newOrder: Order = {
      firstname: cred.firstname,
      lastname: cred.lastname,
      email: cred.email,
      title: cart.title,
      img: cart.img,
      brand: cart.brand ? cart.brand : null,
      currentPrice: cart.currentPrice,
      category: cart.category,
      quantity: cart.quantity,
      discount: cart.discount ? cart.discount : null,
      formerprice: cart.formerprice ? cart.formerprice : null,
      size: cart.size ? cart.size : '',
      color: cart.color ? cart.color : null,
      rating: cart.rating ? cart.rating : null,
      orderStatus: 'Waiting',
      reference: cred.reference,
      paymentStatus: paymentStatus,
      address: cred.address,
      country: cred.country,
      state: cred.state,
      localGovernment: cred.localGovernment,
      createdAt: moment().toDate(),
      updatedAt: moment().toDate(),
    };
    return this.orderModel.create(newOrder);
  }

  async editOrder(orderId: string, orderStatus: string): Promise<any> {
    const Order = await this.orderModel.findById(orderId);
    if (!Order) throw new BadRequestException('Order Not found');
    Order.orderStatus = orderStatus;
    Order.save();
    return true;
  }

  async deleteOrder(orderId: string) {
    const Order = await this.orderModel.findById(orderId);
    if (!Order) throw new BadRequestException('Order Not found');
    return Order.remove();
  }

  async getOrdersForOneUser(email: string) {
    return this.orderModel.find({ email }).sort({ _id: -1 });
  }

  async getAllOrders() {
    return this.orderModel.find({}).sort({ _id: -1 });
  }

  async getItems(condition) {
    return this.orderModel.find(condition).sort({ _id: -1 });
  }
}
