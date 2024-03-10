import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { BasePostLikeDto, CreatePostDto, UpdatePostDto } from '../dto'
import { PostModel } from '../post.model'
import {
  GetPostsRequestQuery,
  IPostsResponse,
  IUserPostLike,
  LIKE_POST_USER_STATUS_ENUM,
} from '../interfaces'
import { DEFAULTS_POST_LIKE_STATUS } from '../constants'

const { LIKES_COUNT, DISLIKES_COUNT, MAX_NEWEST_LIKES_COUNT } =
  DEFAULTS_POST_LIKE_STATUS

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

  public async updateLikeWithStatusLikeOrDislike(
    dto: {
      postId: string
      isFirstTime: boolean
      userLikeInfo: IUserPostLike
    } & BasePostLikeDto,
  ) {
    const { postId, likeStatus, isFirstTime, userLikeInfo } = dto

    const post = await this.postModel.findOne({ id: postId })
    const currentPost = post!
    const { extendedLikesInfo } = currentPost

    switch (likeStatus as string) {
      case LIKE_POST_USER_STATUS_ENUM.None:
        extendedLikesInfo.likesCount = LIKES_COUNT
        extendedLikesInfo.dislikesCount = DISLIKES_COUNT
        break
      case LIKE_POST_USER_STATUS_ENUM.Like:
        extendedLikesInfo.likesCount += 1

        if (extendedLikesInfo.newestLikes.length >= MAX_NEWEST_LIKES_COUNT) {
          extendedLikesInfo.newestLikes.pop()
        }

        extendedLikesInfo.newestLikes.unshift(userLikeInfo)

        if (isFirstTime) {
          break
        }

        extendedLikesInfo.dislikesCount -= 1

        break
      case LIKE_POST_USER_STATUS_ENUM.Dislike:
        extendedLikesInfo.dislikesCount += 1

        const index = extendedLikesInfo.newestLikes.findIndex(
          (info) => info.userId === userLikeInfo.userId,
        )

        if (index !== -1) {
          extendedLikesInfo.newestLikes.splice(index, 1)
        }

        if (isFirstTime) {
          break
        }

        extendedLikesInfo.likesCount -= 1

        break

      default:
        break
    }

    post.markModified('extendedLikesInfo')

    return await currentPost.save()
  }
}

export { PostsRepository }
