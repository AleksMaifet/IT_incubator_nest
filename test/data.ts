import { CreateUserDto } from '../src/users'
import { BaseBlogDto } from '../src/blogs'
import { CreatePostDto } from '../src/posts'
import { BaseCommentDto } from '../src/comments'

interface IDefaultTestData {
  USER_DATA: CreateUserDto
  POST_DATA: CreatePostDto
  BLOG_DATA: BaseBlogDto
  COMMENT_DATA: BaseCommentDto
}

const DEFAULT_TEST_DATA: IDefaultTestData = {
  USER_DATA: {
    login: 'ulogin45',
    password: 'ulogin45',
    email: 'test@mail.com',
  },
  POST_DATA: {
    title: 'string',
    content: 'string',
    shortDescription: 'string',
    blogId: 'string',
  },
  BLOG_DATA: {
    name: 'string',
    description: 'string',
    websiteUrl: 'https://google.com',
  },
  COMMENT_DATA: {
    content: 'stringstringstringst',
  },
}

export { DEFAULT_TEST_DATA }
