import request from 'supertest'
import { Test, TestingModule } from '@nestjs/testing'
import { MongooseModule } from '@nestjs/mongoose'
import { INestApplication } from '@nestjs/common'
import { MongoMemoryServer } from 'mongodb-memory-server'
import { DEFAULT_TEST_DATA } from './data'
import { AppModule } from '../src/app.module'
import { MongoDatabaseModule } from '../src/configs'
import { appSettings } from '../src/app.settings'
import { makeAuthBasicRequest } from './helpers'

describe('Quiz questions', () => {
  let application: INestApplication
  let mongo: MongoMemoryServer
  let httpServer: () => void
  let quizQuestionId: string
  const invalidQuizQuestionId = '1ac24eab-b54a-41fc-a2c0-ad1ef5194c11'

  const { QUIZ_QUESTION_DATA } = DEFAULT_TEST_DATA

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideModule(MongoDatabaseModule)
      .useModule(
        MongooseModule.forRootAsync({
          useFactory: async () => {
            mongo = await MongoMemoryServer.create()
            const mongoUri = mongo.getUri()

            return {
              uri: mongoUri,
            }
          },
        }),
      )
      .compile()

    application = moduleFixture.createNestApplication()

    appSettings(application)

    await application.init()

    httpServer = application.getHttpServer()

    await request(httpServer).delete('/testing/all-data').expect(204)
  })

  afterAll(async () => {
    await request(httpServer).delete('/testing/all-data').expect(204)

    await mongo.stop()
    await application.close()
  })

  it(
    'POST -> "/quiz/questions": should create new question for a quiz; status 201; content: ' +
      'created post;',
    async () => {
      const res = await makeAuthBasicRequest(
        httpServer,
        'post',
        '/sa/quiz/questions',
        QUIZ_QUESTION_DATA,
      ).expect(201)

      quizQuestionId = res.body.id

      expect(res.status).toBe(201)
      expect(res.body).toHaveProperty('id')
      expect(res.body.body).toBe(QUIZ_QUESTION_DATA.body)
      expect(res.body.correctAnswers).toMatchObject(
        QUIZ_QUESTION_DATA.correctAnswers,
      )
      expect(res.body.published).toBe(false)
      expect(res.body).toHaveProperty('createdAt')
      expect(res.body).toHaveProperty('updatedAt')
    },
  )

  it(
    'POST -> "/quiz/questions": should return error if passed body is incorrect; ' +
      'status 400;',
    async () => {
      await makeAuthBasicRequest(
        httpServer,
        'post',
        '/sa/quiz/questions',
      ).expect(400)
    },
  )

  it(
    'POST -> "/quiz/questions": should return error if auth credentials is incorrect; ' +
      'status 401;',
    async () => {
      await request(httpServer)
        .post('/sa/quiz/questions')
        .send(QUIZ_QUESTION_DATA)
        .expect(401)
    },
  )

  it(
    'GET -> "/quiz/questions": get questions by unauthorized admin; ' +
      'status 200;',
    async () => {
      const res = await makeAuthBasicRequest(
        httpServer,
        'get',
        `/sa/quiz/questions?bodySearchTerm=string`,
      ).expect(200)

      const question = res.body.items[0]

      expect(res.body).toHaveProperty('pagesCount')
      expect(res.body).toHaveProperty('page')
      expect(res.body).toHaveProperty('pageSize')
      expect(res.body).toHaveProperty('totalCount')
      expect(res.body).toHaveProperty('items')
      expect(question).toHaveProperty('id')
      expect(question).toHaveProperty('body')
      expect(question).toHaveProperty('correctAnswers')
      expect(question).toHaveProperty('published')
      expect(question).toHaveProperty('createdAt')
      expect(question).toHaveProperty('updatedAt')
    },
  )

  it(
    'GET -> "/quiz/questions": should return error if auth credentials is incorrect; ' +
      'status 401;',
    async () => {
      await request(httpServer).get(`/sa/quiz/questions`).expect(401)
    },
  )

  it(
    'PUT -> "/quiz/questions/:id": should return error if auth credentials is incorrect;' +
      ' status 401;',
    async () => {
      await request(httpServer)
        .put(`/sa/quiz/questions/${quizQuestionId}`)
        .send({
          ...QUIZ_QUESTION_DATA,
          body: QUIZ_QUESTION_DATA.body.repeat(2),
        })
        .expect(401)
    },
  )

  it(
    'PUT -> "/quiz/questions/:id": should return error if :id from uri param not found; ' +
      'status 404',
    async () => {
      await makeAuthBasicRequest(
        httpServer,
        'put',
        `/sa/quiz/questions/${invalidQuizQuestionId}`,
        {
          ...QUIZ_QUESTION_DATA,
          body: QUIZ_QUESTION_DATA.body.repeat(2),
        },
      ).expect(404)
    },
  )

  it(
    'PUT -> "/quiz/questions/:id": should return error if passed body is incorrect; ' +
      'status 400',
    async () => {
      await makeAuthBasicRequest(
        httpServer,
        'put',
        `/sa/quiz/questions/${quizQuestionId}`,
        {
          ...QUIZ_QUESTION_DATA,
          body: QUIZ_QUESTION_DATA.body[0],
        },
      ).expect(400)
    },
  )

  it(
    'PUT -> "/quiz/questions/:id": should update comment by id; ' +
      'status 204',
    async () => {
      await makeAuthBasicRequest(
        httpServer,
        'put',
        `/sa/quiz/questions/${quizQuestionId}`,
        {
          ...QUIZ_QUESTION_DATA,
          body: QUIZ_QUESTION_DATA.body.repeat(2),
        },
      ).expect(204)
    },
  )

  it(
    'PUT -> "/quiz/questions/:id/publish": should return error if auth credentials is incorrect;' +
      ' status 401;',
    async () => {
      await request(httpServer)
        .put(`/sa/quiz/questions/${quizQuestionId}/publish`)
        .send({
          published: true,
        })
        .expect(401)
    },
  )

  it(
    'PUT -> "/quiz/questions/:id/publish": should return error if :id from uri param not found; ' +
      'status 404',
    async () => {
      await makeAuthBasicRequest(
        httpServer,
        'put',
        `/sa/quiz/questions/${invalidQuizQuestionId}/publish`,
        {
          published: true,
        },
      ).expect(404)
    },
  )

  it(
    'PUT -> "/quiz/questions/:id/publish": should return error if passed body is incorrect; ' +
      'status 400',
    async () => {
      await makeAuthBasicRequest(
        httpServer,
        'put',
        `/sa/quiz/questions/${quizQuestionId}/publish`,
        {
          published: 'true',
        },
      ).expect(400)
    },
  )

  it(
    'PUT -> "/quiz/questions/:id/publish": should update comment by id; ' +
      'status 204',
    async () => {
      await makeAuthBasicRequest(
        httpServer,
        'put',
        `/sa/quiz/questions/${quizQuestionId}/publish`,
        {
          published: true,
        },
      ).expect(204)

      const res = await makeAuthBasicRequest(
        httpServer,
        'get',
        `/sa/quiz/questions`,
      ).expect(200)

      expect(res.body.items[0].published).toBe(true)
    },
  )

  it(
    'DELETE -> "/quiz/questions/:id": should return error if auth credentials is incorrect; ' +
      'status 401;',
    async () => {
      await request(httpServer)
        .delete(`/sa/quiz/questions/${quizQuestionId}`)
        .expect(401)
    },
  )

  it('DELETE -> "/quiz/questions/:id": should delete question by id', async () => {
    await makeAuthBasicRequest(
      httpServer,
      'delete',
      `/sa/quiz/questions/${quizQuestionId}`,
    ).expect(204)
  })

  it(
    'DELETE -> "/quiz/questions/:id": should return error if :id "from" uri param not found;' +
      'status 404;',
    async () => {
      await makeAuthBasicRequest(
        httpServer,
        'delete',
        `/sa/quiz/questions/${invalidQuizQuestionId}`,
      ).expect(404)
    },
  )
})
