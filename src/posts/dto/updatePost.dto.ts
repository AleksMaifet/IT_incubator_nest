import { BasePostDto } from './basePost.dto'
import { IsString } from 'class-validator'

class UpdatePostDto extends BasePostDto {
  @IsString()
  readonly blogId: string
}

export { UpdatePostDto }
