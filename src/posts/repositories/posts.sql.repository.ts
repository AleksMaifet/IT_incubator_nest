import { Injectable } from '@nestjs/common'
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm'
import { DataSource, Repository } from 'typeorm'
import {
  GetPostsRequestQuery,
  IPost,
  IPostsResponse,
  LIKE_POST_USER_STATUS_ENUM,
} from '../interfaces'
import { BasePostLikeDto, UpdatePostDto } from '../dto'
import { DEFAULTS_POST_LIKE_STATUS } from '../constants'
import { PostPgEntity } from '../../configs/postgres/entities'

const { LIKES_COUNT, DISLIKES_COUNT, MY_STATUS } = DEFAULTS_POST_LIKE_STATUS

@Injectable()
class PostsSqlRepository {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    @InjectRepository(PostPgEntity)
    private readonly repository: Repository<PostPgEntity>,
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

    const newestLikes = await this.dataSource.query(
      `
      SELECT "addedAt", "userId", "userLogin" AS login FROM "postLike"
      WHERE status = $1 AND "postId" = $2
      ORDER BY "addedAt" DESC LIMIT 3
    `,
      [LIKE_POST_USER_STATUS_ENUM.Like, id],
    )

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

    const totalCount = await this.repository.count()

    const { response, skip } = this._createdResponse({
      pageNumber,
      pageSize,
      totalCount,
    })

    const result = await this.repository
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
      .offset(skip)
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

    const totalCount = await this.repository.countBy({ blog: { id } })

    const { response, skip } = this._createdResponse({
      pageNumber,
      pageSize,
      totalCount,
    })

    const result = await this.repository
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
      .offset(skip)
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
    const result = await this.repository
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
      return result
    }

    return await this._mapGeneratePostResponse({
      ...result,
    })
  }

  public async updateById(id: string, dto: UpdatePostDto) {
    const { title, shortDescription, content, blogId } = dto

    const result = await this.repository.update(
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

    const post = await this.repository.save({
      title,
      shortDescription,
      content,
      createdAt,
      likesCount,
      dislikesCount,
      blog: { id: blogId },
    })

    const result = await this.repository
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
    const result = await this.repository.delete({ id })

    return result.affected
  }

  public async updateLikeWithStatusLikeOrDislike(
    dto: {
      postId: string
      isFirstTime: boolean
    } & BasePostLikeDto,
  ) {
    const { postId, likeStatus, isFirstTime } = dto

    const result = await this.repository
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
