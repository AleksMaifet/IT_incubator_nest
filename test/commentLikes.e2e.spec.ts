import request from 'supertest'
import { INestApplication } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { Test, TestingModule } from '@nestjs/testing'
import { MongoMemoryServer } from 'mongodb-memory-server'
import { DEFAULT_TEST_DATA } from './data'
import { AppModule } from '../src/app.module'
import { MongoDatabaseModule } from '../src/configs'
import { appSettings } from '../src/app.settings'
import {
  getRefreshToken,
  makeAuthBasicRequest,
  makeAuthBearerRequest,
} from './helpers'

//TODO change file name after time!

describe('Comment likes', () => {
  let application: INestApplication
  let mongo: MongoMemoryServer
  let httpServer: () => void
  let refreshToken: string
  let accessToken: string
  let commentId: string
  let postId: string
  const users: string[] = []

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

    await request(httpServer).delete('/testing/all-data').expect(204)
  })

  afterAll(async () => {
    await request(httpServer).delete('/testing/all-data').expect(204)

    await mongo.stop()
    await application.close()
  })

  it('POST -> "/users": should create new user; status 201; content: created user; used additional methods: GET => /users', async () => {
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

  it('POST -> "/auth/login": should sign in user; status 200; content: JWT "access" token, JWT "refresh" token in cookie (http only, secure)', async () => {
    const response = await request(httpServer).post('/auth/login').send({
      loginOrEmail: USER_DATA.email,
      password: USER_DATA.password,
    })

    accessToken = response.body.accessToken
    refreshToken = getRefreshToken(response.get('Set-Cookie'))

    expect(response.status).toBe(200)
    expect(response.body).toHaveProperty('accessToken')
    expect(refreshToken).toBeTruthy()
    expect(refreshToken.includes('HttpOnly')).toBeTruthy()
    expect(refreshToken.includes('Secure')).toBeTruthy()
  })

  it(
    'POST -> "/posts/:postId/comments": should create new comment; status 201; content: ' +
      'created comment; used additional methods: POST -> /blogs, POST -> /posts, GET -> /comments/:commentId',
    async () => {
      /// Created blog
      const blogRes = await makeAuthBasicRequest(
        httpServer,
        'post',
        '/blogs',
        BLOG_DATA,
      )

      /// Created post
      const postRes = await makeAuthBasicRequest(httpServer, 'post', '/posts', {
        ...POST_DATA,
        blogId: blogRes.body.id,
      })

      postId = postRes.body.id

      const response = await makeAuthBearerRequest(
        httpServer,
        'post',
        accessToken,
        `/posts/${postId}/comments`,
        {
          content: COMMENT_DATA.content,
        },
      )

      commentId = response.body.id

      expect(response.status).toBe(201)
      expect(response.body).toHaveProperty('id')
    },
  )

  it(
    'GET -> "/comments/:commentsId": should return status 200; content: comment by id; ' +
      'used additional methods: POST -> /blogs, POST -> /posts, POST -> /posts/:postId/comments',
    async () => {
      await makeAuthBearerRequest(
        httpServer,
        'get',
        accessToken,
        `/comments/${commentId}`,
      ).expect(200)
    },
  )

  it(
    'PUT -> "/comments/:commentId/like-status": should return error if auth credentials is incorrect;' +
      ' status 401; used additional methods: POST -> /blogs, POST -> /posts, POST -> /comments',
    async () => {
      await request(httpServer)
        .put(`/comments/${commentId}/like-status`)
        .send({
          likeStatus: 'Like',
        })
        .expect(401)
    },
  )

  it(
    'PUT -> "/comments/:commentId/like-status": should return error if :id from uri param not found; ' +
      'status 404',
    async () => {
      await makeAuthBearerRequest(
        httpServer,
        'put',
        accessToken,
        `/comments/${commentId}id/like-status`,
        {
          likeStatus: 'Like',
        },
      ).expect(404)
    },
  )

  it(
    'GET -> "/comments/:commentId": get comment by unauthorized user. Should return liked comment with ' +
      '"myStatus: None"; status 200; ' +
      'used additional methods: POST => /blogs, POST => /posts, POST => /posts/:postId/comments, ' +
      'PUT => /comments/:commentId/like-status',
    async () => {
      const response = await request(httpServer).get(`/comments/${commentId}`)

      expect(response.status).toBe(200)
      expect(response.body.likesInfo.myStatus).toBe('None')
    },
  )

  it(
    'POST -> "/users", "/auth/login": should create and login 4 users; status 201; content: ' +
      'created users',
    async () => {
      for (let i = 0; i < 4; i++) {
        const password = `${USER_DATA.password + i}`
        const login = `${USER_DATA.login + i}`

        await makeAuthBasicRequest(httpServer, 'post', '/sa/users', {
          login,
          password,
          email: `${i + USER_DATA.email}`,
        }).expect(201)

        const response = await request(httpServer)
          .post('/auth/login')
          .send({
            loginOrEmail: login,
            password,
          })
          .expect(200)

        users[i] = response.body.accessToken
      }
    },
  )

  it(
    'PUT -> "/comments/:commentId/like-status": create comment then: like the comment by user 1, ' +
      'user 2, user 3, user 4. get the comment after each like by user 1. ; status 204; used additional ' +
      'methods: POST => /blogs, POST => /posts, POST => /posts/:postId/comments, GET => /comments/:id',
    async () => {
      for (let i = 0; i < 4; i++) {
        await makeAuthBearerRequest(
          httpServer,
          'put',
          users[i],
          `/comments/${commentId}/like-status`,
          {
            likeStatus: 'Like',
          },
        ).expect(204)
      }

      const response = await makeAuthBearerRequest(
        httpServer,
        'get',
        users[0],
        `/comments/${commentId}`,
      )

      expect(response.status).toBe(200)
      expect(response.body.likesInfo.likesCount).toBe(4)
      expect(response.body.likesInfo.dislikesCount).toBe(0)
      expect(response.body.likesInfo.myStatus).toBe('Like')
    },
  )

  it(
    'PUT -> "/comments/:commentId/like-status": create comment then: dislike the comment by user 1, ' +
      'user 2; like the comment by user 3; get the comment after each like by user 1; status 204; ' +
      'used additional methods: POST => /blogs, POST => /posts, POST => /posts/:postId/comments, ' +
      'GET => /comments/:id',
    async () => {
      const stash = ['Dislike', 'Dislike', 'Like']
      const resPostComment = await makeAuthBearerRequest(
        httpServer,
        'post',
        accessToken,
        `/posts/${postId}/comments`,
        {
          content: COMMENT_DATA.content,
        },
      ).expect(201)

      commentId = resPostComment.body.id

      for (let i = 0; i < 3; i++) {
        await makeAuthBearerRequest(
          httpServer,
          'put',
          users[i],
          `/comments/${commentId}/like-status`,
          {
            likeStatus: stash[i],
          },
        ).expect(204)
      }

      const resGetComment = await makeAuthBearerRequest(
        httpServer,
        'get',
        users[0],
        `/comments/${commentId}`,
      )

      expect(resGetComment.status).toBe(200)
      expect(resGetComment.body.likesInfo.likesCount).toBe(1)
      expect(resGetComment.body.likesInfo.dislikesCount).toBe(2)
      expect(resGetComment.body.likesInfo.myStatus).toBe('Dislike')
    },
  )

  it(
    'PUT -> "/comments/:commentId/like-status": create comment then: like the comment twice by user 1;' +
      " get the comment after each like by user 1. Should increase like's count once; status 204; " +
      'used additional methods: POST => /blogs, POST => /posts, POST => /posts/:postId/comments, ' +
      'GET => /comments/:id',
    async () => {
      const resPostComment = await makeAuthBearerRequest(
        httpServer,
        'post',
        accessToken,
        `/posts/${postId}/comments`,
        {
          content: COMMENT_DATA.content,
        },
      ).expect(201)

      commentId = resPostComment.body.id

      for (let i = 0; i < 2; i++) {
        await makeAuthBearerRequest(
          httpServer,
          'put',
          users[0],
          `/comments/${commentId}/like-status`,
          {
            likeStatus: 'Like',
          },
        ).expect(204)
      }

      const resGetComment = await makeAuthBearerRequest(
        httpServer,
        'get',
        users[0],
        `/comments/${commentId}`,
      )

      expect(resGetComment.status).toBe(200)
      expect(resGetComment.body.likesInfo.likesCount).toBe(1)
    },
  )

  it(
    'PUT -> "/comments/:commentId/like-status": create comment then: like the comment by user 1; ' +
      'dislike the comment by user 1; set "none" status by user 1; get the comment after each like by user 1; ' +
      'status 204; used additional methods: POST => /blogs, POST => /posts, POST => /posts/:postId/comments, ' +
      'GET => /comments/:id',
    async () => {
      const stash = ['Like', 'Dislike', 'None']

      const resPostComment = await makeAuthBearerRequest(
        httpServer,
        'post',
        accessToken,
        `/posts/${postId}/comments`,
        {
          content: COMMENT_DATA.content,
        },
      ).expect(201)

      commentId = resPostComment.body.id

      for (let i = 0; i < 3; i++) {
        await makeAuthBearerRequest(
          httpServer,
          'put',
          users[0],
          `/comments/${commentId}/like-status`,
          {
            likeStatus: stash[i],
          },
        ).expect(204)
      }

      const resGetComment = await makeAuthBearerRequest(
        httpServer,
        'get',
        users[0],
        `/comments/${commentId}`,
      )

      expect(resGetComment.status).toBe(200)
      expect(resGetComment.body.likesInfo.likesCount).toBe(0)
      expect(resGetComment.body.likesInfo.dislikesCount).toBe(0)
      expect(resGetComment.body.likesInfo.myStatus).toBe('None')
    },
  )

  it(
    'PUT -> "/comments/:commentId/like-status": create comment then: like the comment by user 1;' +
      ' dislike the comment by user 2 then get by the user 1; status 204; ' +
      'used additional methods: POST => /blogs, POST => /posts, POST => /posts/:postId/comments, ' +
      'GET => /comments/:id',
    async () => {
      const stash = ['Like', 'Dislike']
      const resPostComment = await makeAuthBearerRequest(
        httpServer,
        'post',
        accessToken,
        `/posts/${postId}/comments`,
        {
          content: COMMENT_DATA.content,
        },
      ).expect(201)

      commentId = resPostComment.body.id

      for (let i = 0; i < 2; i++) {
        await makeAuthBearerRequest(
          httpServer,
          'put',
          users[i],
          `/comments/${commentId}/like-status`,
          {
            likeStatus: stash[i],
          },
        ).expect(204)
      }

      const resGetComment = await makeAuthBearerRequest(
        httpServer,
        'get',
        users[0],
        `/comments/${commentId}`,
      )

      expect(resGetComment.status).toBe(200)
      expect(resGetComment.body.likesInfo.likesCount).toBe(1)
      expect(resGetComment.body.likesInfo.dislikesCount).toBe(1)
      expect(resGetComment.body.likesInfo.myStatus).toBe('Like')
    },
  )
})
