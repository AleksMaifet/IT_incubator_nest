import request from 'supertest'
import { Test, TestingModule } from '@nestjs/testing'
import { MongooseModule } from '@nestjs/mongoose'
import { INestApplication } from '@nestjs/common'
import { MongoMemoryServer } from 'mongodb-memory-server'
import { DEFAULT_TEST_DATA } from './data'
import { AppModule } from '../src/app.module'
import { MongoDatabaseModule } from '../src/configs'
import { appSettings } from '../src/app.settings'
import { makeAuthBasicRequest, makeAuthBearerRequest } from './helpers'
import { GAME_STATUS_ENUM } from '../src/pair-quiz-game/interfaces'

describe('Quiz questions', () => {
  let application: INestApplication
  let mongo: MongoMemoryServer
  let httpServer: () => void
  let quizQuestionId: string
  const invalidQuizQuestionId = '1ac24eab-b54a-41fc-a2c0-ad1ef5194c11'

  const { QUIZ_QUESTION_DATA, QUIZ_ANSWERS, USER_DATA } = DEFAULT_TEST_DATA

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

    await makeAuthBasicRequest(
      httpServer,
      'post',
      '/sa/users',
      USER_DATA,
    ).expect(201)
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
      expect(Array.isArray(res.body.correctAnswers)).toBe(true)
      expect(res.body).toHaveProperty('createdAt')
      expect(res.body).toHaveProperty('updatedAt')
      expect(res.body.updatedAt).toBeNull()
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
        `/sa/quiz/questions?bodySearchTerm=1`,
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

      const res = await makeAuthBasicRequest(
        httpServer,
        'get',
        `/sa/quiz/questions?bodySearchTerm=1`,
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
      expect(question.updatedAt).not.toBeNull()
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

      const question = res.body.items[0]

      expect(question.published).toBe(true)
      expect(question.updatedAt).not.toBeNull()
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

  it('POST -> "/pair-game-quiz/pairs/my-current/answers":  should return error if user is not inside active pair; status 403', async () => {
    const resLogin = await request(httpServer)
      .post('/auth/login')
      .send({
        loginOrEmail: USER_DATA.login,
        password: USER_DATA.password,
      })
      .expect(200)

    await makeAuthBearerRequest(
      httpServer,
      'post',
      resLogin.body.accessToken,
      '/pair-game-quiz/pairs/my-current/answers',
      QUIZ_ANSWERS,
    ).expect(403)
  })

  it('POST -> "/pair-game-quiz/pairs/connection": should create new pair for a quiz; status 200', async () => {
    const secondUser = {
      login: 'ulogin452',
      password: 'ulogin452',
      email: 'test2@mail.com',
    }

    let count = 0

    while (count < 5) {
      const resCreateQuestion = await makeAuthBasicRequest(
        httpServer,
        'post',
        '/sa/quiz/questions',
        {
          body: `${count} + ${count} = ???????`,
          correctAnswers: [`${count + count}`],
        },
      ).expect(201)

      await makeAuthBasicRequest(
        httpServer,
        'put',
        `/sa/quiz/questions/${resCreateQuestion.body.id}/publish`,
        {
          published: true,
        },
      ).expect(204)

      count += 1
    }

    const resLogin = await request(httpServer)
      .post('/auth/login')
      .send({
        loginOrEmail: USER_DATA.login,
        password: USER_DATA.password,
      })
      .expect(200)

    const resFirstUserConnection = await makeAuthBearerRequest(
      httpServer,
      'post',
      resLogin.body.accessToken,
      '/pair-game-quiz/pairs/connection',
    ).expect(200)

    const firstPlayerProgress = resFirstUserConnection.body.firstPlayerProgress
    const secondPlayerProgress =
      resFirstUserConnection.body.secondPlayerProgress

    expect(resFirstUserConnection.body).toHaveProperty('id')
    expect(firstPlayerProgress).toBeDefined()
    expect(secondPlayerProgress).toBeNull()
    expect(resFirstUserConnection.body.questions).toBeNull()
    expect(resFirstUserConnection.body.startGameDate).toBeNull()
    expect(resFirstUserConnection.body.finishGameDate).toBeNull()
    expect(resFirstUserConnection.body.status).toBe(
      GAME_STATUS_ENUM.PendingSecondPlayer,
    )

    await makeAuthBasicRequest(
      httpServer,
      'post',
      '/sa/users',
      secondUser,
    ).expect(201)

    const resSecondUserLogin = await request(httpServer)
      .post('/auth/login')
      .send({
        loginOrEmail: secondUser.login,
        password: secondUser.password,
      })
      .expect(200)

    const resSecondUserConnection = await makeAuthBearerRequest(
      httpServer,
      'post',
      resSecondUserLogin.body.accessToken,
      '/pair-game-quiz/pairs/connection',
    ).expect(200)

    expect(resSecondUserConnection.body).toHaveProperty('id')
    expect(resSecondUserConnection.body.firstPlayerProgress).toBeDefined()
    expect(resSecondUserConnection.body.secondPlayerProgress).toBeDefined()
    expect(Array.isArray(resSecondUserConnection.body.questions)).toBe(true)
    expect(resSecondUserConnection.body.questions.length).toBe(5)
    expect(resSecondUserConnection.body.finishGameDate).toBeNull()
    expect(resSecondUserConnection.body.status).toBe(GAME_STATUS_ENUM.Active)
  })

  it(
    'POST -> "/pair-game-quiz/pairs/connection": should return error if auth credentials is incorrect; ' +
      'status 401',
    async () => {
      await request(httpServer)
        .post('/pair-game-quiz/pairs/connection')
        .expect(401)
    },
  )

  it('POST -> "/pair-game-quiz/pairs/my-current/answers": should create new answer for a quiz; status 200', async () => {
    const resLogin = await request(httpServer)
      .post('/auth/login')
      .send({
        loginOrEmail: USER_DATA.login,
        password: USER_DATA.password,
      })
      .expect(200)

    const res = await makeAuthBearerRequest(
      httpServer,
      'post',
      resLogin.body.accessToken,
      '/pair-game-quiz/pairs/my-current/answers',
      QUIZ_ANSWERS,
    ).expect(200)

    expect(res.body).toHaveProperty('questionId')
    expect(res.body).toHaveProperty('answerStatus')
    expect(res.body).toHaveProperty('addedAt')
  })

  it('POST -> "/pair-game-quiz/pairs/my-current/answers": create new game by user1, connect to game by user2, add 6 answers by user1. Should return error if current user has already answered to all questions; status 403', async () => {
    let count = 0

    const resLogin = await request(httpServer)
      .post('/auth/login')
      .send({
        loginOrEmail: USER_DATA.login,
        password: USER_DATA.password,
      })
      .expect(200)

    while (count < 5) {
      await makeAuthBearerRequest(
        httpServer,
        'post',
        resLogin.body.accessToken,
        '/pair-game-quiz/pairs/my-current/answers',
        QUIZ_ANSWERS,
      ).expect(200)

      if (count === 4) {
        await makeAuthBearerRequest(
          httpServer,
          'post',
          resLogin.body.accessToken,
          '/pair-game-quiz/pairs/my-current/answers',
          QUIZ_ANSWERS,
        ).expect(403)
      }

      count += 1
    }
  })

  it(
    'POST -> "/pair-game-quiz/pairs/my-current/answers": should return error if auth credentials is incorrect; ' +
      'status 401',
    async () => {
      await request(httpServer)
        .post('/pair-game-quiz/pairs/my-current/answers')
        .send(QUIZ_ANSWERS)
        .expect(401)
    },
  )
})
