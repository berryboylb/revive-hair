import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import * as fs from 'fs';
import {
  Product,
  ProductDocument,
  Review,
  ReviewDocument,
  Category,
  CategoryDocument,
  State,
  StateDocument,
  LocalGovernment,
  LocalGovernmentDocument,
} from './schema';
import {
  CreateProductDto,
  PaginationParams,
  EditProductPrice,
  CategoryPaginationParams,
  NewReviewDto,
  SingleProductDto,
  CreateLocalDto,
  EditLocalGovernmentDto,
  StateDto,
} from './dto';
import * as moment from 'moment';
import { PaginateModel } from 'mongoose';
import { UserService } from '../user/user.service';
//to be imported
//product schema

@Injectable()
export class MallService {
  constructor(
    @InjectModel(Product.name)
    private productModel: PaginateModel<ProductDocument>,
    @InjectModel(Review.name)
    private reviewModel: Model<ReviewDocument>,
    @InjectModel(Category.name)
    private categoryModel: PaginateModel<CategoryDocument>,
    @InjectModel(State.name)
    private stateModel: Model<StateDocument>,
    @InjectModel(LocalGovernment.name)
    private localGovernmentModel: Model<LocalGovernmentDocument>,
    private userService: UserService,
  ) {}
  //update the image upload for the product
  //create a logger for this model
  private readonly logger = new Logger('Product');

  async onModuleInit() {
    this.logger.log('Mall model started...');
  }
  //create new product
  async createNewProduct(body: CreateProductDto, imgpath: string) {
    const newProduct: Product = {
      title: body.title,
      brand: body.brand ? body.brand : undefined,
      img: imgpath,
      currentPrice: Number(body.currentPrice),
      category: body.category,
      quantity: Number(body.quantity),
      description: body.description,
      discount: body.discount ? Number(body.discount) : undefined,
      rating: body.rating ? Number(body.rating) : undefined,
      formerprice: body.formerprice ? Number(body.formerprice) : undefined,
      size: body.size
        ? body.size.split(',').map((size) => size.trim())
        : undefined,
      color: body.color
        ? body.color.split(',').map((color) => color.trim())
        : undefined,
      createdAt: moment().toDate(),
      updatedAt: moment().toDate(),
    };
    return this.productModel.create(newProduct);
  }

  //find all products
  async findAll(params: PaginationParams): Promise<any> {
    const { page, perPage } = params;
    const options = {
      page: page || 1,
      limit: perPage || 50,
      sort: { _id: -1 },
      lean: true,
    };
    return this.productModel.paginate({}, options);
  }

  getAllCategories(params: PaginationParams): Promise<any> {
    const { page, perPage } = params;
    const options = {
      page: page || 1,
      limit: perPage || 10,
      sort: { _id: -1 },
      lean: true,
    };

    return this.categoryModel.paginate({}, options);
  }
  //get products by category
  async getProductsByCategory(params: CategoryPaginationParams) {
    const { page, perPage, category } = params;
    const options = {
      page: page || 1,
      limit: perPage || 50,
      sort: { _id: -1 },
      lean: true,
    };
    return this.productModel.paginate(
      {
        $or: [
          {
            category: {
              $in: [category],
            },
          },
          { title: category },
        ],
      },
      options,
    );
  }

  //find one
  async findOne(
    condition,
    options?: { select: string },
  ): Promise<Product | undefined> {
    const product = await this.productModel.findOne(condition, options?.select);
    return product;
  }

  //find by id
  async findById(id: string) {
    const ObjectId = mongoose.Types.ObjectId;
    if (!ObjectId.isValid(id)) throw new BadRequestException('Invalid User Id');
    return this.productModel.findById(id);
  }

  getDiscount(discount: number) {
    return discount / 100;
  }

  async updateProductPrice(id: string, body: EditProductPrice) {
    const ObjectId = mongoose.Types.ObjectId;
    if (!ObjectId.isValid(id)) throw new BadRequestException('Invalid User Id');
    const product = await this.productModel.findById(
      id,
      '+currentPrice +discount +formerprice',
    );
    if (!product) throw new BadRequestException('Product does not exist');
    const { discount } = body;
    product.formerprice = product.currentPrice;
    const disCountPercentage = this.getDiscount(Number(discount));
    const result = product.currentPrice * disCountPercentage;
    product.currentPrice = Math.round(product.currentPrice - result);
    product.discount = Number(discount);
    product.description = body.description;
    return await product.save();
  }

  //delete product
  async deleteProduct(id: string) {
    const ObjectId = mongoose.Types.ObjectId;
    const folderName = 'uploads/productsimages/';
    if (!ObjectId.isValid(id)) throw new BadRequestException('Invalid User Id');
    const product = await this.productModel.findById(id);
    if (!product) throw new BadRequestException('Product does not exist');
    fs.unlinkSync(folderName + product.img);
    return product.remove();
  }

  //create new catgory
  async createNewCategory(category: string) {
    const categories = await this.categoryModel.findOne({ category });
    if (categories) return true;
    const newCategory: Category = {
      category: category,
      createdAt: moment().toDate(),
      updatedAt: moment().toDate(),
    };
    return this.categoryModel.create(newCategory);
  }

  //create a new review
  async createNewReview(
    body: NewReviewDto,
    query: SingleProductDto,
    userId: string,
  ) {
     const ObjectId = mongoose.Types.ObjectId;
     if (!ObjectId.isValid(userId))
       throw new BadRequestException('Invalid User Id');
    const review: Review = {
      review: body.review,
      name: body.name,
      productId: query.productId,
      userId: userId,
      likes: null,
      createdAt: moment().toDate(),
      updatedAt: moment().toDate(),
    };
    return this.reviewModel.create(review);
  }

  //get reviews for a product
  async findReviews(productId: string) {
     const ObjectId = mongoose.Types.ObjectId;
     if (!ObjectId.isValid(productId))
       throw new BadRequestException('Invalid Product Id');
    return this.reviewModel.find({ productId });
  }

  //find single review
  async findOneReview(_id: string) {
     const ObjectId = mongoose.Types.ObjectId;
     if (!ObjectId.isValid(_id))
       throw new BadRequestException('Invalid  Id');
    return this.reviewModel.findOne({ _id });
  }

  //edit review
  async editReview(
    reviewId: string,
    newReview: string,
  ): Promise<any> {
     const ObjectId = mongoose.Types.ObjectId;
     if (!ObjectId.isValid(reviewId))
       throw new BadRequestException('Invalid Review Id');
    const review = await this.reviewModel.findById(reviewId);
    if (!review) throw new BadRequestException('Review  does not exist');
    review.review = newReview;
    review.save();
    return true;
  }

  //delete review
  async deleteReview(reviewId: string) {
     const ObjectId = mongoose.Types.ObjectId;
     if (!ObjectId.isValid(reviewId))
       throw new BadRequestException('Invalid Review Id');
    const review = await this.reviewModel.findById(reviewId);
    if (!review) throw new BadRequestException('Review  does not exist');
    return review.remove();
  }

  //get reviews by productId
  async getReviewsByProductId(productId: string) {
     const ObjectId = mongoose.Types.ObjectId;
     if (!ObjectId.isValid(productId))
       throw new BadRequestException('Invalid Review Id');
    return this.reviewModel.find({ productId });
  }

  //like review
  async likeReview(condition: {
    reviewId: string;
    userId: string;
  }) {
     const ObjectId = mongoose.Types.ObjectId;
     if (!ObjectId.isValid(condition.reviewId))
       throw new BadRequestException('Invalid Review Id');
     if (!ObjectId.isValid(condition.userId))
       throw new BadRequestException('Invalid User Id');
    const review = await this.reviewModel.findById(condition.reviewId);
    if (!review) throw new BadRequestException('Review  does not exist');
    //check if the post has already been liked
    if (
      review.likes.filter(
        (like) => like.user.toString() === condition.userId.toString(),
      ).length > 0
    )
      throw new BadRequestException('Review has been liked');
    review.likes.unshift({ user: condition.userId });
    await review.save();
    return review.likes;
  }

  //unlike review
  async unlikeReview(condition: {
    reviewId: string;
    userId: string;
  }) {
    const ObjectId = mongoose.Types.ObjectId;
    if (!ObjectId.isValid(condition.reviewId))
      throw new BadRequestException('Invalid Review Id');
    if (!ObjectId.isValid(condition.userId))
      throw new BadRequestException('Invalid User Id');
    const review = await this.reviewModel.findById(condition.reviewId);
    if (!review) throw new BadRequestException('Review  does not exist');

    //check if the post has already been liked
    if (
      review.likes.filter(
        (like) => like.user.toString() === condition.userId.toString(),
      ).length === 0
    )
      throw new BadRequestException('Review has been liked');

    //get remove index
    const removeIndex = review.likes
      .map((like) => like.user.toString())
      .indexOf(condition.userId.toString());

    //removing it
    review.likes.splice(removeIndex, 1);
    review.save();
    return review.likes;
  }

  //add new state
  async addNewState(state: StateDto) {
    return this.stateModel.create(state);
  }

  //get all states
  async getAllStates() {
    return this.stateModel.find({});
  }

  async editState(stateId: string, newState: string) {
    const ObjectId = mongoose.Types.ObjectId;
    if (!ObjectId.isValid(stateId))
      throw new BadRequestException('Invalid  Id');
    const formerState = await this.stateModel.findById(stateId);
    if (!formerState) throw new BadRequestException("State wasn't found");
    formerState.state = newState;
    return formerState.save();
  }

  async deleteState(stateId: string) {
    const ObjectId = mongoose.Types.ObjectId;
    if (!ObjectId.isValid(stateId))
      throw new BadRequestException('Invalid  Id');
    const state = await this.stateModel.findById(stateId);
    if (!state) throw new BadRequestException("State wasn't found");
    return state.remove();
  }

  async getAllLocalGovernment() {
    return this.localGovernmentModel.find({});
  }

  async editLocalGovernment(
    localId: string,
    body: EditLocalGovernmentDto,
  ) {
    const ObjectId = mongoose.Types.ObjectId;
    if (!ObjectId.isValid(localId))
      throw new BadRequestException('Invalid  Id');
    const formerLocalGovt = await this.localGovernmentModel.findById(localId);
    if (!formerLocalGovt)
      throw new BadRequestException("Local Goverment wasn't found");
    formerLocalGovt.localGovernment = body.localGovernment;
    formerLocalGovt.state = body.state;
    formerLocalGovt.price = body.price;
    return formerLocalGovt.save();
  }

  async deletelocalGovernment(localId: string) {
      const ObjectId = mongoose.Types.ObjectId;
      if (!ObjectId.isValid(localId))
        throw new BadRequestException('Invalid  Id');
    const localGovernment = await this.localGovernmentModel.findById(localId);
    if (!localGovernment)
      throw new BadRequestException("localgoverment wasn't found");
    return localGovernment.remove();
  }

  async getLocalGovernment(state: string) {
    return this.localGovernmentModel.find({ state });
  }
  //add local government
  async addLocalGovernment(body: CreateLocalDto) {
    return this.localGovernmentModel.create(body);
  }

  //find price by localgovernment
  async getPrice(localGovernment: string) {
    const lga = await this.localGovernmentModel.findOne({ localGovernment });
    if (!lga) throw new BadRequestException("localgoverment wasn't found");
    return lga.price;
  }

  async getTotal(email: string, localGovernment: string) {
    const totalInCart: number = await this.userService.getTotal(email);
    const Additionalfees: number = await this.getPrice(localGovernment);
    const totalFees: number = totalInCart + Additionalfees;
    return Math.round(totalFees);
  }
}
