import {
  Body,
  Controller,
  Get,
  Patch,
  Request,
  Query,
  Delete,
  Post,
} from '@nestjs/common';
import { User, Cart, Saved, GuestCart } from './schemas';
import { UserService } from './user.service';
import { Roles } from './../auth/decorators/roles.decorator';
import {
  EditUserDto,
  AddressDto,
  ProductIdDto,
  SessionIdDto,
  RemoveFromGuestDto,
  EditGuestDto,
  SessionId2Dto,
} from './dto';
import { CartItemDto } from '../mall/dto';
import { AdminRole, UserRole } from './constants';
import { Public } from '../auth/decorators/meta';
import { v4 as uuid } from 'uuid';
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Roles(AdminRole)
  @Get()
  async getUser(@Request() req): Promise<User[]> {
    const condition: { organization?: string } = {};
    return this.userService.findAll(condition);
  }

  //get user profile
  @Roles(UserRole, AdminRole)
  @Get('/my-profile')
  async myProfile(@Request() req): Promise<User> {
    const { _id } = req?.user;
    return this.userService.findOne({ _id });
  }

  @Patch('/my-profile')
  async editUser(@Request() req, @Body() body: EditUserDto): Promise<User[]> {
    const user = req?.user;
    return this.userService.findOneAndUpdate({ _id: user?._id }, body, {
      new: true,
    });
  }

  @Patch('/add-address')
  async addAddress(@Request() req, @Body() body: AddressDto): Promise<User> {
    const user = req?.user;
    return this.userService.findOneAndUpdate({ _id: user?._id }, body, {
      new: true,
    });
  }

  @Get('/cart')
  async getCartItems(@Request() req): Promise<Cart[]> {
    const user = req?.user;
    return this.userService.getAllCartItems({
      userId: user._id,
    });
  }

  @Get('/saved-items')
  async getSavedItems(@Request() req): Promise<Saved[]> {
    const user = req?.user;
    return this.userService.getSavedItems({
      userId: user._id,
    });
  }

  @Delete('/saved-items')
  async deleteSavedItems(
    @Request() req,
    @Query() query: ProductIdDto,
  ): Promise<any> {
    const user = req?.user;
    return this.userService.removeFromSavedItems(user.email, query.productId);
  }

  @Public()
  @Post('/add-to-guest')
  async addToGuestCart(
    @Body() body: CartItemDto,
    @Query() query: SessionIdDto,
  ) {
    const condition: { _id?: string } = {};
    if (query.sessionId) {
      condition._id = query.sessionId;
    } else {
      const sessionId = uuid();
      condition._id = sessionId;
    }
    return this.userService.addToGuestCart(body, condition._id);
  }

  @Public()
  @Delete('/delete-from-guest')
  async deleteFromGuest(@Query() query: RemoveFromGuestDto): Promise<boolean> {
    return this.userService.removeGuestCart(query.productId, query.sessionId);
  }

  @Public()
  @Patch('/edit-guest-quantity')
  async editGuestQuantity(@Query() query: EditGuestDto): Promise<GuestCart> {
    return this.userService.changeGuestQuantity(query);
  }

  @Public()
  @Get('/get-guest-items')
  async getGuestItems(@Query() query: SessionIdDto) {
    return this.userService.getGetGuestItems({ sessionId: query.sessionId });
  }

  @Get('/change-items')
  async changeItems(@Request() req, @Query() query: SessionId2Dto) {
    const { email } = req.user;
    return this.userService.changeItems(email, query.sessionId);
  }
}
