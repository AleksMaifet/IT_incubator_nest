import { LIKE_COMMENT_USER_STATUS_ENUM } from '../comments'
import { LIKE_POST_USER_STATUS_ENUM } from '../posts'

type CommentInfoLikeType = {
  status: LIKE_COMMENT_USER_STATUS_ENUM
  commentId: string
  addedAt: Date
}

type PostInfoLikeType = {
  status: LIKE_POST_USER_STATUS_ENUM
  postId: string
  addedAt: Date
}

interface ILikes {
  likerInfo: {
    userId: string
    userLogin: string
  }
  likeStatusComments: CommentInfoLikeType[]
  likeStatusPosts: PostInfoLikeType[]
}

export { ILikes, CommentInfoLikeType, PostInfoLikeType }
