import { forwardRef, Inject, Injectable } from '@nestjs/common'
import { BasePostDto } from './basePost.dto'
import {
  IsString,
  Validate,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator'
import { validate } from 'uuid'
import { BlogsSqlRepository } from '../../blogs'

@ValidatorConstraint({ async: true })
@Injectable()
class CustomPostValidationByBlogId implements ValidatorConstraintInterface {
  constructor(
    @Inject(forwardRef(() => BlogsSqlRepository))
    private readonly blogsSqlRepository: BlogsSqlRepository,
  ) {}

  async validate(id: string) {
    if (!validate(id)) return false

    const blog = await this.blogsSqlRepository.getById(id)

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
