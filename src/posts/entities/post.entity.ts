import { IPost, IUserPostLike, LIKE_POST_USER_STATUS_ENUM } from '../interfaces'
import { DEFAULTS_POST_LIKE_STATUS } from '../constants'

const { LIKES_COUNT, DISLIKES_COUNT, MY_STATUS } = DEFAULTS_POST_LIKE_STATUS

class Post implements IPost {
  public readonly id: string
  public readonly createdAt: Date
  public readonly extendedLikesInfo: {
    likesCount: number
    dislikesCount: number
    myStatus: LIKE_POST_USER_STATUS_ENUM
    newestLikes: IUserPostLike[]
  }

  constructor(
    public readonly title: string,
    public readonly shortDescription: string,
    public readonly content: string,
  ) {
    this.createdAt = new Date()
    this.extendedLikesInfo = {
      likesCount: LIKES_COUNT,
      dislikesCount: DISLIKES_COUNT,
      myStatus: MY_STATUS,
      newestLikes: [],
    }
  }
}

export { Post }
