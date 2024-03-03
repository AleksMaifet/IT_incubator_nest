import { InjectDataSource } from '@nestjs/typeorm'
import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { DataSource } from 'typeorm'
import { UserModel } from '../users'
import { BlogModel } from '../blogs'
import { PostModel } from '../posts'
import { CommentModel } from '../comments'
import { ConfirmationModel } from '../auth'
import { LikeModel } from '../likes'
import { RefreshTokenMetaModel } from '../security-devices'

@Injectable()
class TestingRepository {
  constructor(
    @InjectModel(UserModel.name)
    private readonly userModel: Model<UserModel>,
    @InjectDataSource() private readonly dataSource: DataSource,
    @InjectModel(BlogModel.name)
    private readonly blogModel: Model<BlogModel>,
    @InjectModel(PostModel.name)
    private readonly postModel: Model<PostModel>,
    @InjectModel(CommentModel.name)
    private readonly commentModel: Model<CommentModel>,
    @InjectModel(ConfirmationModel.name)
    private readonly confirmationModel: Model<ConfirmationModel>,
    @InjectModel(LikeModel.name)
    private readonly LikeModel: Model<LikeModel>,
    @InjectModel(RefreshTokenMetaModel.name)
    private readonly refreshTokenMetaModel: Model<RefreshTokenMetaModel>,
  ) {}

  public async deleteAllFromMongo() {
    await this.blogModel.deleteMany()
    await this.postModel.deleteMany()
    await this.userModel.deleteMany()
    await this.commentModel.deleteMany()
    await this.confirmationModel.deleteMany()
    await this.LikeModel.deleteMany()
    await this.refreshTokenMetaModel.deleteMany()
  }

  public async deleteAllFromPostgres() {
    await this.dataSource.query(`
    TRUNCATE users, confirmation, "refreshTokenMeta"
    `)
  }
}

export { TestingRepository }
