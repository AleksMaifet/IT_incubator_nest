import { IComments, LIKE_COMMENT_USER_STATUS_ENUM } from './interfaces'
import { DEFAULTS_LIKE_STATUS } from './constants'

const { LIKES_COUNT, DISLIKES_COUNT, MY_STATUS } = DEFAULTS_LIKE_STATUS

class Comment implements IComments {
  public readonly id: string
  public readonly createdAt: Date
  public readonly likesInfo: {
    likesCount: number
    dislikesCount: number
    myStatus: LIKE_COMMENT_USER_STATUS_ENUM
  }

  constructor(
    public postId: string,
    public content: string,
    public commentatorInfo: {
      userId: string
      userLogin: string
    },
  ) {
    this.createdAt = new Date()
    this.likesInfo = {
      likesCount: LIKES_COUNT,
      dislikesCount: DISLIKES_COUNT,
      myStatus: MY_STATUS,
    }
  }
}

export { Comment }
