import request from 'supertest'
import { Test, TestingModule } from '@nestjs/testing'
import { MongooseModule } from '@nestjs/mongoose'
import { INestApplication } from '@nestjs/common'
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

describe('Post likes', () => {
  let application: INestApplication
  let mongo: MongoMemoryServer
  let httpServer: () => void
  let refreshToken: string
  let accessToken: string
  let postId: string
  const users: string[] = []

  const { USER_DATA, BLOG_DATA, POST_DATA } = DEFAULT_TEST_DATA

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
    'POST -> "/users": should create new user; status 201; content: created user; ' +
      'used additional methods: GET => /users',
    async () => {
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
    },
  )

  it(
    'POST -> "/auth/login": should sign in user; status 200; content: JWT "access" token, ' +
      'JWT "refresh" token in cookie (http only, secure)',
    async () => {
      const response = await request(httpServer)
        .post('/auth/login')
        .send({
          loginOrEmail: USER_DATA.email,
          password: USER_DATA.password,
        })
        .expect(200)

      accessToken = response.body.accessToken
      refreshToken = getRefreshToken(response.get('Set-Cookie'))

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('accessToken')
      expect(refreshToken).toBeTruthy()
      expect(refreshToken.includes('HttpOnly')).toBeTruthy()
      expect(refreshToken.includes('Secure')).toBeTruthy()
    },
  )

  it(
    'POST -> "/posts": should create new post for an existing blog; status 201; content: ' +
      'created post; used additional methods: POST -> /blogs, GET -> /posts/:id;',
    async () => {
      const resBlog = await makeAuthBasicRequest(
        httpServer,
        'post',
        '/sa/blogs',
        BLOG_DATA,
      ).expect(201)

      const resPost = await makeAuthBasicRequest(
        httpServer,
        'post',
        `/sa/blogs/${resBlog.body.id}/posts`,
        POST_DATA,
      ).expect(201)

      postId = resPost.body.id

      expect(resPost.status).toBe(201)
    },
  )

  it(
    'GET -> "/posts/:id": should return status 200; content: post by id; used additional methods: ' +
      'POST -> /blogs, POST -> /posts;',
    async () => {
      await makeAuthBearerRequest(
        httpServer,
        'get',
        accessToken,
        `/posts/${postId}`,
      ).expect(200)
    },
  )

  it(
    'PUT -> "/posts/:postId/like-status": should return error if auth credentials is incorrect; ' +
      'status 401; used additional methods: POST -> /blogs, POST -> /posts;',
    async () => {
      await request(httpServer)
        .put(`/posts/${postId}/like-status`)
        .send({
          likeStatus: 'Like',
        })
        .expect(401)
    },
  )

  it(
    'PUT -> "/posts/:postId/like-status": should return error if :id from uri param not found; ' +
      'status 404;',
    async () => {
      await makeAuthBearerRequest(
        httpServer,
        'put',
        accessToken,
        `/posts/${postId}id/like-status`,
        {
          likeStatus: 'Like',
        },
      ).expect(404)
    },
  )

  it(
    'GET -> "/posts/:postId": get post by unauthorized user. Should return liked post with myStatus: None; ' +
      'status 200; used additional methods: POST => /blogs, POST => /posts, PUT => /posts/:postId/like-status;',
    async () => {
      const response = await request(httpServer).get(`/posts/${postId}`)

      expect(response.status).toBe(200)
      expect(response.body.extendedLikesInfo.myStatus).toBe('None')
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
    'PUT -> "/posts/:postId/like-status": create post then: like the post by user 1, user 2, user 3, ' +
      'user 4. get the post after each like by user 1. NewestLikes should be sorted in descending; status 204; ' +
      'used additional methods: POST => /blogs, POST => /posts, GET => /posts/:id;',
    async () => {
      for (let i = 0; i < 4; i++) {
        await makeAuthBearerRequest(
          httpServer,
          'put',
          users[i],
          `/posts/${postId}/like-status`,
          {
            likeStatus: 'Like',
          },
        ).expect(204)
      }

      const response = await makeAuthBearerRequest(
        httpServer,
        'get',
        users[0],
        `/posts/${postId}`,
      )

      expect(response.status).toBe(200)
      expect(response.body.extendedLikesInfo.likesCount).toBe(4)
      expect(response.body.extendedLikesInfo.dislikesCount).toBe(0)
      expect(response.body.extendedLikesInfo.myStatus).toBe('Like')
      expect(response.body.extendedLikesInfo.newestLikes.length).toBe(3)
    },
  )

  it(
    'PUT -> "/posts/:postId/like-status": create post then: dislike the post by user 1, user 2; ' +
      'like the post by user 3; get the post after each like by user 1; status 200; used additional ' +
      'methods: POST => /blogs, POST => /posts, GET => /posts/:id;',
    async () => {
      const stash = ['Dislike', 'Dislike', 'Like']

      const resBlog = await makeAuthBasicRequest(
        httpServer,
        'post',
        '/sa/blogs',
        BLOG_DATA,
      ).expect(201)

      const resPost = await makeAuthBasicRequest(
        httpServer,
        'post',
        `/sa/blogs/${resBlog.body.id}/posts`,
        POST_DATA,
      ).expect(201)

      for (let i = 0; i < 3; i++) {
        await makeAuthBearerRequest(
          httpServer,
          'put',
          users[i],
          `/posts/${resPost.body.id}/like-status`,
          {
            likeStatus: stash[i],
          },
        ).expect(204)
      }

      const resGetPost = await makeAuthBearerRequest(
        httpServer,
        'get',
        users[0],
        `/posts/${resPost.body.id}`,
      )

      expect(resGetPost.status).toBe(200)
      expect(resGetPost.body.extendedLikesInfo.likesCount).toBe(1)
      expect(resGetPost.body.extendedLikesInfo.dislikesCount).toBe(2)
      expect(resGetPost.body.extendedLikesInfo.myStatus).toBe('Dislike')
    },
  )

  it(
    'PUT -> "/posts/:postId/like-status": create post then: like the post twice by user 1; get the post ' +
      "after each like by user 1. Should increase like's count once; status 204; used additional " +
      'methods: POST => /blogs, POST => /posts, GET => /posts/:id;',
    async () => {
      const resBlog = await makeAuthBasicRequest(
        httpServer,
        'post',
        '/sa/blogs',
        BLOG_DATA,
      ).expect(201)

      const resPost = await makeAuthBasicRequest(
        httpServer,
        'post',
        `/sa/blogs/${resBlog.body.id}/posts`,
        POST_DATA,
      ).expect(201)

      for (let i = 0; i < 2; i++) {
        await makeAuthBearerRequest(
          httpServer,
          'put',
          users[0],
          `/posts/${resPost.body.id}/like-status`,
          {
            likeStatus: 'Like',
          },
        ).expect(204)
      }

      const resGetPost = await makeAuthBearerRequest(
        httpServer,
        'get',
        users[0],
        `/posts/${resPost.body.id}`,
      )

      expect(resGetPost.status).toBe(200)
      expect(resGetPost.body.extendedLikesInfo.likesCount).toBe(1)
    },
  )

  it(
    'PUT -> "/posts/:postId/like-status": create post then: like the post by user 1; dislike ' +
      "the post by user 1; set 'none' status by user 1; get the post after each like by user 1; status 204; " +
      'used additional methods: POST => /blogs, POST => /posts, GET => /posts/:id;',
    async () => {
      const stash = ['Like', 'Dislike', 'None']

      const resBlog = await makeAuthBasicRequest(
        httpServer,
        'post',
        '/sa/blogs',
        BLOG_DATA,
      ).expect(201)

      const resPost = await makeAuthBasicRequest(
        httpServer,
        'post',
        `/sa/blogs/${resBlog.body.id}/posts`,
        POST_DATA,
      ).expect(201)

      for (let i = 0; i < 3; i++) {
        await makeAuthBearerRequest(
          httpServer,
          'put',
          users[0],
          `/posts/${resPost.body.id}/like-status`,
          {
            likeStatus: stash[i],
          },
        ).expect(204)
      }

      const resGetPost = await makeAuthBearerRequest(
        httpServer,
        'get',
        users[0],
        `/posts/${resPost.body.id}`,
      )

      console.log(resGetPost.body.extendedLikesInfo.dislikesCount, '@')

      expect(resGetPost.status).toBe(200)
      expect(resGetPost.body.extendedLikesInfo.likesCount).toBe(0)
      expect(resGetPost.body.extendedLikesInfo.dislikesCount).toBe(0)
      expect(resGetPost.body.extendedLikesInfo.myStatus).toBe('None')
      expect(resGetPost.body.extendedLikesInfo.newestLikes).toMatchObject([])
    },
  )
})
