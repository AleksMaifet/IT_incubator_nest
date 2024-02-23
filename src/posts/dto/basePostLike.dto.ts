import { IsIn, IsString } from 'class-validator'
import { LIKE_POST_USER_STATUS_ENUM } from '../interfaces'

class BasePostLikeDto {
  @IsString()
  @IsIn(Object.values(LIKE_POST_USER_STATUS_ENUM))
  readonly likeStatus: LIKE_POST_USER_STATUS_ENUM
}

export { BasePostLikeDto }
