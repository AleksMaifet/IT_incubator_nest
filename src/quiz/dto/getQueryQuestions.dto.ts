import { Expose, Transform } from 'class-transformer'
import { IsEnum } from 'class-validator'
import {
  PUBLISHED_QUESTION_STATUS_ENUM,
  SORT_QUESTIONS_DIRECTION_ENUM,
} from '../interfaces'

function DefaultTransform<T>(
  defaultValue: T,
  additionalLogic?: (value: any) => any,
) {
  return Transform(
    ({ value }) => {
      if (!value) return defaultValue
      return additionalLogic ? additionalLogic(value) : value
    },
    { toClassOnly: true },
  )
}

export class GetQueryQuestionsDto {
  @DefaultTransform(null)
  @Expose()
  public bodySearchTerm: Nullable<string>

  @DefaultTransform(PUBLISHED_QUESTION_STATUS_ENUM.all)
  @Expose()
  @IsEnum(PUBLISHED_QUESTION_STATUS_ENUM)
  public publishedStatus: PUBLISHED_QUESTION_STATUS_ENUM

  @DefaultTransform('createdAt')
  @Expose()
  public sortBy: string

  @DefaultTransform(SORT_QUESTIONS_DIRECTION_ENUM.DESC, (value) =>
    value.toUpperCase(),
  )
  @Expose()
  @IsEnum(SORT_QUESTIONS_DIRECTION_ENUM)
  public sortDirection: SORT_QUESTIONS_DIRECTION_ENUM

  @DefaultTransform(1, (value) => Number(value))
  @Expose()
  public pageNumber: number

  @DefaultTransform(10, (value) => Number(value))
  @Expose()
  public pageSize: number
}
