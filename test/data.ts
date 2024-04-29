import { CreateUserDto } from '../src/users'
import { BaseCommentDto } from '../src/comments'
import { BaseBlogDto, BasePostDto } from '../src/blogs'
import { BaseQuizQuestionDto } from '../src/quiz'
import { AnswerDto } from '../src/pair-quiz-game/dto'

interface IDefaultTestData {
  USER_DATA: CreateUserDto
  POST_DATA: BasePostDto
  BLOG_DATA: BaseBlogDto
  COMMENT_DATA: BaseCommentDto
  QUIZ_QUESTION_DATA: BaseQuizQuestionDto
  QUIZ_ANSWERS: AnswerDto
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
  },
  BLOG_DATA: {
    name: 'string',
    description: 'string',
    websiteUrl: 'https://google.com',
  },
  COMMENT_DATA: {
    content: 'stringstringstringst',
  },
  QUIZ_QUESTION_DATA: {
    body: 'stringstri',
    correctAnswers: ['string'],
  },
  QUIZ_ANSWERS: {
    answer: 'string',
  },
}

const REFRESH_TOKEN_NAME = 'refreshToken'

export { DEFAULT_TEST_DATA, REFRESH_TOKEN_NAME }
