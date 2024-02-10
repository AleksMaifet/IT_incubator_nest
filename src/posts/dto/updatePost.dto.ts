import { BasePostDto } from './basePost.dto'
import { IsString, Validate } from 'class-validator'
import { IsBlogExist } from '../../libs/customValidations'

class UpdatePostDto extends BasePostDto {
  @IsString()
  @Validate(IsBlogExist, {
    message: 'blog is not exists',
  })
  readonly blogId: string
}

export { UpdatePostDto }
