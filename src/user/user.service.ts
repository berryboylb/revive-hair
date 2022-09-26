import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as moment from 'moment';
import mongoose, { Model } from 'mongoose';
import { AdminRole } from './constants';
import {
  User,
  UserDocument,
  Cart,
  CartDocument,
  Saved,
  SavedDocument,
  NewsLetter,
  NewsLetterDocument,
  GuestCart,
  GuestCartDocument,
} from './schemas';
import { CreateUserDto, EditGuestDto } from './dto';
import { CartItemDto } from '../mall/dto';
import { Product } from '../mall/schema';
import { ObjectId } from 'mongodb';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
    @InjectModel(Cart.name)
    private cartModel: Model<CartDocument>,
    @InjectModel(GuestCart.name)
    private guestCartModel: Model<GuestCartDocument>,
    @InjectModel(Saved.name)
    private savedModel: Model<SavedDocument>,
    @InjectModel(NewsLetter.name)
    private newsletterModel: Model<NewsLetterDocument>,
  ) {}
  //create a logger for this model
  private readonly logger = new Logger('Users');

  async onModuleInit() {
    try {
      this.logger.log('Checking admin user ...');
      const created = await this.createAdminUser();
      if (created) this.logger.log('Created admin user');
    } catch (error) {
      this.logger.error('Error creating admin user', error);
    }
  }

  private async createAdminUser(): Promise<boolean> {
    const user = await this.userModel.findOne({ role: AdminRole });
    if (user) return false;
    const adminUser: User = {
      email: `${process.env.MAIL_USER}`,
      password: 'admin1234567890',
      role: 'Admin',
      firstname: 'Admin',
      lastname: 'Admin',
      address: undefined,
      country: undefined,
      state: undefined,
      localGovernment: undefined,
      googleId: undefined,
      facebookId: undefined,
      phoneNumber: process.env.PHONE_NUMBER,
      passwordChangedOn: undefined,
      trackingId: undefined,
      resetToken: '',
      resetExpires: undefined,
      isVerified: false,
      verificationToken: '',
      verificationExpires: undefined,
      createdAt: undefined,
      updatedAt: undefined,
    };

    await this.userModel.create(adminUser);
    return true;
  }

  //get all users
  async findAll(condition): Promise<User[]> {
    const users = await this.userModel.find(condition);
    return users;
  }

  //get one user
  async findOne(
    condition,
    options?: { select: string },
  ): Promise<User | undefined> {
    const users = await this.userModel.findOne(condition, options?.select);
    return users;
  }
  //get user password
  async returnPassword(id: string): Promise<any> {
    const user = await this.userModel.findById(id, '+password');
    if (!user)
      throw new BadRequestException(
        'User with that email does not exist on the database',
      );
    return user.password;
  }
  //get one with their id
  async findById(id: string, select: string): Promise<User | undefined> {
    const user = await this.userModel.findById(id, select);
    if (!user) throw new BadRequestException('User does not exist');
    return user;
  }
  //find one and update
  async findOneAndUpdate(
    condition: { [key: string]: any },
    fields: { [key: string]: any },
    options?: { [key: string]: any },
  ): Promise<any | undefined> {
    return this.userModel.findOneAndUpdate(condition, fields, options);
  }

  //create a user
  async create(createUserDto: CreateUserDto): Promise<User> {
    const createdUser = new this.userModel(createUserDto);
    return createdUser.save();
  }

  //update one
  async updateOne(condition, fields): Promise<any> {
    const result = await this.userModel.updateOne(condition, fields);
    return result;
  }
  //change password
  async changePassword(userId, password): Promise<boolean> {
    const user = await this.userModel.findById(
      userId,
      '+password +passwordChangedOn',
    );
    if (!user) return false;
    user.password = password;
    user.passwordChangedOn = moment().toDate();
    user.save();
    return true;
  }

  //add to saved items
  async addToSaveItems(email: string, product: Product) {
    //revamp
    const user = await this.userModel.findOne({ email });
    if (!user) throw new BadRequestException('User does not exist');
    const formerProduct = await this.savedModel.findOne({
      userId: user._id,
      title: product.title,
    });
    if (formerProduct) throw new BadRequestException('Item already saved');
    const newItem: Saved = {
      title: product.title,
      brand: product.brand ? product.brand : null,
      img: product.img,
      currentPrice: product.currentPrice,
      quantity: product.quantity,
      category: product.category,
      discount: product.discount ? product.discount : null,
      rating: product.rating ? product.rating : null,
      formerprice: product.formerprice ? product.formerprice : null,
      size: product.size ? product.size : null,
      color: product.color ? product.color : null,
      userId: user._id,
      createdAt: moment().toDate(),
      updatedAt: moment().toDate(),
    };
    return this.savedModel.create(newItem);
  }

  //add to guest cart
  async addToGuestCart(item: CartItemDto, sessionId: string) {
    const OldProduct = await this.guestCartModel.findOne({
      sessionId: sessionId,
      title: item.title,
    });
    if (OldProduct) throw new BadRequestException('Item already added');
    const newCartItem: GuestCart = {
      title: item.title,
      img: item.img,
      brand: item.brand ? item.brand : null,
      category: item.category,
      size: item.size ? item.size : null,
      color: item.color ? item.color : null,
      rating: item.rating ? item.rating : null,
      quantity: item.quantity,
      currentPrice: item.currentPrice,
      formerprice: item.formerprice ? item.formerprice : null,
      discount: item.discount ? item.discount : null,
      sessionId: sessionId,
      createdAt: moment().toDate(),
      updatedAt: moment().toDate(),
    };
    return this.guestCartModel.create(newCartItem);
  }

  //remove from guest cart
  async removeGuestCart(productId: string, sessionId: string) {
    const ObjectId = mongoose.Types.ObjectId;
    if (!ObjectId.isValid(productId))
      throw new BadRequestException('Invalid Id');

    const items = await this.guestCartModel.find({ sessionId });
    if (items.length < 0) throw new BadRequestException('Invalid Session ID');

    const cartItem = await this.guestCartModel.findOne({
      sessionId: sessionId,
      _id: productId,
    });

    if (!cartItem) throw new BadRequestException('Product Not found');
    await cartItem.remove();
    return true;
  }

  //change guest quantity
  async changeGuestQuantity(body: EditGuestDto): Promise<GuestCart> {
    const ObjectId = mongoose.Types.ObjectId;
    if (!ObjectId.isValid(body._id))
      throw new BadRequestException('Invalid Product Id');

    const items = await this.guestCartModel.find({ sessionId: body.sessionId });
    if (items.length < 0) throw new BadRequestException('Invalid Session ID');

    const guestCartItem = await this.guestCartModel.findOne({
      sessionId: body.sessionId,
      _id: body._id,
    });

    if (!guestCartItem) throw new BadRequestException('Product Not found');
    guestCartItem.quantity = Number(body.number);

    return guestCartItem.save();
  }

  async getGetGuestItems(condition) {
    return this.guestCartModel.find(condition).sort({ _id: -1 });
  }

  //change item
  async changeItems(email: string, sessionId: string) {
    if (!sessionId) throw new BadRequestException('Invalid Session Id');
    const guestCartItem = await this.guestCartModel.find({
      sessionId,
    });
    //add to orginal cart
    for (const item of guestCartItem) {
      await this.addtoCart(email, item);
    }

    await this.guestCartModel.deleteMany({
      sessionId,
    });

    return true;
  }

  //remove from saved items
  async removeFromSavedItems(email, productId: string) {
    const ObjectId = mongoose.Types.ObjectId;
    if (!ObjectId.isValid(productId))
      throw new BadRequestException('Invalid Product Id');
    const user = await this.userModel.findOne({ email });
    if (!user) throw new BadRequestException('User does not exist');
    const savedItem = await this.savedModel.findOne({
      userId: user._id,
      _id: productId,
    });
    if (!savedItem) throw new BadRequestException('Product Not found');
    return savedItem.remove();
  }

  //add to cart
  async addtoCart(email: string, item: CartItemDto) {
    const user = await this.userModel.findOne({ email });
    if (!user) throw new BadRequestException('User does not exist');
    const product = await this.cartModel.findOne({
      userId: user._id,
      title: item.title,
    });
    if (product) throw new BadRequestException('Item already added');
    const newCartItem: Cart = {
      title: item.title,
      img: item.img,
      brand: item.brand ? item.brand : null,
      category: item.category,
      size: item.size ? item.size : null,
      color: item.color ? item.color : null,
      rating: item.rating ? item.rating : null,
      quantity: item.quantity,
      currentPrice: item.currentPrice,
      formerprice: item.formerprice ? item.formerprice : null,
      discount: item.discount ? item.discount : null,
      userId: user._id,
      createdAt: moment().toDate(),
      updatedAt: moment().toDate(),
    };
    return this.cartModel.create(newCartItem);
  }

  //remove from cart
  async removeFromCart(email, productId: string) {
    const ObjectId = mongoose.Types.ObjectId;
    if (!ObjectId.isValid(productId))
      throw new BadRequestException('Invalid Product Id');
    const user = await this.userModel.findOne({ email });
    if (!user) throw new BadRequestException('User does not exist');

    const cartItem = await this.cartModel.findOne({
      userId: user._id,
      _id: productId,
    });

    if (!cartItem) throw new BadRequestException('Product Not found');
    return cartItem.remove();
  }

  //get total in the cart
  async getTotal(email: string): Promise<any> {
    const user = await this.userModel.findOne({ email });
    if (!user) throw new BadRequestException('User does not exist');

    const totalItems: Cart[] = await this.cartModel.find({
      userId: user._id,
    });

    //  const result: any = await this.cartModel.aggregate([
    //    {
    //      $group: {
    //        _id: new ObjectId(user._id),
    //        totalSum: { $sum:  '$quantity' },
    //      },
    //    },
    //  ]);
    //   this.logger.log(result);
    //   return result;
    //return this.cartModel.count({ userId: user._id });
    return this.cartModel.aggregate([
      {
        $group: {
          userId: user._id,
          Amount: { $sum: { $multiply: ['$currentPrice', '$quantity'] } },
        },
      },
      {
        $project: {
          _id: 0,
          TotalAmount: '$Amount',
        },
      },
    ]);

    // let total = 0;
    // if (totalItems.length > 0) {
    //   totalItems.forEach((item: Cart) => {
    //     total += item.currentPrice * item.quantity;
    //   });
    // }
    // return total;
  }

  //increase quantity in cart
  async changeQuantity(
    email: string,
    number: number,
    _id: string,
  ): Promise<Cart> {
    const ObjectId = mongoose.Types.ObjectId;
    if (!ObjectId.isValid(_id))
      throw new BadRequestException('Invalid Product Id');
    const user = await this.userModel.findOne({ email });
    if (!user) throw new BadRequestException('User does not exist');

    const cartItem = await this.cartModel.findOne({
      userId: user._id,
      _id,
    });

    if (!cartItem) throw new BadRequestException('Product Not found');
    cartItem.quantity = number;

    return cartItem.save();
  }

  async returnUserId(email: string): Promise<any> {
    const user = await this.userModel.findOne({ email });
    if (!user) throw new BadRequestException('User does not exist');
    return user._id;
  }

  async emptyCart(condition) {
    return this.cartModel.deleteMany(condition);
  }

  async getAllCartItems(condition) {
    return this.cartModel.find(condition).sort({ _id: -1 }).lean();
  }
  async getSavedItems(condition) {
    return this.savedModel.find(condition).sort({ _id: -1 }).lean();
  }

  async createNewsLetter(email: string) {
    const newsLetterEmail = await this.newsletterModel.findOne({ email });
    if (newsLetterEmail) return true;
    const newsletter: NewsLetter = {
      email: email,
      createdAt: moment().toDate(),
      updatedAt: moment().toDate(),
    };
    return this.newsletterModel.create(newsletter);
  }
}
