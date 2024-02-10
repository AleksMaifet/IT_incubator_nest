import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { Injectable } from '@nestjs/common'
import { CommentModel } from './comment.model'
import {
  GetCommentsRequestQuery,
  IComments,
  ICommentsResponse,
} from './interfaces'

@Injectable()
class CommentsRepository {
  constructor(
    @InjectModel(CommentModel.name)
    private readonly commentModel: Model<CommentModel>,
  ) {}

  private _createdFindOptionsAndResponse(
    dto: GetCommentsRequestQuery<number> & {
      totalCount: number
    },
  ) {
    const { totalCount, sortBy, sortDirection, pageNumber, pageSize } = dto

    const pagesCount = Math.ceil(totalCount / pageSize)
    const skip = (pageNumber - 1) * pageSize

    const findOptions = {
      limit: pageSize,
      skip: skip,
      sort: { [sortBy]: sortDirection },
    }

    const response: ICommentsResponse = {
      pagesCount,
      page: pageNumber,
      pageSize,
      totalCount,
      items: [],
    }

    return { response, findOptions }
  }

  private _mapGenerateCommentResponse(comment: IComments) {
    const { id, content, commentatorInfo, createdAt, likesInfo } = comment

    return {
      id,
      content,
      commentatorInfo,
      createdAt,
      likesInfo,
    }
  }

  public async create(dto: IComments) {
    const comment = await this.commentModel.create(dto)

    return this._mapGenerateCommentResponse(comment)
  }

  public async getById(id: string) {
    const comment = await this.commentModel.findOne({ id }).exec()

    if (!comment) {
      return null
    }

    return this._mapGenerateCommentResponse(comment)
  }

  public async getAllByPostId(dto: {
    postId: string
    query: GetCommentsRequestQuery<number>
  }) {
    const { postId, query } = dto

    const totalCount = await this.commentModel.find({ postId }).countDocuments()

    const { response, findOptions } = this._createdFindOptionsAndResponse({
      ...query,
      totalCount,
    })

    const comments = await this.commentModel
      .find({ postId }, null, findOptions)
      .exec()

    response.items = comments.map(this._mapGenerateCommentResponse)

    return response
  }

  public async updateById(dto: Pick<IComments, 'id' | 'content'>) {
    const { id, content } = dto

    return await this.commentModel.findOneAndUpdate({ id }, { content }).exec()
  }

  public async deleteById(id: string) {
    return await this.commentModel.findOneAndDelete({ id }).exec()
  }
}

export { CommentsRepository }
