import { disconnect } from 'mongoose'
import { Test, TestingModule } from '@nestjs/testing'
import * as request from 'supertest'
import { INestApplication, ValidationPipe } from '@nestjs/common'
import { useContainer } from 'class-validator'
import { DEFAULT_TEST_DATA } from './data'
import { AppModule } from '../src/app.module'

describe('Blogs', () => {
  let application: INestApplication

  const { BLOG_DATA } = DEFAULT_TEST_DATA

  const errorId = '00000000000000'

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

  it('GET blog by id with error', async () => {
    await request(application.getHttpServer())
      .get('/blogs' + `/${errorId}`)
      .expect(404)
  })

  it('GET blogs by id success', async () => {
    const res = await request(application.getHttpServer())
      .post('/blogs')
      .send(BLOG_DATA)

    await request(application.getHttpServer())
      .get('/blogs' + `/${res.body.id}`)
      .expect(200)
  })

  it('POST not created blog with error', async () => {
    await request(application.getHttpServer()).post('/blogs').expect(400)
  })

  it('POST created blog success', async () => {
    await request(application.getHttpServer())
      .post('/blogs')
      .send(BLOG_DATA)
      .expect(201)
  })

  it('PUT update blog by id success', async () => {
    const res = await request(application.getHttpServer())
      .post('/blogs')
      .send(BLOG_DATA)

    await request(application.getHttpServer())
      .put('/blogs' + `/${res.body.id}`)
      .send(BLOG_DATA)
      .expect(204)
  })

  it('PUT not update blog by id with error', async () => {
    await request(application.getHttpServer())
      .put('/blogs' + `/${errorId}`)
      .send(BLOG_DATA)
      .expect(404)
  })

  it('DELETE delete blog by id success', async () => {
    const res = await request(application.getHttpServer())
      .post('/blogs')
      .send(BLOG_DATA)

    await request(application.getHttpServer())
      .delete('/blogs' + `/${res.body.id}`)
      .expect(204)
  })

  it('DELETE not delete blog by id with error', async () => {
    await request(application.getHttpServer())
      .delete('/blogs' + `/${errorId}`)
      .expect(404)
  })
})

describe('Posts', () => {
  let application: INestApplication

  const { BLOG_DATA, POST_DATA } = DEFAULT_TEST_DATA

  const errorId = '00000000000000'

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

  it('GET posts by id with error', async () => {
    await request(application.getHttpServer())
      .get('/posts' + `/${errorId}`)
      .expect(404)
  })

  it('GET posts by id success', async () => {
    const resBlog = await request(application.getHttpServer())
      .post('/blogs')
      .send(BLOG_DATA)

    const resPost = await request(application.getHttpServer())
      .post('/posts')
      .send({
        ...POST_DATA,
        blogId: resBlog.body.id,
      })

    await request(application.getHttpServer())
      .get('/posts' + `/${resPost.body.id}`)
      .expect(200)
  })

  it('POST not created post with error', async () => {
    await request(application.getHttpServer()).post('/posts').expect(400)
  })

  it('POST created post success', async () => {
    const resBlog = await request(application.getHttpServer())
      .post('/blogs')
      .send(BLOG_DATA)

    await request(application.getHttpServer())
      .post('/posts')
      .send({
        ...POST_DATA,
        blogId: resBlog.body.id,
      })
      .expect(201)
  })

  it('PUT update post by id success', async () => {
    const resBlog = await request(application.getHttpServer())
      .post('/blogs')
      .send(BLOG_DATA)

    const resPost = await request(application.getHttpServer())
      .post('/posts')
      .send({
        ...POST_DATA,
        blogId: resBlog.body.id,
      })

    await request(application.getHttpServer())
      .put('/posts' + `/${resPost.body.id}`)
      .send({
        ...POST_DATA,
        blogId: resBlog.body.id,
      })
      .expect(204)
  })

  it('PUT not update video by id with error', async () => {
    await request(application.getHttpServer())
      .put('/posts' + `/${errorId}`)
      .expect(400)
  })

  it('DELETE delete video by id success', async () => {
    const resBlog = await request(application.getHttpServer())
      .post('/blogs')
      .send(BLOG_DATA)

    const resPost = await request(application.getHttpServer())
      .post('/posts')
      .send({
        ...POST_DATA,
        blogId: resBlog.body.id,
      })

    await request(application.getHttpServer())
      .delete('/posts' + `/${resPost.body.id}`)
      .expect(204)
  })

  it('DELETE not delete video by id with error', async () => {
    await request(application.getHttpServer())
      .delete('/posts' + `/${errorId}`)
      .expect(404)
  })

  afterAll(async () => {
    await request(application.getHttpServer())
      .delete('/testing/all-data')
      .expect(204)

    await disconnect()
    await application.close()
  })
})
