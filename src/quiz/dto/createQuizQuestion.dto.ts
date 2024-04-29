import { ArrayNotEmpty, IsArray, IsString, Length } from 'class-validator'
import { Transform } from 'class-transformer'
import { MAX_QUIZ_BODY_LENGTH, MIN_QUIZ_BODY_LENGTH } from '../constants'

export class BaseQuizQuestionDto {
  @IsString()
  @Transform(({ value }) => value?.trim())
  @Length(MIN_QUIZ_BODY_LENGTH, MAX_QUIZ_BODY_LENGTH)
  public body: string

  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  public correctAnswers: string[]
}
