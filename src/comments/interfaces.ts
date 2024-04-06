enum LIKE_COMMENT_USER_STATUS_ENUM {
  None = 'None',
  Like = 'Like',
  Dislike = 'Dislike',
}

enum SORT_DIRECTION_ENUM {
  asc = 'asc',
  desc = 'desc',
}

interface IComments {
  id: string
  postId: string
  content: string
  createdAt: Date
  likesInfo: {
    likesCount: number
    dislikesCount: number
    myStatus: LIKE_COMMENT_USER_STATUS_ENUM
  }
}

interface GetCommentsRequestQuery<T> {
  sortBy: string
  sortDirection: SORT_DIRECTION_ENUM
  pageNumber: T
  pageSize: T
}

interface ICommentsResponse {
  pagesCount: number
  page: number
  pageSize: number
  totalCount: number
  items: Omit<IComments, 'postId'>[]
}

export {
  IComments,
  GetCommentsRequestQuery,
  ICommentsResponse,
  LIKE_COMMENT_USER_STATUS_ENUM,
  SORT_DIRECTION_ENUM,
}
