import request from 'supertest'
import { INestApplication } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { MongooseModule } from '@nestjs/mongoose'
import { sign } from 'jsonwebtoken'
import { MongoMemoryServer } from 'mongodb-memory-server'
import { AppModule } from '../src/app.module'
import { appSettings } from '../src/app.settings'
import { MongoDatabaseModule } from '../src/configs'
import { DEFAULT_TEST_DATA } from './data'
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
  let mongo: MongoMemoryServer
  let httpServer: () => void

  const { USER_DATA, BLOG_DATA, POST_DATA, COMMENT_DATA } = DEFAULT_TEST_DATA

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
  })

  afterAll(async () => {
    await request(httpServer).delete('/testing/all-data').expect(204)

    await mongo.stop()
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
        '/sa/users',
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
        `/sa/users?pageNumber=${pageNumber}&pageSize=${pageSize}`,
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
        '/sa/users',
        USER_DATA,
      )

      await makeAuthBasicRequest(
        httpServer,
        'delete',
        `/sa/users/${response.body.id}`,
        USER_DATA,
      ).expect(204)
    })

    it('DELETE -> "/users/:id": should return an error if :id is not found', async () => {
      await makeAuthBasicRequest(
        httpServer,
        'delete',
        `/sa/users/${invalidId}`,
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
        '/sa/users',
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
          '/sa/users',
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

  describe('RefreshToken', () => {
    let refreshToken_1: string
    let refreshToken_2: string
    let accessToken: string

    beforeAll(async () => {
      await request(httpServer).delete('/testing/all-data').expect(204)
    })

    it('POST -> "/users": should create new user; status 201; content: created user; used additional methods: GET => /users;', async () => {
      const response = await makeAuthBasicRequest(
        httpServer,
        'post',
        '/sa/users',
        USER_DATA,
      ).expect(201)

      expect(response.body).toHaveProperty('id')
      expect(response.body).toHaveProperty('login')
      expect(response.body).toHaveProperty('createdAt')
      expect(response.body).toHaveProperty('email')
    })

    it('POST -> "/auth/login": should sign in user; status 200; content: JWT "access" token, JWT "refresh" token in cookie (http only, secure);', async () => {
      const response = await request(httpServer).post('/auth/login').send({
        loginOrEmail: USER_DATA.email,
        password: USER_DATA.password,
      })

      refreshToken_1 = getRefreshToken(response.get('Set-Cookie'))

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('accessToken')
      expect(refreshToken_1).toBeTruthy()
      expect(refreshToken_1.includes('HttpOnly')).toBeTruthy()
      expect(refreshToken_1.includes('Secure')).toBeTruthy()
    })

    it('POST -> "/auth/me": should return the error when the "access" token has expired or there is none in the headers; status 401;', async () => {
      await makeAuthBearerRequest(httpServer, 'get', '', '/auth/me').expect(401)
    })

    it('POST -> "/auth/refresh-token", "/auth/logout": should return an error when the "refresh" token has expired or there is none in the cookie; status 401;', async () => {
      await request(httpServer).post('/auth/refresh-token').expect(401)
    })

    it('POST -> "/auth/refresh-token": should return new "refresh" and "access" tokens; status 200; content: new JWT "access" token, new JWT "refresh" token in cookie (http only, secure);', async () => {
      await delay(1000)

      const response = await request(httpServer)
        .post('/auth/refresh-token')
        .set('Cookie', `refreshToken=${refreshToken_1}`)

      refreshToken_2 = getRefreshToken(response.get('Set-Cookie'))
      accessToken = response.body.accessToken

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('accessToken')
      expect(refreshToken_2).toBeTruthy()
      expect(refreshToken_2.includes('HttpOnly')).toBeTruthy()
      expect(refreshToken_2.includes('Secure')).toBeTruthy()
    })

    it('POST -> "/auth/refresh-token", "/auth/logout": should return an error if the "refresh" token has become invalid; status 401;', async () => {
      await request(httpServer)
        .post('/auth/refresh-token')
        .set('Cookie', `refreshToken=${refreshToken_1}`)
        .expect(401)
    })

    it('POST -> "/auth/me": should check "access" token and return current user data; status 200; content: current user data;', async () => {
      const response = await makeAuthBearerRequest(
        httpServer,
        'get',
        accessToken,
        '/auth/me',
      )

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('email')
      expect(response.body).toHaveProperty('login')
      expect(response.body).toHaveProperty('userId')
    })

    it('POST -> "/auth/logout": should make the "refresh" token invalid; status 204;', async () => {
      await request(httpServer)
        .post('/auth/logout')
        .set('Cookie', `refreshToken=${refreshToken_2}`)
        .expect(204)
    })

    it('POST -> "/auth/refresh-token", "/auth/logout": should return an error when the "refresh" token has expired or there is none in the cookie; status 401;', async () => {
      await request(httpServer)
        .post('/auth/refresh-token')
        .set('Cookie', `refreshToken=${refreshToken_2}`)
        .expect(401)
    })
  })

  // describe('Blogs', () => {
  //   const errorId = '00000000000000'
  //
  //   beforeAll(async () => {
  //     await request(httpServer).delete('/testing/all-data').expect(204)
  //   })
  //
  //   it('GET blog by id with error', async () => {
  //     await request(httpServer)
  //       .get('/blogs' + `/${errorId}`)
  //       .expect(404)
  //   })
  //
  //   it('GET blogs by id success', async () => {
  //     const res = await makeAuthBasicRequest(
  //       httpServer,
  //       'post',
  //       '/blogs',
  //       BLOG_DATA,
  //     )
  //
  //     await request(httpServer)
  //       .get('/blogs' + `/${res.body.id}`)
  //       .expect(200)
  //   })
  //
  //   it('POST/PUT/DELETE  blog with Unauthorized error', async () => {
  //     await request(httpServer).post('/blogs').expect(401)
  //
  //     await request(httpServer)
  //       .delete('/blogs' + `/${errorId}`)
  //       .expect(401)
  //
  //     await request(httpServer)
  //       .put('/blogs' + `/${errorId}`)
  //       .expect(401)
  //   })
  //
  //   it('POST not created blog with error', async () => {
  //     await makeAuthBasicRequest(httpServer, 'post', '/blogs').expect(400)
  //   })
  //
  //   it('POST created blog success', async () => {
  //     await makeAuthBasicRequest(
  //       httpServer,
  //       'post',
  //       '/blogs',
  //       BLOG_DATA,
  //     ).expect(201)
  //   })
  //
  //   it('PUT update blog by id success', async () => {
  //     const res = await makeAuthBasicRequest(
  //       httpServer,
  //       'post',
  //       '/blogs',
  //       BLOG_DATA,
  //     )
  //
  //     await makeAuthBasicRequest(
  //       httpServer,
  //       'put',
  //       '/blogs' + `/${res.body.id}`,
  //       BLOG_DATA,
  //     ).expect(204)
  //   })
  //
  //   it('PUT not update blog by id with error', async () => {
  //     await makeAuthBasicRequest(
  //       httpServer,
  //       'put',
  //       '/blogs' + `/${errorId}`,
  //       BLOG_DATA,
  //     ).expect(404)
  //   })
  //
  //   it('DELETE delete blog by id success', async () => {
  //     const res = await makeAuthBasicRequest(
  //       httpServer,
  //       'post',
  //       '/blogs',
  //       BLOG_DATA,
  //     )
  //
  //     await makeAuthBasicRequest(
  //       httpServer,
  //       'delete',
  //       '/blogs' + `/${res.body.id}`,
  //     ).expect(204)
  //   })
  //
  //   it('DELETE not delete blog by id with error', async () => {
  //     await makeAuthBasicRequest(
  //       httpServer,
  //       'delete',
  //       '/blogs' + `/${errorId}`,
  //     ).expect(404)
  //   })
  // })
  //
  // describe('Posts', () => {
  //   const errorId = '00000000000000'
  //
  //   beforeAll(async () => {
  //     await request(httpServer).delete('/testing/all-data').expect(204)
  //   })
  //
  //   it('GET posts by id with error', async () => {
  //     await request(httpServer)
  //       .get('/posts' + `/${errorId}`)
  //       .expect(404)
  //   })
  //
  //   it('GET posts by id success', async () => {
  //     const resBlog = await makeAuthBasicRequest(
  //       httpServer,
  //       'post',
  //       '/blogs',
  //       BLOG_DATA,
  //     )
  //
  //     const resPost = await makeAuthBasicRequest(httpServer, 'post', '/posts', {
  //       ...POST_DATA,
  //       blogId: resBlog.body.id,
  //     })
  //
  //     await request(httpServer)
  //       .get('/posts' + `/${resPost.body.id}`)
  //       .expect(200)
  //   })
  //
  //   it('POST/PUT/DELETE  post with Unauthorized error', async () => {
  //     await request(httpServer).post('/posts').expect(401)
  //
  //     await request(httpServer)
  //       .delete('/posts' + `/${errorId}`)
  //       .expect(401)
  //
  //     await request(httpServer)
  //       .put('/posts' + `/${errorId}`)
  //       .expect(401)
  //   })
  //
  //   it('POST not created post with error', async () => {
  //     await makeAuthBasicRequest(httpServer, 'post', '/posts').expect(400)
  //   })
  //
  //   it('POST created post success', async () => {
  //     const resBlog = await makeAuthBasicRequest(
  //       httpServer,
  //       'post',
  //       '/blogs',
  //       BLOG_DATA,
  //     )
  //
  //     await makeAuthBasicRequest(httpServer, 'post', '/posts', {
  //       ...POST_DATA,
  //       blogId: resBlog.body.id,
  //     }).expect(201)
  //   })
  //
  //   it('PUT update post by id success', async () => {
  //     const resBlog = await makeAuthBasicRequest(
  //       httpServer,
  //       'post',
  //       '/blogs',
  //       BLOG_DATA,
  //     )
  //
  //     const res = await makeAuthBasicRequest(httpServer, 'post', '/posts', {
  //       ...POST_DATA,
  //       blogId: resBlog.body.id,
  //     })
  //
  //     await makeAuthBasicRequest(
  //       httpServer,
  //       'put',
  //       '/posts' + `/${res.body.id}`,
  //       {
  //         ...POST_DATA,
  //         blogId: resBlog.body.id,
  //       },
  //     ).expect(204)
  //   })
  //
  //   it('PUT not update post by id with error', async () => {
  //     const resBlog = await makeAuthBasicRequest(
  //       httpServer,
  //       'post',
  //       '/blogs',
  //       BLOG_DATA,
  //     )
  //
  //     await makeAuthBasicRequest(httpServer, 'put', '/posts' + `/${errorId}`, {
  //       ...POST_DATA,
  //       blogId: resBlog.body.id,
  //     }).expect(404)
  //   })
  //
  //   it('DELETE delete post by id success', async () => {
  //     const resBlog = await makeAuthBasicRequest(
  //       httpServer,
  //       'post',
  //       '/blogs',
  //       BLOG_DATA,
  //     )
  //
  //     const resPost = await makeAuthBasicRequest(httpServer, 'post', '/posts', {
  //       ...POST_DATA,
  //       blogId: resBlog.body.id,
  //     })
  //
  //     await makeAuthBasicRequest(
  //       httpServer,
  //       'delete',
  //       '/posts' + `/${resPost.body.id}`,
  //     ).expect(204)
  //   })
  //
  //   it('DELETE not delete video by id with error', async () => {
  //     await makeAuthBasicRequest(
  //       httpServer,
  //       'delete',
  //       '/posts' + `/${errorId}`,
  //     ).expect(404)
  //   })
  // })
  //
  // describe('Comments', () => {
  //   let jwt_token: string
  //   let postId: string
  //
  //   beforeAll(async () => {
  //     await request(httpServer).delete('/testing/all-data').expect(204)
  //
  //     /// Created blog
  //     const blogRes = await makeAuthBasicRequest(
  //       httpServer,
  //       'post',
  //       '/blogs',
  //       BLOG_DATA,
  //     )
  //
  //     /// Created post
  //     const postRes = await makeAuthBasicRequest(httpServer, 'post', '/posts', {
  //       ...POST_DATA,
  //       blogId: blogRes.body.id,
  //     })
  //
  //     /// Created user
  //     await makeAuthBasicRequest(httpServer, 'post', '/users', USER_DATA)
  //     /// Login user
  //     const res = await request(httpServer).post('/auth/login').send({
  //       loginOrEmail: USER_DATA.email,
  //       password: USER_DATA.password,
  //     })
  //
  //     postId = postRes.body.id
  //     jwt_token = res.body.accessToken
  //   })
  //
  //   it('POST -> "/posts/:postId/comments": should create new comment', async () => {
  //     const res = await makeAuthBearerRequest(
  //       httpServer,
  //       'post',
  //       jwt_token,
  //       `/posts/${postId}/comments`,
  //       {
  //         content: COMMENT_DATA.content,
  //       },
  //     )
  //
  //     expect(res.statusCode).toBe(201)
  //     expect(res.body).toHaveProperty('id')
  //     expect(res.body.content).toBe(COMMENT_DATA.content)
  //   })
  //
  //   it('GET -> "/posts/:postId/comments": should return comments with pagination', async () => {
  //     const resComments = await request(httpServer).get(
  //       `/posts/${postId}/comments`,
  //     )
  //
  //     expect(resComments.status).toBe(200)
  //     expect(resComments.body).toHaveProperty('pagesCount')
  //     expect(resComments.body).toHaveProperty('page')
  //     expect(resComments.body).toHaveProperty('pageSize')
  //     expect(resComments.body).toHaveProperty('totalCount')
  //     expect(resComments.body).toHaveProperty('items')
  //   })
  //
  //   it('DELETE -> "/comments/:id": should delete comment by id', async () => {
  //     const commentRes = await makeAuthBearerRequest(
  //       httpServer,
  //       'post',
  //       jwt_token,
  //       `/posts/${postId}/comments`,
  //       {
  //         content: COMMENT_DATA.content,
  //       },
  //     ).expect(201)
  //
  //     await makeAuthBearerRequest(
  //       httpServer,
  //       'delete',
  //       jwt_token,
  //       `/comments/${commentRes.body.id}`,
  //     ).expect(204)
  //   })
  //
  //   it('PUT -> "/comments/:commentId": should update comment by id', async () => {
  //     const commentRes = await makeAuthBearerRequest(
  //       httpServer,
  //       'post',
  //       jwt_token,
  //       `/posts/${postId}/comments`,
  //       {
  //         content: COMMENT_DATA.content,
  //       },
  //     )
  //
  //     await makeAuthBearerRequest(
  //       httpServer,
  //       'put',
  //       jwt_token,
  //       `/comments/${commentRes.body.id}`,
  //       {
  //         content: COMMENT_DATA.content + COMMENT_DATA.content,
  //       },
  //     ).expect(204)
  //   })
  //
  //   it('GET -> "comments/:commentId": should return comment by id', async () => {
  //     const commentRes = await makeAuthBearerRequest(
  //       httpServer,
  //       'post',
  //       jwt_token,
  //       `/posts/${postId}/comments`,
  //       {
  //         content: COMMENT_DATA.content,
  //       },
  //     )
  //
  //     const resComments = await request(httpServer).get(
  //       `/comments/${commentRes.body.id}`,
  //     )
  //
  //     expect(resComments.status).toBe(200)
  //     expect(resComments.body).toHaveProperty('id', commentRes.body.id)
  //     expect(resComments.body).toHaveProperty('content', COMMENT_DATA.content)
  //     expect(resComments.body).toHaveProperty('commentatorInfo')
  //     expect(resComments.body).toHaveProperty('createdAt')
  //   })
  //
  //   it('DELETE. -> "/comments/:id": should return error if :id from uri param not found', async () => {
  //     await makeAuthBearerRequest(
  //       httpServer,
  //       'delete',
  //       jwt_token,
  //       `/comments/invalid-id`,
  //     ).expect(404)
  //   })
  //
  //   it('POST -> "posts/:postId/comments": should return error if auth credentials is incorrect', async () => {
  //     await request(httpServer).post(`/posts/${postId}/comments`).expect(401)
  //   })
  //
  //   it('PUT -> "/comments/:id": should return error if access denied', async () => {
  //     // Created user
  //     await makeAuthBasicRequest(httpServer, 'post', '/users', {
  //       login: 'TEST_LOGIN',
  //       password: USER_DATA.password,
  //       email: 'test@mail.ru',
  //     })
  //
  //     const loginRes = await request(httpServer).post('/auth/login').send({
  //       loginOrEmail: 'TEST_LOGIN',
  //       password: USER_DATA.password,
  //     })
  //
  //     // Created comment
  //     const commentRes = await makeAuthBearerRequest(
  //       httpServer,
  //       'post',
  //       loginRes.body.accessToken,
  //       `/posts/${postId}/comments`,
  //       {
  //         content: COMMENT_DATA.content,
  //       },
  //     )
  //
  //     // Updated the comment with a different user
  //     await makeAuthBearerRequest(
  //       httpServer,
  //       'put',
  //       jwt_token,
  //       `/comments/${commentRes.body.id}`,
  //       {
  //         content: COMMENT_DATA.content,
  //       },
  //     ).expect(403)
  //   })
  // })
  //
  // describe('Comments for posts with auth > Comments body validation', () => {
  //   let jwt_token: string
  //   let postId: string
  //
  //   const { BLOG_DATA, POST_DATA, COMMENT_DATA } = DEFAULT_TEST_DATA
  //
  //   beforeAll(async () => {
  //     await request(httpServer).delete('/testing/all-data').expect(204)
  //
  //     /// Created blog
  //     const blogRes = await makeAuthBasicRequest(
  //       httpServer,
  //       'post',
  //       '/blogs',
  //       BLOG_DATA,
  //     )
  //
  //     /// Created post
  //     const postRes = await makeAuthBasicRequest(httpServer, 'post', '/posts', {
  //       ...POST_DATA,
  //       blogId: blogRes.body.id,
  //     })
  //
  //     /// Created user
  //     await makeAuthBasicRequest(httpServer, 'post', '/users', USER_DATA)
  //     /// Login user
  //     const res = await request(httpServer).post('/auth/login').send({
  //       loginOrEmail: USER_DATA.email,
  //       password: USER_DATA.password,
  //     })
  //
  //     postId = postRes.body.id
  //     jwt_token = res.body.accessToken
  //   })
  //
  //   it('POST -> "/posts/:postId/comments": should return error if passed body is incorrect', async () => {
  //     await makeAuthBearerRequest(
  //       httpServer,
  //       'post',
  //       jwt_token,
  //       `/posts/${postId}/comments`,
  //       {
  //         invalidField: 'Invalid field',
  //       },
  //     ).expect(400)
  //   })
  //
  //   it('PUT -> "/comments/:commentId": should return error if passed body is incorrect', async () => {
  //     // Created comment
  //     const commentRes = await makeAuthBearerRequest(
  //       httpServer,
  //       'post',
  //       jwt_token,
  //       `/posts/${postId}/comments`,
  //       {
  //         content: COMMENT_DATA.content,
  //       },
  //     )
  //
  //     await makeAuthBearerRequest(
  //       httpServer,
  //       'put',
  //       jwt_token,
  //       `/comments/${commentRes.body.id}`,
  //       {
  //         content: 'Invalid field',
  //       },
  //     ).expect(400)
  //   })
  // })
  //
})
