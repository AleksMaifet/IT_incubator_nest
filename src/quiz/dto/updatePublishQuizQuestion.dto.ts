import { IsBoolean } from 'class-validator'

export class UpdatePublishQuizQuestionDto {
  @IsBoolean()
  public published: boolean
}
