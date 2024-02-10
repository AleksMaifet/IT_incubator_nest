import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator'
import { Inject, Injectable } from '@nestjs/common'
import { BlogsRepository } from '../../../blogs'

@ValidatorConstraint({ async: true })
@Injectable()
class IsBlogExist implements ValidatorConstraintInterface {
  constructor(
    @Inject('BlogsRepository')
    private readonly blogsRepository: BlogsRepository,
  ) {}

  async validate(id: string) {
    const blog = await this.blogsRepository.getById(id)

    return !!blog
  }
}

export { IsBlogExist }
