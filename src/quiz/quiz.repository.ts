import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { QuizQuestionEntity } from './models'
import {
  BaseQuizQuestionDto,
  GetQueryQuestionsDto,
  UpdatePublishQuizQuestionDto,
} from './dto'
import {
  IQuestionsResponse,
  PUBLISHED_QUESTION_STATUS_ENUM,
} from './interfaces'

@Injectable()
export class QuizRepository {
  constructor(
    @InjectRepository(QuizQuestionEntity)
    private readonly repository: Repository<QuizQuestionEntity>,
  ) {}

  private _createdResponse<T>(
    dto: Pick<GetQueryQuestionsDto, 'pageNumber' | 'pageSize'> & {
      totalCount: number
    },
  ) {
    const { totalCount, pageNumber, pageSize } = dto

    const pagesCount = Math.ceil(totalCount / pageSize)
    const skip = (pageNumber - 1) * pageSize

    const response: IQuestionsResponse = {
      pagesCount,
      page: pageNumber,
      pageSize,
      totalCount,
      items: [],
    }

    return { response, skip }
  }

  public async getQuestions(dto: GetQueryQuestionsDto) {
    const {
      bodySearchTerm,
      publishedStatus,
      sortBy,
      sortDirection,
      pageNumber,
      pageSize,
    } = dto

    const queryBuilder = this.repository.createQueryBuilder()
    let totalCount: number

    const getQuestionsCountWithPublish = async ({
      body,
      published,
    }: {
      body: Nullable<string>
      published: boolean
    }) => {
      if (!body) {
        return await queryBuilder
          .where('published = :published', {
            published,
          })
          .getCount()
      }

      return await queryBuilder
        .where('published = :published', {
          published,
        })
        .andWhere('LOWER(body) LIKE LOWER(:body)', {
          body: `%${body}%`,
        })
        .getCount()
    }

    switch (publishedStatus as string) {
      case PUBLISHED_QUESTION_STATUS_ENUM.published:
        totalCount = await getQuestionsCountWithPublish({
          published: true,
          body: bodySearchTerm,
        })
        break
      case PUBLISHED_QUESTION_STATUS_ENUM.notPublished:
        totalCount = await getQuestionsCountWithPublish({
          published: false,
          body: bodySearchTerm,
        })

        break
      default:
        if (!bodySearchTerm) {
          totalCount = await queryBuilder.getCount()
        } else {
          totalCount = await queryBuilder
            .where('LOWER(body) LIKE LOWER(:body)', {
              body: `%${bodySearchTerm}%`,
            })
            .getCount()
        }
    }

    const { response, skip } = this._createdResponse({
      pageNumber,
      pageSize,
      totalCount,
    })

    response.items = await queryBuilder
      .orderBy(`"${sortBy}"`, sortDirection)
      .offset(skip)
      .limit(pageSize)
      .getMany()

    return response
  }

  public async createQuestion(dto: BaseQuizQuestionDto) {
    return await this.repository.save(dto)
  }

  public async updateQuestionById({
    questionId,
    dto,
  }: {
    questionId: string
    dto: BaseQuizQuestionDto
  }) {
    const result = await this.repository.update(
      { id: questionId },
      {
        ...dto,
        updatedAt: new Date().toISOString(),
      },
    )

    return result.affected
  }

  public async updatePublishQuestionById({
    questionId,
    dto,
  }: {
    questionId: string
    dto: UpdatePublishQuizQuestionDto
  }) {
    const result = await this.repository.update(
      { id: questionId },
      {
        ...dto,
        updatedAt: new Date().toISOString(),
      },
    )

    return result.affected
  }

  public async deleteQuestionById(id: string) {
    const result = await this.repository.delete({ id })

    return result.affected
  }
}
