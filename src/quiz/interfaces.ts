import { QuizQuestionEntity } from './models'

enum PUBLISHED_QUESTION_STATUS_ENUM {
  all = 'all',
  published = 'published',
  notPublished = 'notPublished',
}

enum SORT_QUESTIONS_DIRECTION_ENUM {
  ASC = 'ASC',
  DESC = 'DESC',
}

interface IQuestionsResponse {
  pagesCount: number
  page: number
  pageSize: number
  totalCount: number
  items: QuizQuestionEntity[]
}

export {
  PUBLISHED_QUESTION_STATUS_ENUM,
  SORT_QUESTIONS_DIRECTION_ENUM,
  IQuestionsResponse,
}
