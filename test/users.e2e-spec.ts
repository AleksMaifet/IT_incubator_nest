import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication, ValidationPipe } from '@nestjs/common'
import { disconnect } from 'mongoose'
import * as request from 'supertest'
import { DEFAULT_TEST_DATA } from './data'
import { AppModule } from '../src/app.module'
import { useContainer } from 'class-validator'

describe('Users', () => {
  let application: INestApplication

  const { USER_DATA } = DEFAULT_TEST_DATA

  const invalidId = '00000000000000'
  const pageNumber = 1
  const pageSize = 10

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
      providers: [],
    }).compile()

    application = moduleFixture.createNestApplication()

    useContainer(application.select(AppModule), { fallbackOnErrors: true })
    application.useGlobalPipes(new ValidationPipe())

    await application.init()

    await request(application.getHttpServer())
      .delete('/testing/all-data')
      .expect(204)
  })

  it('POST -> "/users": should create a new users', async () => {
    const response = await request(application.getHttpServer())
      .post('/users')
      .send(USER_DATA)

    expect(response.statusCode).toBe(201)
    expect(response.body).toHaveProperty('id')
    expect(response.body).toHaveProperty('login')
    expect(response.body).toHaveProperty('createdAt')
    expect(response.body).toHaveProperty('email')
  })

  it('DELETE -> "/testing/all-data": should remove all data', async () => {
    await request(application.getHttpServer())
      .delete('/testing/all-data')
      .expect(204)
  })

  it('GET -> "/users": should return users array with pagination', async () => {
    const response = await request(application.getHttpServer()).get(
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
    const response = await request(application.getHttpServer())
      .post('/users')
      .send(USER_DATA)

    await request(application.getHttpServer())
      .delete(`/users/${response.body.id}`)
      .send(USER_DATA)
      .expect(204)
  })

  it('DELETE -> "/users/:id": should return an error if :id is not found', async () => {
    await request(application.getHttpServer())
      .delete(`/users/${invalidId}`)
      .send(USER_DATA)
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
