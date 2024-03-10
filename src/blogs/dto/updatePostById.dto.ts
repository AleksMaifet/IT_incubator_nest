import {
  IsString,
  Validate,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator'
import { Injectable, NotFoundException } from '@nestjs/common'
import { validate } from 'uuid'
import { PostsSqlRepository } from '../../posts'
import { BlogsSqlRepository } from '../repositories'

@ValidatorConstraint({ async: true })
@Injectable()
class CustomBlogValidationParamById implements ValidatorConstraintInterface {
  constructor(private readonly blogsSqlRepository: BlogsSqlRepository) {}

  async validate(id: string) {
    if (!validate(id)) {
      throw new NotFoundException({ message: 'blog is not exists' })
    }

    const blog = await this.blogsSqlRepository.getById(id)

    if (!blog) {
      throw new NotFoundException({ message: 'blog is not exists' })
    }

    return true
  }

  defaultMessage() {
    return 'blog is not exists'
  }
}

@ValidatorConstraint({ async: true })
@Injectable()
class CustomPostValidationParamById implements ValidatorConstraintInterface {
  constructor(private readonly postsSqlRepository: PostsSqlRepository) {}

  async validate(id: string) {
    if (!validate(id)) {
      throw new NotFoundException({ message: 'blog is not exists' })
    }

    const post = await this.postsSqlRepository.getById(id)

    if (!post) {
      throw new NotFoundException({ message: 'post is not exists' })
    }

    return true
  }

  defaultMessage() {
    return 'post is not exists'
  }
}

class UpdatePostByIdDto {
  @IsString()
  @Validate(CustomBlogValidationParamById)
  blogId: string

  @IsString()
  @Validate(CustomPostValidationParamById)
  postId: string
}

export {
  UpdatePostByIdDto,
  CustomBlogValidationParamById,
  CustomPostValidationParamById,
}
