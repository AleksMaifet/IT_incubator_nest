import { BasePostDto } from './basePost.dto'
import { IsString, Validate } from 'class-validator'
import { IsBlogExist } from '../../libs/customValidations'

class CreatePostDto extends BasePostDto {
  @IsString()
  @Validate(IsBlogExist, {
    message: 'blog is not exists',
  })
  readonly blogId: string
}

export { CreatePostDto }
