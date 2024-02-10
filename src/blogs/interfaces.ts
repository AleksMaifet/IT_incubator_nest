enum SORT_DIRECTION_ENUM {
  asc = 'asc',
  desc = 'desc',
}

interface GetBlogsRequestQuery<T> {
  searchNameTerm?: string
  sortBy: string
  sortDirection: SORT_DIRECTION_ENUM
  pageNumber: T
  pageSize: T
}

interface IBlog {
  id: string
  name: string
  description: string
  websiteUrl: string
  createdAt: Date
  isMembership: boolean
}

interface IBlogsResponse<T> {
  pagesCount: number
  page: number
  pageSize: number
  totalCount: number
  items: T[]
}

export { GetBlogsRequestQuery, IBlog, IBlogsResponse, SORT_DIRECTION_ENUM }
