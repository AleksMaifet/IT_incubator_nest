import { LIKE_COMMENT_USER_STATUS_ENUM } from '../comments'
import { LIKE_POST_USER_STATUS_ENUM } from '../posts'

type CommentInfoLikeType<T> = {
  status: T
  commentId: string
  addedAt: Date
}

type PostInfoLikeType<T> = {
  status: T
  postId: string
  addedAt: Date
}

interface ILikes {
  likerInfo: {
    userId: string
    userLogin: string
  }
  likeStatusComments: CommentInfoLikeType<LIKE_COMMENT_USER_STATUS_ENUM>[]
  likeStatusPosts: PostInfoLikeType<LIKE_POST_USER_STATUS_ENUM>[]
}

export { ILikes, CommentInfoLikeType, PostInfoLikeType }
