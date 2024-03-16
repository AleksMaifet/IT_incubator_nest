import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { CommentInfoLikeType, LikesRepository } from '../../likes'
import {
  GetCommentsRequestQuery,
  ICommentsResponse,
  LIKE_COMMENT_USER_STATUS_ENUM,
} from '../interfaces'
import { CommentsSqlRepository } from '../repositories'
import { DEFAULTS } from '../constants'

const { SORT_DIRECTION, PAGE_NUMBER, PAGE_SIZE, SORT_BY } = DEFAULTS

class GetAllCommentsByPostIdCommand {
  constructor(
    public readonly payload: {
      postId: string
      userId: string
      query: GetCommentsRequestQuery<string>
    },
  ) {}
}

@CommandHandler(GetAllCommentsByPostIdCommand)
class GetAllCommentsByPostIdUseCase
  implements ICommandHandler<GetAllCommentsByPostIdCommand>
{
  constructor(
    private readonly commentsSqlRepository: CommentsSqlRepository,
    private readonly likesRepository: LikesRepository,
  ) {}

  private _mapGenerateLikeResponse(
    comments: ICommentsResponse,
    likeStatusComments: CommentInfoLikeType<LIKE_COMMENT_USER_STATUS_ENUM>[],
  ) {
    const stash: Record<string, number> = {}

    comments.items.forEach((item, index) => {
      stash[item.id] = index
    })

    likeStatusComments.forEach((l) => {
      const currentId = l.commentId

      if (currentId in stash) {
        const currentIndex = stash[currentId]

        comments.items[currentIndex].likesInfo = {
          ...comments.items[currentIndex].likesInfo,
          myStatus: l.status ?? LIKE_COMMENT_USER_STATUS_ENUM.None,
        }
      }
    })

    return comments
  }

  private _mapQueryParamsToDB(query: GetCommentsRequestQuery<string>) {
    const { sortBy, sortDirection, pageNumber, pageSize } = query

    const numPageNumber = Number(pageNumber)
    const numPageSize = Number(pageSize)

    return {
      sortBy: sortBy ?? SORT_BY,
      sortDirection: SORT_DIRECTION[sortDirection] ?? SORT_DIRECTION.desc,
      pageNumber: isFinite(numPageNumber)
        ? Math.max(numPageNumber, PAGE_NUMBER)
        : PAGE_NUMBER,
      pageSize: isFinite(numPageSize) ? numPageSize : PAGE_SIZE,
    }
  }

  async execute(command: GetAllCommentsByPostIdCommand) {
    const { postId, userId, query } = command.payload

    const dto = this._mapQueryParamsToDB(query)

    const comments = await this.commentsSqlRepository.getAllByPostId({
      postId,
      query: dto,
    })

    if (!userId) {
      return comments
    }

    const likes = await this.likesRepository.getUserLikesByUserId(userId)

    if (!likes) {
      return comments
    }

    const { likeStatusComments } = likes

    return this._mapGenerateLikeResponse(comments, likeStatusComments)
  }
}

export { GetAllCommentsByPostIdUseCase, GetAllCommentsByPostIdCommand }
