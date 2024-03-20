import { Injectable } from '@nestjs/common'
import {
  GetPostsRequestQuery,
  IPostsResponse,
  LIKE_POST_USER_STATUS_ENUM,
} from './interfaces'
import { DEFAULTS } from './constants'
import { PostInfoLikeType } from '../likes'

const { SORT_DIRECTION, PAGE_NUMBER, PAGE_SIZE, SORT_BY } = DEFAULTS

@Injectable()
export class PostsService {
  public mapGenerateLikeResponse(
    posts: IPostsResponse,
    likeStatusPosts: PostInfoLikeType[],
  ) {
    const stash: Record<string, number> = {}

    posts.items.forEach((item, index) => {
      stash[item.id] = index
    })

    likeStatusPosts.forEach((l) => {
      const currentId = l.postId

      if (currentId in stash) {
        const currentIndex = stash[currentId]

        posts.items[currentIndex].extendedLikesInfo = {
          ...posts.items[currentIndex].extendedLikesInfo,
          myStatus: l.status ?? LIKE_POST_USER_STATUS_ENUM.None,
        }
      }
    })

    return posts
  }

  public mapQueryParamsToDB(query: GetPostsRequestQuery<string>) {
    const { sortBy, sortDirection, pageNumber, pageSize } = query

    const numPageNumber = Number(pageNumber)
    const numPageSize = Number(pageSize)
    const availablePageNumber =
      numPageNumber < PAGE_NUMBER ? PAGE_NUMBER : numPageNumber

    return {
      sortBy: sortBy ?? SORT_BY,
      sortDirection: SORT_DIRECTION[sortDirection!] ?? SORT_DIRECTION.desc,
      pageNumber: isFinite(numPageNumber) ? availablePageNumber : PAGE_NUMBER,
      pageSize: isFinite(numPageSize) ? numPageSize : PAGE_SIZE,
    }
  }
}
