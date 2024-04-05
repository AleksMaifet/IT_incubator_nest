enum SORT_DIRECTION_ENUM {
  asc = 'asc',
  desc = 'desc',
}

enum LIKE_POST_USER_STATUS_ENUM {
  None = 'None',
  Like = 'Like',
  Dislike = 'Dislike',
}

interface IUserPostLike {
  addedAt: Date
  userId: string
  login: string
}

interface GetPostsRequestQuery<T> {
  sortBy: string
  sortDirection: SORT_DIRECTION_ENUM
  pageNumber: T
  pageSize: T
}

interface IPost {
  id: string
  title: string
  shortDescription: string
  content: string
  createdAt: Date
  extendedLikesInfo: {
    likesCount: number
    dislikesCount: number
    myStatus: LIKE_POST_USER_STATUS_ENUM
    newestLikes: IUserPostLike[]
  }
}

interface IPostsResponse {
  pagesCount: number
  page: number
  pageSize: number
  totalCount: number
  items: IPost[]
}

export {
  GetPostsRequestQuery,
  IPost,
  IPostsResponse,
  IUserPostLike,
  LIKE_POST_USER_STATUS_ENUM,
  SORT_DIRECTION_ENUM,
}
