import { CreateUserDto } from '../src/users'
import { CreatePostDto } from '../src/posts'
import { BaseCommentDto } from '../src/comments'
import { BaseBlogDto } from '../src/blogs'

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

const REFRESH_TOKEN_NAME = 'refreshToken'

export { DEFAULT_TEST_DATA, REFRESH_TOKEN_NAME }
