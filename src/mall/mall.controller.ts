import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  Query,
  Request,
  Delete,
  Put,
  UseInterceptors,
  UploadedFiles,
  Logger,
  Param,
  Res,
} from '@nestjs/common';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/meta';
import { AdminRole, UserRole } from '../user/constants';
import { MallService } from './mall.service';
import { UserService } from '../user/user.service';
import {
  CreateProductDto,
  PaginationParams,
  SingleProductDto,
  EditProductPrice,
  CartItemDto,
  CategoryPaginationParams,
  NewReviewDto,
  ReviewIdDto,
  EditReviewDto,
  ProductIdDto,
  QuantityDto,
  CreateLocalDto,
  StateDto,
  StateIdDto,
  LocalGovernmentIdDto,
  EditLocalGovernmentDto,
  DeliveryFeeDto,
} from './dto';
import { Product } from './schema/product.schema';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { v4 as uuid } from 'uuid';
import path = require('path');
import { join } from 'path';
import * as fs from 'fs';
//import them later
@Controller('products')
export class MallController {
  constructor(
    private mallService: MallService,
    private userService: UserService,
  ) {}

  private readonly logger = new Logger('Product');

  //create a product
  @Roles(AdminRole)
  @UseInterceptors(
    FilesInterceptor('images', 5, {
      limits: { fileSize: 1000000 },
      storage: diskStorage({
        destination: './uploads/productsimages',
        filename: (req, file, callback) => {
          if (file.size > 1000000)
            throw new BadRequestException('File is greater than 1mb');
          const filename: string =
            path.parse(file.originalname).name.replace(/\s/g, '') + uuid();
          const extension: string = path.parse(file.originalname).ext;
          const unique = `${filename}${extension}`;
          callback(null, unique);
        },
      }),
    }),
  )
  @Post('/create')
  async createProduct(
    @Body() body: CreateProductDto,
    @UploadedFiles() files: Array<Express.Multer.File>,
  ) {
    const image = files && files[0];
    if (!image) throw new BadRequestException('Invalid Image');
    await this.mallService.createNewCategory(body.category);
    return this.mallService.createNewProduct(body, image.filename);
  }

  //get the product images
  @Public()
  @Get('image/:imagename')
  findImage(@Param('imagename') imagename: any, @Res() res: any) {
    const folderName = 'uploads/productsimages/';
    if (!(folderName + imagename))
      throw new BadRequestException('Image does not exist');
    if (!fs.existsSync(folderName + imagename))
      throw new BadRequestException('Image does not exist');
    return res.sendFile(join(process.cwd(), folderName + imagename));
  }

  //get all categories
  @HttpCode(HttpStatus.OK)
  @Public()
  @Get('/allcategories')
  async getAllCatgories(@Query() query: PaginationParams) {
    return this.mallService.getAllCategories(query);
  }

  //get products by category
  @HttpCode(HttpStatus.OK)
  @Public()
  @Get('/bycategory')
  async getProductsByCategory(
    @Query() query: CategoryPaginationParams,
  ): Promise<any> {
    return this.mallService.getProductsByCategory(query);
  }

  //get all products sort and paginate
  @HttpCode(HttpStatus.OK)
  @Public()
  @Get('/')
  async getAllProducts(@Query() query: PaginationParams): Promise<Product[]> {
    return this.mallService.findAll(query);
  }

  //get single product
  @HttpCode(HttpStatus.OK)
  @Public()
  @Get('/singleProduct')
  async getSingleProducts(@Query() query: SingleProductDto): Promise<Product> {
    const Product = await this.mallService.findOne({ _id: query.productId });
    if (!Product) throw new BadRequestException('Product does not exist');
    return Product;
  }

  @Roles(AdminRole)
  @HttpCode(HttpStatus.OK)
  @Patch('/edit')
  async editProduct(
    @Body() body: EditProductPrice,
    @Query() query: SingleProductDto,
  ): Promise<any> {
    return this.mallService.updateProductPrice(query.productId, body);
  }

  @HttpCode(HttpStatus.OK)
  @Roles(AdminRole)
  @Delete('/delete')
  async deleteProduct(@Query() query: SingleProductDto): Promise<any> {
    return this.mallService.deleteProduct(query.productId);
  }

  @HttpCode(HttpStatus.OK)
  @Roles(AdminRole, UserRole)
  @Patch('/save')
  async savedItems(
    @Request() req,
    @Query() query: SingleProductDto,
  ): Promise<any> {
    const { email } = req.user;
    const product = await this.mallService.findOne({ _id: query.productId });
    if (!product) throw new BadRequestException('An error occured');
    return this.userService.addToSaveItems(email, product);
  }

  //cart
  @HttpCode(HttpStatus.OK)
  @Roles(AdminRole, UserRole)
  @Patch('/cart')
  async cart(@Request() req, @Body() body: CartItemDto): Promise<any> {
    const { email } = req.user;
    return this.userService.addtoCart(email, body);
  }

  //remove item from cart
  @HttpCode(HttpStatus.OK)
  @Roles(AdminRole, UserRole)
  @Patch('/removefromcart')
  async removeFromCart(@Request() req, @Query() query: SingleProductDto) {
    const { email } = req.user;
    return this.userService.removeFromCart(email, query.productId);
  }

  //change the quantity
  @HttpCode(HttpStatus.OK)
  @Roles(AdminRole, UserRole)
  @Patch('/changeQuantity')
  async changeQuantity(@Request() req, @Query() query: QuantityDto) {
    const { email } = req.user;
    return this.userService.changeQuantity(
      email,
      query.quantity,
      query.productId,
    );
  }

  @HttpCode(HttpStatus.OK)
  @Roles(AdminRole, UserRole)
  @Get('/getTotal')
  async getTotal(@Request() req) {
    const { email } = req.user;
    return this.userService.getTotal(email);
  }

  @HttpCode(HttpStatus.OK)
  @Roles(AdminRole, UserRole)
  @Post('/createReview')
  async createReview(
    @Request() req,
    @Body() body: NewReviewDto,
    @Query() query: SingleProductDto,
  ): Promise<any> {
    const { _id } = req.user;
    return this.mallService.createNewReview(body, query, _id);
  }

  //edit review
  @HttpCode(HttpStatus.OK)
  @Roles(AdminRole, UserRole)
  @Put('/edit-Review')
  async editReview(
    @Request() req,
    @Body() body: EditReviewDto,
    @Query() query: ReviewIdDto,
  ) {
    const { _id, role } = req.user;
    const review = await this.mallService.findOneReview(query.reviewId);
    if (!review) throw new BadRequestException('Review Does not exist');
    if (role === UserRole && review.userId !== _id)
      throw new BadRequestException('Unauthorized access');
    return this.mallService.editReview(query.reviewId, body.newReview);
  }

  //delete review
  @HttpCode(HttpStatus.OK)
  @Roles(AdminRole, UserRole)
  @Delete('delete-Review')
  async deleteReview(@Request() req, @Query() query: ReviewIdDto) {
    const { role, _id } = req.user;
    const review = await this.mallService.findOneReview(query.reviewId);
    if (!review) throw new BadRequestException('Review Does not exist');
    if (role === UserRole && review.userId !== _id)
      throw new BadRequestException('Unauthorized access');
    return this.mallService.deleteReview(query.reviewId);
  }

  //get reviews
  @HttpCode(HttpStatus.OK)
  @Public()
  @Get('/getReviews')
  async getAllReviews(@Query() query: ProductIdDto) {
    return this.mallService.getReviewsByProductId(query.productId);
  }

  //like review
  @HttpCode(HttpStatus.OK)
  @Roles(AdminRole, UserRole)
  @Put('/like-review')
  async liKeReview(@Request() req, @Query() query: ReviewIdDto) {
    const { _id } = req.user;
    const condition: {
      reviewId: string;
      userId: string;
    } = {
      reviewId: query.reviewId,
      userId: _id,
    };
    return this.mallService.likeReview(condition);
  }

  //unlike review
  @HttpCode(HttpStatus.OK)
  @Roles(AdminRole, UserRole)
  @Put('/unlike-review')
  async unLiKeReview(@Request() req, @Query() query: ReviewIdDto) {
    const { _id } = req.user;
    const condition: {
      reviewId: string;
      userId: string;
    } = {
      reviewId: query.reviewId,
      userId: _id,
    };
    return this.mallService.unlikeReview(condition);
  }

  //add state
  @Roles(AdminRole)
  @Post('/addstate')
  async addNewstate(@Body() body: StateDto) {
    return this.mallService.addNewState(body);
  }

  //get states
  @Public()
  @Get('/getStates')
  async getAllStates() {
    return this.mallService.getAllStates();
  }

  //get local government
  @Get('/getlocalgovernment')
  async getLocalGovernment(@Query() query: StateDto) {
    return this.mallService.getLocalGovernment(query.state);
  }

  //add local goverment
  @Roles(AdminRole)
  @Post('/addlocalgoverment')
  async addLocalGovernment(@Body() body: CreateLocalDto) {
    return this.mallService.addLocalGovernment(body);
  }

  //edit state
  @Roles(AdminRole)
  @Patch('/edit-state')
  async editState(@Body() body: StateDto, @Query() query: StateIdDto) {
    return this.mallService.editState(query.stateId, body.state);
  }

  //delete state
  @Roles(AdminRole)
  @Delete('/delete-state')
  async deleteState(@Query() query: StateIdDto) {
    return this.mallService.deleteState(query.stateId);
  }

  //get all localgovernment
  @Public()
  @Get('/getAllLocalGovernment')
  async getAllLocalGoverment() {
    return this.mallService.getAllLocalGovernment();
  }

  //delete local government
  @Roles(AdminRole)
  @Delete('/delete-local-government')
  async deleteGovernment(@Query() query: LocalGovernmentIdDto) {
    return this.mallService.deletelocalGovernment(query.LocalGovernmentId);
  }

  @Roles(AdminRole)
  @Patch('/edit-local-government')
  async editLocalGovernment(
    @Query() query: LocalGovernmentIdDto,
    @Body() body: EditLocalGovernmentDto,
  ) {
    return this.mallService.editLocalGovernment(query.LocalGovernmentId, body);
  }
  //edit local goverment

  @Public()
  @Get('/get-delivery-fee')
  async getDeliveryFee(@Query() query: DeliveryFeeDto) {
    return this.mallService.getPrice(query.localGovernment);
  }

  @Get('/get-processed-fees')
  async getProcessedFees(@Request() req) {
    const { email, localGovernment } = req?.user;
    if (!email) throw new BadRequestException('Email is missing');
    if (!localGovernment)
      throw new BadRequestException(
        'Please add a local Government to your profile',
      );
    const userId = await this.userService.returnUserId(email);
    const cartItems = await this.userService.getAllCartItems({
      userId,
    });
    if (cartItems.length === 0) throw new BadRequestException('Cart is empty');

    return this.mallService.getTotal(email, localGovernment);
  }
}
