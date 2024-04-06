import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { CreateBlogDto, UpdateBlogDto } from '../dto'
import { BlogModel } from '../models'
import { GetBlogsRequestQuery, IBlog, IBlogsResponse } from '../interfaces'

@Injectable()
class BlogsRepository {
  constructor(
    @InjectModel(BlogModel.name)
    private readonly blogModel: Model<BlogModel>,
  ) {}

  private async getAllBySearchNameTerm(dto: GetBlogsRequestQuery<number>) {
    const { searchNameTerm, ...rest } = dto

    const regex = new RegExp(searchNameTerm, 'i')
    const totalCount = await this.blogModel
      .find({ name: { $regex: regex } })
      .countDocuments()

    const { response, findOptions } =
      this._createdFindOptionsAndResponse<IBlog>({
        ...rest,
        totalCount,
      })

    response.items = await this.blogModel
      .find({ name: { $regex: regex } }, null, findOptions)
      .exec()

    return response
  }

  private async getAllWithoutSearchNameTerm(
    dto: Omit<GetBlogsRequestQuery<number>, 'searchNameTerm'>,
  ) {
    const totalCount = await this.blogModel.countDocuments()

    const { response, findOptions } =
      this._createdFindOptionsAndResponse<IBlog>({
        ...dto,
        totalCount,
      })

    response.items = await this.blogModel.find({}, null, findOptions).exec()

    return response
  }

  private _createdFindOptionsAndResponse<T>(
    dto: Omit<
      GetBlogsRequestQuery<number> & {
        totalCount: number
      },
      'searchNameTerm'
    >,
  ) {
    const { totalCount, sortBy, sortDirection, pageNumber, pageSize } = dto

    const pagesCount = Math.ceil(totalCount / pageSize)
    const skip = (pageNumber - 1) * pageSize

    const findOptions = {
      limit: pageSize,
      skip: skip,
      sort: { [sortBy]: sortDirection },
    }

    const response: IBlogsResponse<T> = {
      pagesCount,
      page: pageNumber,
      pageSize,
      totalCount,
      items: [],
    }

    return { response, findOptions }
  }

  public async getAll(dto: GetBlogsRequestQuery<number>) {
    const { searchNameTerm, ...rest } = dto

    if (searchNameTerm === 'null') {
      return await this.getAllWithoutSearchNameTerm(rest)
    }

    return await this.getAllBySearchNameTerm(dto)
  }

  public async getById(id: string) {
    return await this.blogModel.findOne({ id }).exec()
  }

  public async updateById(id: string, dto: UpdateBlogDto) {
    return await this.blogModel.findOneAndUpdate({ id }, dto).exec()
  }

  public async create(dto: CreateBlogDto) {
    return await this.blogModel.create(dto)
  }

  public async deleteById(id: string) {
    return await this.blogModel.findOneAndDelete({ id }).exec()
  }
}

export { BlogsRepository }
