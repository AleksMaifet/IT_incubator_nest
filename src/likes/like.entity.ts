import { ILikes } from './interfaces'
import { LIKE_COMMENT_USER_STATUS_ENUM } from '../comments'
import { LIKE_POST_USER_STATUS_ENUM } from '../posts'

class Likes implements ILikes {
  likeStatusComments: {
    status: LIKE_COMMENT_USER_STATUS_ENUM
    commentId: string
    addedAt: Date
  }[]
  likeStatusPosts: {
    status: LIKE_POST_USER_STATUS_ENUM
    postId: string
    addedAt: Date
  }[]

  constructor(
    public likerInfo: {
      userId: string
      userLogin: string
    },
  ) {
    this.likeStatusComments = []
    this.likeStatusPosts = []
  }
}

export { Likes }
