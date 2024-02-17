import { disconnect } from 'mongoose'
import * as request from 'supertest'
import { INestApplication } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { sign } from 'jsonwebtoken'
import { DEFAULT_TEST_DATA } from './data'
import { AppModule } from '../src/app.module'
import { appSettings } from '../src/app.settings'
import {
  delay,
  getRefreshToken,
  makeAuthBasicRequest,
  makeAuthBearerRequest,
  mock,
  parsedHtmlAndGetCode,
} from './helpers'

describe('Application', () => {
  let application: INestApplication
  let httpServer: () => void

  const { USER_DATA, BLOG_DATA, POST_DATA } = DEFAULT_TEST_DATA

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    application = moduleFixture.createNestApplication()

    appSettings(application)

    await application.init()

    httpServer = application.getHttpServer()
  })

  afterAll(async () => {
    await request(httpServer).delete('/testing/all-data').expect(204)

    await disconnect()
    await application.close()
  })

  describe('Users', () => {
    const invalidId = '00000000000000'
    const pageNumber = 1
    const pageSize = 10

    beforeAll(async () => {
      await request(httpServer).delete('/testing/all-data').expect(204)
    })

    it('POST -> "/users": should create a new users', async () => {
      const response = await makeAuthBasicRequest(
        httpServer,
        'post',
        '/users',
        USER_DATA,
      )

      expect(response.statusCode).toBe(201)
      expect(response.body).toHaveProperty('id')
      expect(response.body).toHaveProperty('login')
      expect(response.body).toHaveProperty('createdAt')
      expect(response.body).toHaveProperty('email')
    })

    it('DELETE -> "/testing/all-data": should remove all data', async () => {
      await request(httpServer).delete('/testing/all-data').expect(204)
    })

    it('GET -> "/users": should return users array with pagination', async () => {
      const response = await makeAuthBasicRequest(
        httpServer,
        'get',
        `/users?pageNumber=${pageNumber}&pageSize=${pageSize}`,
      )

      expect(response.statusCode).toBe(200)
      expect(response.body).toMatchObject({
        pagesCount: 0,
        page: pageNumber,
        pageSize: pageSize,
        totalCount: 0,
        items: [],
      })
    })

    it('DELETE -> "/users/:id": should delete users by id', async () => {
      const response = await makeAuthBasicRequest(
        httpServer,
        'post',
        '/users',
        USER_DATA,
      )

      await makeAuthBasicRequest(
        httpServer,
        'delete',
        `/users/${response.body.id}`,
        USER_DATA,
      ).expect(204)
    })

    it('DELETE -> "/users/:id": should return an error if :id is not found', async () => {
      await makeAuthBasicRequest(
        httpServer,
        'delete',
        `/users/${invalidId}`,
        USER_DATA,
      ).expect(404)
    })
  })

  describe('Auth', () => {
    beforeAll(async () => {
      await request(httpServer).delete('/testing/all-data').expect(204)
    })

    it('POST -> "/users": should create a new user', async () => {
      await makeAuthBasicRequest(
        httpServer,
        'post',
        '/users',
        USER_DATA,
      ).expect(201)
    })

    it('POST -> "/auth/login": should sign in user', async () => {
      const res = await request(httpServer).post('/auth/login').send({
        loginOrEmail: USER_DATA.email,
        password: USER_DATA.password,
      })

      expect(res.status).toBe(200)
      expect(res.body).toHaveProperty('accessToken')
    })

    it('POST -> "/auth/login": should return an error if passed wrong login or password', async () => {
      await request(httpServer)
        .post('/auth/login')
        .send({
          loginOrEmail: USER_DATA.login,
          password: '1',
        })
        .expect(401)
    })

    it('GET -> "/auth/me": should return user info', async () => {
      const resLogin = await request(httpServer).post('/auth/login').send({
        loginOrEmail: USER_DATA.login,
        password: USER_DATA.password,
      })

      const resMe = await makeAuthBearerRequest(
        httpServer,
        'get',
        resLogin.body.accessToken,
        '/auth/me',
      )

      expect(resMe.statusCode).toBe(200)
      expect(resMe.body).toHaveProperty('email')
      expect(resMe.body).toHaveProperty('login')
      expect(resMe.body).toHaveProperty('userId')
    })

    it('GET -> "/auth/me": should return an error if token wrong', async () => {
      const randomToken = sign(
        { userId: new Date().getMilliseconds().toString() },
        'secret',
      )

      await makeAuthBearerRequest(
        httpServer,
        'get',
        randomToken,
        '/auth/me',
      ).expect(401)
    })
  })

  describe('Registration', () => {
    let code: string

    beforeAll(async () => {
      await request(httpServer).delete('/testing/all-data').expect(204)
    })

    afterEach(async () => {
      mock.reset()
    })

    it('POST -> "auth/registration": should create a new user and send a confirmation email with a code', async () => {
      const res = await request(httpServer)
        .post('/auth/registration')
        .send(USER_DATA)

      const sentEmails = mock.getSentMail()
      const html = sentEmails[0].html as string
      code = parsedHtmlAndGetCode(html, 'code')

      expect(sentEmails.length).toBe(1)
      expect(res.status).toBe(204)
      expect(sentEmails[0].to).toBe(USER_DATA.email)
      expect(code).toBeTruthy()
    })

    it('POST -> "/auth/registration": should return error if email or login already exist; status 400', async () => {
      await request(httpServer)
        .post('/auth/registration')
        .send(USER_DATA)
        .expect(400)
    })

    it('POST -> "/auth/registration-email-resending": should send email with new code if user exists but not confirmed yet; status 204', async () => {
      await request(httpServer)
        .post('/auth/registration-email-resending')
        .send({
          email: USER_DATA.email,
        })
        .expect(204)

      const sentEmails = mock.getSentMail()
      const html = sentEmails[0].html as string
      code = parsedHtmlAndGetCode(html, 'code')
    })

    it('POST -> "/auth/registration-confirmation": should confirm registration by email; status 204', async () => {
      await request(httpServer)
        .post('/auth/registration-confirmation')
        .send({
          code,
        })
        .expect(204)
    })

    it('POST -> "/auth/registration-confirmation": should return error if code already confirmed; status 400', async () => {
      await request(httpServer)
        .post('/auth/registration-confirmation')
        .send({
          code,
        })
        .expect(400)
    })
  })

  describe('Password recovery', () => {
    let code: string
    const newPassword = `new${USER_DATA.password}`

    beforeAll(async () => {
      await request(httpServer).delete('/testing/all-data').expect(204)
    })

    afterEach(async () => {
      mock.reset()
    })

    it(
      'POST -> "/users": should create new user; status 201; content: created user; ' +
        'used additional methods: GET => /users;',
      async () => {
        const response = await makeAuthBasicRequest(
          httpServer,
          'post',
          '/users',
          USER_DATA,
        )

        expect(response.statusCode).toBe(201)
        expect(response.body).toHaveProperty('id')
        expect(response.body).toHaveProperty('login')
        expect(response.body).toHaveProperty('createdAt')
        expect(response.body).toHaveProperty('email')
      },
    )

    it('POST -> "auth/password-recovery": should send email with recovery code; status 204;', async () => {
      const response = await request(httpServer)
        .post('/auth/password-recovery')
        .send({ email: USER_DATA.email })

      const sentEmails = mock.getSentMail()

      const html = sentEmails[0].html as string
      code = parsedHtmlAndGetCode(html, 'recoveryCode')

      expect(sentEmails.length).toBe(1)
      expect(response.status).toBe(204)
      expect(sentEmails[0].to).toBe(USER_DATA.email)
      expect(code).toBeTruthy()
    })

    it('POST -> "auth/new-password": should return error if code is incorrect; status 400;', async () => {
      await request(httpServer)
        .post('/auth/new-password')
        .send({
          newPassword: USER_DATA.password[0],
          recoveryCode: code,
        })
        .expect(400)
    })

    it('POST -> "auth/new-password": should confirm password recovery; status 204;', async () => {
      await request(httpServer)
        .post('/auth/new-password')
        .send({
          newPassword,
          recoveryCode: code,
        })
        .expect(204)
    })

    it(
      'POST -> "auth/password-recovery": should return status 204 even if such email doesnt exist; ' +
        'status 204;',
      async () => {
        await request(httpServer)
          .post('/auth/password-recovery')
          .send({ email: 'nonexistent@example.com' })
          .expect(204)
      },
    )

    it('POST -> "/auth/login": should sign in user with new password; status 200; content: JWT token;', async () => {
      const res = await request(httpServer).post('/auth/login').send({
        loginOrEmail: USER_DATA.email,
        password: newPassword,
      })

      const refreshToken = getRefreshToken(res.get('Set-Cookie'))

      expect(res.status).toBe(200)
      expect(res.body).toHaveProperty('accessToken')
      expect(refreshToken).toBeTruthy()
      expect(refreshToken.includes('HttpOnly')).toBeTruthy()
      expect(refreshToken.includes('Secure')).toBeTruthy()
    })

    it(
      'POST -> "/auth/password-recovery": it should return status code 429 if more than 5 ' +
        'requests were sent within 10 seconds, and 204 after waiting; status 429, 204;',
      async () => {
        for (let i = 0; i < 6; i++) {
          const res = await request(httpServer)
            .post('/auth/password-recovery')
            .send({ email: USER_DATA.email })

          if (i === 5) {
            expect(res.status).toBe(429)
          }
        }

        // Wait for 10 seconds
        await delay(10000)

        // Send another request
        await request(httpServer)
          .post('/auth/password-recovery')
          .send({ email: USER_DATA.email })
          .expect(204)
      },
      15000,
    )

    it(
      'POST -> "/auth/new-password": it should return status code 429 if more than 5 requests ' +
        'were sent within 10 seconds, and 400 after waiting; status 429, 400;',
      async () => {
        for (let i = 0; i < 6; i++) {
          const res = await request(httpServer)
            .post('/auth/new-password')
            .send({
              newPassword,
              recoveryCode: code,
            })

          if (i === 5) {
            expect(res.status).toBe(429)
          }
        }

        // Wait for 10 seconds
        await delay(10000)

        // Send another request
        await request(httpServer)
          .post('/auth/new-password')
          .send({
            newPassword,
            recoveryCode: code,
          })
          .expect(400)
      },
      15000,
    )
  })

  describe('Blogs', () => {
    const errorId = '00000000000000'

    beforeAll(async () => {
      await request(httpServer).delete('/testing/all-data').expect(204)
    })

    it('GET blog by id with error', async () => {
      await request(httpServer)
        .get('/blogs' + `/${errorId}`)
        .expect(404)
    })

    it('GET blogs by id success', async () => {
      const res = await request(httpServer).post('/blogs').send(BLOG_DATA)

      await request(httpServer)
        .get('/blogs' + `/${res.body.id}`)
        .expect(200)
    })

    it('POST not created blog with error', async () => {
      await request(httpServer).post('/blogs').expect(400)
    })

    it('POST created blog success', async () => {
      await request(httpServer).post('/blogs').send(BLOG_DATA).expect(201)
    })

    it('PUT update blog by id success', async () => {
      const res = await request(httpServer).post('/blogs').send(BLOG_DATA)

      await request(httpServer)
        .put('/blogs' + `/${res.body.id}`)
        .send(BLOG_DATA)
        .expect(204)
    })

    it('PUT not update blog by id with error', async () => {
      await request(httpServer)
        .put('/blogs' + `/${errorId}`)
        .send(BLOG_DATA)
        .expect(404)
    })

    it('DELETE delete blog by id success', async () => {
      const res = await request(httpServer).post('/blogs').send(BLOG_DATA)

      await request(httpServer)
        .delete('/blogs' + `/${res.body.id}`)
        .expect(204)
    })

    it('DELETE not delete blog by id with error', async () => {
      await request(httpServer)
        .delete('/blogs' + `/${errorId}`)
        .expect(404)
    })
  })

  describe('Posts', () => {
    const errorId = '00000000000000'

    beforeAll(async () => {
      await request(httpServer).delete('/testing/all-data').expect(204)
    })

    it('GET posts by id with error', async () => {
      await request(httpServer)
        .get('/posts' + `/${errorId}`)
        .expect(404)
    })

    it('GET posts by id success', async () => {
      const resBlog = await request(httpServer).post('/blogs').send(BLOG_DATA)

      const resPost = await request(httpServer)
        .post('/posts')
        .send({
          ...POST_DATA,
          blogId: resBlog.body.id,
        })

      await request(httpServer)
        .get('/posts' + `/${resPost.body.id}`)
        .expect(200)
    })

    it('POST not created post with error', async () => {
      await request(httpServer).post('/posts').expect(400)
    })

    it('POST created post success', async () => {
      const resBlog = await request(httpServer).post('/blogs').send(BLOG_DATA)

      await request(httpServer)
        .post('/posts')
        .send({
          ...POST_DATA,
          blogId: resBlog.body.id,
        })
        .expect(201)
    })

    it('PUT update post by id success', async () => {
      const resBlog = await request(httpServer).post('/blogs').send(BLOG_DATA)

      const resPost = await request(httpServer)
        .post('/posts')
        .send({
          ...POST_DATA,
          blogId: resBlog.body.id,
        })

      await request(httpServer)
        .put('/posts' + `/${resPost.body.id}`)
        .send({
          ...POST_DATA,
          blogId: resBlog.body.id,
        })
        .expect(204)
    })

    it('PUT not update video by id with error', async () => {
      await request(httpServer)
        .put('/posts' + `/${errorId}`)
        .expect(400)
    })

    it('DELETE delete video by id success', async () => {
      const resBlog = await request(httpServer).post('/blogs').send(BLOG_DATA)

      const resPost = await request(httpServer)
        .post('/posts')
        .send({
          ...POST_DATA,
          blogId: resBlog.body.id,
        })

      await request(httpServer)
        .delete('/posts' + `/${resPost.body.id}`)
        .expect(204)
    })

    it('DELETE not delete video by id with error', async () => {
      await request(httpServer)
        .delete('/posts' + `/${errorId}`)
        .expect(404)
    })
  })

  describe('Comments', () => {
    const { BLOG_DATA, POST_DATA } = DEFAULT_TEST_DATA

    beforeAll(async () => {
      await request(httpServer).delete('/testing/all-data').expect(204)
    })

    it('GET -> "/posts/:postId/comments": should return comments with pagination', async () => {
      const resBlog = await request(httpServer).post('/blogs').send(BLOG_DATA)

      const resPost = await request(httpServer)
        .post('/posts')
        .send({
          ...POST_DATA,
          blogId: resBlog.body.id,
        })

      const resComments = await request(httpServer).get(
        `/posts/${resPost.body.id}/comments`,
      )

      expect(resComments.status).toBe(200)
      expect(resComments.body).toHaveProperty('pagesCount')
      expect(resComments.body).toHaveProperty('page')
      expect(resComments.body).toHaveProperty('pageSize')
      expect(resComments.body).toHaveProperty('totalCount')
      expect(resComments.body).toHaveProperty('items')
    })

    it('GET -> "/comments/:id": should return error if :id from uri param not found', async () => {
      await request(httpServer).get(`/comments/test`).expect(404)
    })
  })
})
