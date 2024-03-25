import { forwardRef, Inject, Injectable } from '@nestjs/common'

import {
  IsString,
  Length,
  Validate,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator'
import { validate } from 'uuid'
import { BlogsSqlRepository } from '../../blogs'
import { Transform } from 'class-transformer'
import {
  MAX_POST_CONTENT_LENGTH,
  MAX_POST_SHORT_DESCRIPTION_LENGTH,
  MAX_POST_TITLE_LENGTH,
  MIN_LENGTH,
} from '../constants'

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

class CreatePostDto {
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

  @IsString()
  @Validate(CustomPostValidationByBlogId)
  readonly blogId: string
}

export { CreatePostDto, CustomPostValidationByBlogId }
