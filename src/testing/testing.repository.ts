import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { UserModel } from '../users'
import { BlogModel } from '../blogs'
import { PostModel } from '../posts'
import { CommentModel } from '../comments'
import { ConfirmationModel } from '../auth'

@Injectable()
class TestingRepository {
  constructor(
    @InjectModel(UserModel.name)
    private readonly userModel: Model<UserModel>,
    @InjectModel(BlogModel.name)
    private readonly blogModel: Model<BlogModel>,
    @InjectModel(PostModel.name)
    private readonly postModel: Model<PostModel>,
    @InjectModel(CommentModel.name)
    private readonly commentModel: Model<CommentModel>,
    @InjectModel(ConfirmationModel.name)
    private readonly confirmationModel: Model<ConfirmationModel>,
  ) {}

  public async deleteAll() {
    await this.blogModel.deleteMany()
    await this.postModel.deleteMany()
    await this.userModel.deleteMany()
    await this.commentModel.deleteMany()
    await this.confirmationModel.deleteMany()
    // await this.refreshTokenMetaModel.deleteMany()
    // await this.emailConfirmationModel.deleteMany()
    // await this.passwordRecoveryConfirmationModel.deleteMany()
    // await this.likesModel.deleteMany()
  }
}

export { TestingRepository }
