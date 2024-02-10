import { IsString, Length } from 'class-validator'
import { Transform } from 'class-transformer'
import {
  MAX_POST_CONTENT_LENGTH,
  MAX_POST_SHORT_DESCRIPTION_LENGTH,
  MAX_POST_TITLE_LENGTH,
  MIN_LENGTH,
} from '../constants'

class BasePostDto {
  @IsString()
  @Transform(({ value }) => value?.trim())
  @Length(MIN_LENGTH, MAX_POST_TITLE_LENGTH)
  readonly title: string

  @IsString()
  @Transform(({ value }) => value?.trim())
  @Length(MIN_LENGTH, MAX_POST_SHORT_DESCRIPTION_LENGTH)
  readonly shortDescription: string

  @IsString()
  @Transform(({ value }) => value?.trim())
  @Length(MIN_LENGTH, MAX_POST_CONTENT_LENGTH)
  readonly content: string
}

export { BasePostDto }
