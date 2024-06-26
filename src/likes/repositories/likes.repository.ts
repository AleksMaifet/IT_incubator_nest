import { InjectModel } from '@nestjs/mongoose'
import { Injectable } from '@nestjs/common'
import { Model } from 'mongoose'
import { BaseCommentLikeDto } from '../../comments'
import { BasePostLikeDto } from '../../posts'
import { LikeModel } from '../models'
import { ILikes } from '../interfaces'

@Injectable()
class LikesRepository {
  constructor(
    @InjectModel(LikeModel.name)
    private readonly likeModel: Model<LikeModel>,
  ) {}

  public async create(dto: ILikes) {
    const {
      likerInfo: { userId },
    } = dto

    const result = await this.likeModel.findOne({ 'likerInfo.userId': userId })

    if (!result) {
      return await this.likeModel.create(dto)
    }

    return result
  }

  public async getUserLikesByUserId(userId: string) {
    return await this.likeModel
      .findOne({
        'likerInfo.userId': userId,
      })
      .exec()
  }

  public async updateUserCommentLikes(
    dto: { commentId: string; userId: string } & BaseCommentLikeDto,
  ) {
    const { commentId, userId, likeStatus } = dto

    const like = await this.likeModel.findOne({
      'likerInfo.userId': userId,
    })

    if (!like) return null

    const { likeStatusComments } = like

    const index = likeStatusComments.findIndex(
      (info) => info.commentId === commentId,
    )

    if (index !== -1) {
      likeStatusComments.splice(index, 1)
    }

    likeStatusComments.push({
      status: likeStatus,
      commentId,
      addedAt: new Date(),
    })

    like.markModified('likeStatusComments')

    return await like.save()
  }

  public async updateUserPostLikes(
    dto: { postId: string; userId: string } & BasePostLikeDto,
  ) {
    const { postId, userId, likeStatus } = dto

    const like = await this.likeModel.findOne({
      'likerInfo.userId': userId,
    })

    if (!like) return null

    const { likeStatusPosts } = like

    const index = likeStatusPosts.findIndex((info) => info.postId === postId)

    if (index !== -1) {
      likeStatusPosts.splice(index, 1)
    }

    likeStatusPosts.push({
      status: likeStatus,
      postId,
      addedAt: new Date(),
    })

    like.markModified('likeStatusPosts')

    return await like.save()
  }
}

export { LikesRepository }
