import { IsString, Length } from 'class-validator'
import { Transform } from 'class-transformer'
import { MAX_COMMENT_LENGTH, MIN_COMMENT_LENGTH } from '../constants'

class BaseCommentDto {
  @IsString()
  @Transform(({ value }) => value?.trim())
  @Length(MIN_COMMENT_LENGTH, MAX_COMMENT_LENGTH)
  readonly content: string
}

export { BaseCommentDto }
