import { disconnect } from 'mongoose'
import * as request from 'supertest'
import { DEFAULT_TEST_DATA } from './data'
import { Test, TestingModule } from '@nestjs/testing'
import { AppModule } from '../src/app.module'
import { useContainer } from 'class-validator'
import { INestApplication, ValidationPipe } from '@nestjs/common'

describe('Comments', () => {
  let application: INestApplication

  const { BLOG_DATA, POST_DATA } = DEFAULT_TEST_DATA

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    application = moduleFixture.createNestApplication()

    useContainer(application.select(AppModule), { fallbackOnErrors: true })
    application.useGlobalPipes(new ValidationPipe())

    await application.init()

    await request(application.getHttpServer())
      .delete('/testing/all-data')
      .expect(204)
  })

  it('GET -> "/posts/:postId/comments": should return comments with pagination', async () => {
    const resBlog = await request(application.getHttpServer())
      .post('/blogs')
      .send(BLOG_DATA)

    const resPost = await request(application.getHttpServer())
      .post('/posts')
      .send({
        ...POST_DATA,
        blogId: resBlog.body.id,
      })

    const resComments = await request(application.getHttpServer()).get(
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
    await request(application.getHttpServer()).get(`/comments/test`).expect(404)
  })

  afterAll(async () => {
    await request(application.getHttpServer())
      .delete('/testing/all-data')
      .expect(204)

    await disconnect()
    await application.close()
  })
})
