import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import {
  GetPostsRequestQuery,
  IPost,
  IPostsResponse,
  LIKE_POST_USER_STATUS_ENUM,
} from '../interfaces'
import { BasePostLikeDto, UpdatePostDto } from '../dto'
import { DEFAULTS_POST_LIKE_STATUS } from '../constants'
import { PostPgEntity } from '../models'
import { PostLikePgEntity } from '../../likes'

const { LIKES_COUNT, DISLIKES_COUNT, MY_STATUS } = DEFAULTS_POST_LIKE_STATUS

@Injectable()
class PostsSqlRepository {
  constructor(
    @InjectRepository(PostPgEntity)
    private readonly postRepository: Repository<PostPgEntity>,
    @InjectRepository(PostLikePgEntity)
    private readonly postLikeRepository: Repository<PostLikePgEntity>,
  ) {}

  private async _mapGeneratePostResponse(
    post: Pick<
      IPost,
      'id' | 'title' | 'shortDescription' | 'content' | 'createdAt'
    > & {
      likesCount: number
      dislikesCount: number
      blogId: string
      blogName: string
    },
  ) {
    const {
      id,
      blogId,
      title,
      shortDescription,
      content,
      blogName,
      createdAt,
      likesCount,
      dislikesCount,
    } = post

    const newestLikes = await this.postLikeRepository
      .createQueryBuilder()
      .where('"postId" = :id', { id })
      .andWhere('status = :status', { status: LIKE_POST_USER_STATUS_ENUM.Like })
      .select('"addedAt"', 'addedAt')
      .addSelect('"userId"', 'userId')
      .addSelect('"userLogin"', 'login')
      .orderBy('"addedAt"', 'DESC')
      .limit(3)
      .getRawMany()

    return {
      id,
      title,
      shortDescription,
      content,
      blogId,
      blogName,
      createdAt,
      extendedLikesInfo: {
        likesCount,
        dislikesCount,
        myStatus: MY_STATUS,
        newestLikes,
      },
    }
  }

  private _createdResponse(
    dto: Pick<
      GetPostsRequestQuery<number> & {
        totalCount: number
      },
      'totalCount' | 'pageNumber' | 'pageSize'
    >,
  ) {
    const { totalCount, pageNumber, pageSize } = dto

    const pagesCount = Math.ceil(totalCount / pageSize)
    const skip = (pageNumber - 1) * pageSize

    const response: IPostsResponse = {
      pagesCount,
      page: pageNumber,
      pageSize,
      totalCount,
      items: [],
    }

    return { response, skip }
  }

  public async getAll(dto: GetPostsRequestQuery<number>) {
    const { sortBy, sortDirection, pageNumber, pageSize } = dto

    const totalCount = await this.postRepository.count()

    const { response, skip } = this._createdResponse({
      pageNumber,
      pageSize,
      totalCount,
    })

    const result = await this.postRepository
      .createQueryBuilder('p')
      .leftJoin('p.blog', 'b')
      .select('p.id', 'id')
      .addSelect('p.title', 'title')
      .addSelect('p.shortDescription', 'shortDescription')
      .addSelect('p.content', 'content')
      .addSelect('p.createdAt', 'createdAt')
      .addSelect('p.likesCount', 'likesCount')
      .addSelect('p.dislikesCount', 'dislikesCount')
      .addSelect('b.id', 'blogId')
      .addSelect('b.name', 'blogName')
      .orderBy(`"${sortBy}"`, sortDirection.toUpperCase() as 'ASC' | 'DESC')
      .skip(skip)
      .limit(pageSize)
      .getRawMany()

    const items = []

    for (let i = 0; i < result.length; i++) {
      const post = await this._mapGeneratePostResponse(result[i])

      items.push(post)
    }

    response.items = items
    return response
  }

  public async getPostsByBlogId(id: string, dto: GetPostsRequestQuery<number>) {
    const { pageSize, pageNumber, sortDirection, sortBy } = dto

    const totalCount = await this.postRepository.countBy({ blog: { id } })

    const { response, skip } = this._createdResponse({
      pageNumber,
      pageSize,
      totalCount,
    })

    const result = await this.postRepository
      .createQueryBuilder('p')
      .leftJoin('p.blog', 'b')
      .select('p.id', 'id')
      .addSelect('b.id', 'blogId')
      .addSelect('b.name', 'blogName')
      .addSelect('p.title', 'title')
      .addSelect('p.shortDescription', 'shortDescription')
      .addSelect('p.content', 'content')
      .addSelect('p.createdAt', 'createdAt')
      .addSelect('p.likesCount', 'likesCount')
      .addSelect('p.dislikesCount', 'dislikesCount')
      .where('p.blog.id = :id', { id })
      .orderBy(`"${sortBy}"`, sortDirection.toUpperCase() as 'ASC' | 'DESC')
      .skip(skip)
      .limit(pageSize)
      .getRawMany()

    const items = []

    for (let i = 0; i < result.length; i++) {
      const post = await this._mapGeneratePostResponse(result[i])

      items.push(post)
    }

    response.items = items

    return response
  }

  public async getById(id: string) {
    const result = await this.postRepository
      .createQueryBuilder('p')
      .leftJoin('p.blog', 'b')
      .select('p.id', 'id')
      .addSelect('p.title', 'title')
      .addSelect('p.shortDescription', 'shortDescription')
      .addSelect('p.content', 'content')
      .addSelect('p.createdAt', 'createdAt')
      .addSelect('p.likesCount', 'likesCount')
      .addSelect('p.dislikesCount', 'dislikesCount')
      .addSelect('b.id', 'blogId')
      .addSelect('b.name', 'blogName')
      .where('p.id = :id', { id })
      .getRawOne()

    if (!result) {
      return null
    }

    return await this._mapGeneratePostResponse({
      ...result,
    })
  }

  public async updateById(id: string, dto: UpdatePostDto) {
    const { title, shortDescription, content, blogId } = dto

    const result = await this.postRepository.update(
      { id },
      {
        title,
        shortDescription,
        content,
        blog: { id: blogId },
      },
    )

    return result.affected
  }

  public async create({ dto, blogId }: { dto: IPost; blogId: string }) {
    const {
      title,
      shortDescription,
      content,
      createdAt,
      extendedLikesInfo: { likesCount, dislikesCount },
    } = dto

    const post = await this.postRepository.save({
      title,
      shortDescription,
      content,
      createdAt,
      likesCount,
      dislikesCount,
      blog: { id: blogId },
    })

    const result = await this.postRepository
      .createQueryBuilder('p')
      .leftJoin('p.blog', 'b')
      .select('p.id', 'id')
      .addSelect('p.title', 'title')
      .addSelect('p.shortDescription', 'shortDescription')
      .addSelect('p.content', 'content')
      .addSelect('p.createdAt', 'createdAt')
      .addSelect('p.likesCount', 'likesCount')
      .addSelect('p.dislikesCount', 'dislikesCount')
      .addSelect('b.id', 'blogId')
      .addSelect('b.name', 'blogName')
      .where('p.id = :id', { id: post.id })
      .getRawOne()

    return await this._mapGeneratePostResponse({
      ...result,
    })
  }

  public async deleteById(id: string) {
    const result = await this.postRepository.delete({ id })

    return result.affected
  }

  public async updateLikeWithStatusLikeOrDislike(
    dto: {
      postId: string
      isFirstTime: boolean
    } & BasePostLikeDto,
  ) {
    const { postId, likeStatus, isFirstTime } = dto

    const result = await this.postRepository
      .createQueryBuilder()
      .update()
      .set({
        likesCount: () => {
          switch (likeStatus as string) {
            case LIKE_POST_USER_STATUS_ENUM.None:
              return `${LIKES_COUNT}`
            case LIKE_POST_USER_STATUS_ENUM.Like:
              return 'likesCount + 1'
            case LIKE_POST_USER_STATUS_ENUM.Dislike:
              if (isFirstTime) {
                return 'likesCount'
              }
              return 'GREATEST(likesCount - 1, 0)'
            default:
              return 'likesCount'
          }
        },
        dislikesCount: () => {
          switch (likeStatus as string) {
            case LIKE_POST_USER_STATUS_ENUM.None:
              return `${DISLIKES_COUNT}`
            case LIKE_POST_USER_STATUS_ENUM.Dislike:
              return 'dislikesCount + 1'
            case LIKE_POST_USER_STATUS_ENUM.Like:
              if (isFirstTime) {
                return 'dislikesCount'
              }
              return 'GREATEST(dislikesCount - 1, 0)'
            default:
              return 'dislikesCount'
          }
        },
      })
      .where('id = :postId', { postId })
      .execute()

    return result.affected
  }
}

export { PostsSqlRepository }
