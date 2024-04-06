import { InjectRepository } from '@nestjs/typeorm'
import { IsNull, Not, Repository } from 'typeorm'
import { BasePostLikeDto } from '../../posts'
import { BaseCommentLikeDto } from '../../comments'
import { CommentLikePgEntity, PostLikePgEntity } from '../models'
import { CommentInfoLikeType, PostInfoLikeType } from '../interfaces'

class LikesSqlRepository {
  constructor(
    @InjectRepository(PostLikePgEntity)
    private readonly postLikeRepository: Repository<PostLikePgEntity>,
    @InjectRepository(CommentLikePgEntity)
    private readonly commentLikeRepository: Repository<CommentLikePgEntity>,
  ) {}

  public async getOrCreatePostLike(
    dto: {
      userId: string
      userLogin: string
    } & Pick<PostInfoLikeType, 'postId'>,
  ) {
    const { userId, userLogin, postId } = dto

    const result = await this.postLikeRepository.findOneBy({
      userId,
      postId,
      addedAt: Not(IsNull()),
    })

    if (!result) {
      return await this.postLikeRepository.save({ userId, userLogin, postId })
    }

    return result
  }

  public async getPostLikesByUserId(userId: string) {
    return await this.postLikeRepository.findBy({ userId })
  }

  public async updateUserPostLikes(
    dto: { postId: string; userId: string } & BasePostLikeDto,
  ) {
    const { postId, userId, likeStatus } = dto

    const result = await this.postLikeRepository.update(
      { userId, postId },
      { status: likeStatus, addedAt: new Date() },
    )

    return result.affected
  }

  public async getOrCreateCommentLike(
    dto: {
      userId: string
      userLogin: string
    } & Pick<CommentInfoLikeType, 'commentId'>,
  ) {
    const { userId, userLogin, commentId } = dto

    const result = await this.commentLikeRepository.findOneBy({
      userId,
      commentId,
      addedAt: Not(IsNull()),
    })

    if (!result) {
      return await this.commentLikeRepository.save({
        userId,
        userLogin,
        commentId,
      })
    }

    return result
  }

  public async getCommentLikesByUserId(userId: string) {
    return await this.commentLikeRepository.findBy({ userId })
  }

  public async updateUserCommentLikes(
    dto: { commentId: string; userId: string } & BaseCommentLikeDto,
  ) {
    const { commentId, userId, likeStatus } = dto

    const result = await this.commentLikeRepository.update(
      { userId, commentId },
      { status: likeStatus, addedAt: new Date() },
    )

    return result.affected
  }
}

export { LikesSqlRepository }
