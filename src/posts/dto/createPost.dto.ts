import { forwardRef, Inject, Injectable } from '@nestjs/common'
import { BasePostDto } from './basePost.dto'
import {
  IsString,
  Validate,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator'
import { BlogsRepository } from '../../blogs'

@ValidatorConstraint({ async: true })
@Injectable()
class CustomPostValidationByBlogId implements ValidatorConstraintInterface {
  constructor(
    @Inject(forwardRef(() => BlogsRepository))
    private readonly blogsRepository: BlogsRepository,
  ) {}

  async validate(id: string) {
    const blog = await this.blogsRepository.getById(id)

    return !!blog
  }

  defaultMessage() {
    return 'blog is not exists'
  }
}

class CreatePostDto extends BasePostDto {
  @IsString()
  @Validate(CustomPostValidationByBlogId)
  readonly blogId: string
}

export { CreatePostDto, CustomPostValidationByBlogId }
