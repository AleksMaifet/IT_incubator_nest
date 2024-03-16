import { Injectable } from '@nestjs/common'
import { CommentsRepository } from './repositories'
import { IUser } from '../users'
import { BaseCommentLikeDto } from './dto'
import { LikesService } from '../likes'

@Injectable()
export class CommentsService {
  constructor(
    private readonly commentsRepository: CommentsRepository,
    private readonly likesService: LikesService,
  ) {}

  public async updateLikeById(
    dto: {
      commentId: string
      user: Pick<IUser, 'id' | 'login'>
    } & BaseCommentLikeDto,
  ) {
    const {
      commentId,
      likeStatus,
      user: { id, login },
    } = dto

    const { likeStatusComments } = await this.likesService.create({
      userId: id,
      userLogin: login,
    })

    if (!likeStatusComments) return

    const isExist = likeStatusComments.findIndex(
      (info) => info.commentId === commentId && info.status === likeStatus,
    )

    const isFirst = likeStatusComments.findIndex(
      (info) => info.commentId === commentId,
    )

    if (isExist !== -1) {
      return
    }

    await this.likesService.updateUserCommentLikes({
      userId: id,
      likeStatus,
      commentId,
    })

    await this.commentsRepository.updateLikeWithStatusLikeOrDislike({
      isFirstTime: isFirst === -1,
      likeStatus,
      commentId,
    })

    return true
  }
}
