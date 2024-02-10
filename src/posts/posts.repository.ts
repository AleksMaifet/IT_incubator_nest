import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { CreatePostDto, UpdatePostDto } from './dto'
import { PostModel } from './post.model'
import { GetPostsRequestQuery, IPostsResponse } from './interfaces'

@Injectable()
class PostsRepository {
  constructor(
    @InjectModel(PostModel.name)
    private readonly postModel: Model<PostModel>,
  ) {}

  public async getAll(dto: GetPostsRequestQuery<number>) {
    const { sortBy, sortDirection, pageNumber, pageSize } = dto

    const totalCount = await this.postModel.countDocuments()
    const pagesCount = Math.ceil(totalCount / pageSize)
    const skip = (pageNumber - 1) * pageSize

    const findOptions = {
      limit: pageSize,
      skip: skip,
      sort: { [sortBy]: sortDirection },
    }

    const response: IPostsResponse = {
      pagesCount,
      page: pageNumber,
      pageSize,
      totalCount,
      items: [],
    }

    response.items = await this.postModel.find({}, null, findOptions).exec()

    return response
  }

  public async getPostsByBlogId(
    id: string,
    query: GetPostsRequestQuery<number>,
  ) {
    const { pageSize, pageNumber, sortDirection, sortBy } = query

    const totalCount = await this.postModel
      .find({ blogId: id })
      .countDocuments()
    const pagesCount = Math.ceil(totalCount / pageSize)
    const skip = (pageNumber - 1) * pageSize

    const findOptions = {
      limit: pageSize,
      skip: skip,
      sort: { [sortBy]: sortDirection },
    }

    const response: IPostsResponse = {
      pagesCount,
      page: pageNumber,
      pageSize,
      totalCount,
      items: [],
    }

    response.items = await this.postModel
      .find({ blogId: id }, null, findOptions)
      .exec()

    return response
  }

  public async getById(id: string) {
    return await this.postModel.findOne({ id }).exec()
  }

  public async updateById(id: string, dto: UpdatePostDto) {
    return await this.postModel.findOneAndUpdate({ id }, dto).exec()
  }

  public async create(dto: CreatePostDto) {
    return await this.postModel.create(dto)
  }

  public async deleteById(id: string) {
    return await this.postModel.findOneAndDelete({ id }).exec()
  }
}

export { PostsRepository }
