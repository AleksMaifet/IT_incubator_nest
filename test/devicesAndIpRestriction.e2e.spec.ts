import request from 'supertest'
import { MongooseModule } from '@nestjs/mongoose'
import { sign } from 'jsonwebtoken'
import { INestApplication } from '@nestjs/common'
import { MongoMemoryServer } from 'mongodb-memory-server'
import { Test, TestingModule } from '@nestjs/testing'
import { delay, getRefreshToken, makeAuthBasicRequest } from './helpers'
import { DEFAULT_TEST_DATA } from './data'
import { AppModule } from '../src/app.module'
import { DatabaseModule } from '../src/configs'
import { appSettings } from '../src/app.settings'

describe('Devices and Ip restriction', () => {
  let application: INestApplication
  let mongo: MongoMemoryServer
  let httpServer: () => void

  const { USER_DATA } = DEFAULT_TEST_DATA

  const userLogins = [
    {
      userAgent:
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:120.0) Gecko/20100101 Firefox/120.0',
      refreshToken: '',
      ip: '127.0.0.0',
    },
    {
      userAgent:
        'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.103',
      refreshToken: '',
      ip: '127.0.0.1',
    },
    {
      userAgent:
        'Mozilla/5.0 (iPhone; CPU iPhone OS 13_5_1 like Mac OS X) AppleWebKit/605.1.15 ' +
        '(KHTML, like Gecko) Version/13.1.1 Mobile/15E148 Safari/604.1',
      refreshToken: '',
      ip: '127.0.0.2',
    },
    {
      userAgent:
        'Mozilla/5.0 (Windows NT 10.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/42.0.2311.135 ' +
        'Safari/537.36 Edge/12.10136',
      refreshToken: '',
      ip: '127.0.0.3',
    },
  ]

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideModule(DatabaseModule)
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
      const pageNumber = 1
      const pageSize = 10

      const res = await makeAuthBasicRequest(
        httpServer,
        'post',
        '/users',
        USER_DATA,
      )

      expect(res.body).toHaveProperty('id')
      expect(res.body).toHaveProperty('login')
      expect(res.body).toHaveProperty('createdAt')
      expect(res.body).toHaveProperty('email')

      const getUserRes = await makeAuthBasicRequest(
        httpServer,
        'get',
        `/users?pageNumber=${pageNumber}&pageSize=${pageSize}`,
      )

      expect(getUserRes.status).toBe(200)
      expect(getUserRes.body.items[0].login).toBe(USER_DATA.login)
      expect(getUserRes.body.items[0].email).toBe(USER_DATA.email)
    },
  )

  it(
    'GET -> "/security/devices": login user 4 times from different browsers, ' +
      'then get device list; status 200; content: device list; ' +
      'used additional methods: POST => /auth/login',
    async () => {
      // Login user 4 times from different browsers
      for (let i = 0; i < 4; i++) {
        const res = await request(httpServer)
          .post('/auth/login')
          .send({
            loginOrEmail: USER_DATA.login,
            password: USER_DATA.password,
          })
          .set('User-Agent', userLogins[i].userAgent)
          .set('x-forwarded-for', userLogins[i].ip)

        userLogins[i].refreshToken = getRefreshToken(res.get('Set-Cookie'))
      }

      const res = await request(httpServer)
        .get('/security/devices')
        .set('Cookie', `refreshToken=${userLogins[0].refreshToken}`)

      expect(res.status).toBe(200)
      expect(res.body.length).toBe(4)
    },
  )

  it(
    'DELETE -> "/security/devices/:deviceId": should return error ' +
      'if :id not found; status 404',
    async () => {
      await request(httpServer)
        .delete(`/security/devices/123`)
        .set('Cookie', `refreshToken=${userLogins[0].refreshToken}`)
        .expect(404)
    },
  )

  it(
    'GET -> "/security/devices", DELETE -> "security/devices": should return error ' +
      'if auth credentials is incorrect; status 401',
    async () => {
      const randomToken = sign(
        { userId: new Date().getMilliseconds().toString() },
        'secret',
      )

      // GET -> "/security/devices"
      await request(httpServer).get('/security/devices').expect(401)

      // DELETE -> "security/devices"
      await request(httpServer)
        .delete('/security/devices')
        .set('Cookie', `refreshToken=${randomToken}`)
        .expect(401)
    },
  )

  it(
    'DELETE -> "/security/devices/:sessionId": ' +
      'Get device list by user1. Create user2, login user 2 with the same user-agent header as user 1. ' +
      'Try to delete second device by user2 from device list of user1. Should return forbidden error; ' +
      'status 403; used additional methods: GET -> /security/devices, POST -> /users, ' +
      'POST -> /auth/login',
    async () => {
      // Get device list by user1
      const user1Devices = await request(httpServer)
        .get('/security/devices')
        .set('Cookie', `refreshToken=${userLogins[0].refreshToken}`)
        .expect(200)

      // Create user2
      const newUserData = {
        login: 'testuser2',
        password: 'testpassword2',
        email: 'testuser2@mail.ru',
      }

      await makeAuthBasicRequest(
        httpServer,
        'post',
        '/users',
        newUserData,
      ).expect(201)

      // Login user2 with the same user-agent header as user1
      const resUser2 = await request(httpServer)
        .post('/auth/login')
        .send({
          loginOrEmail: newUserData.login,
          password: newUserData.password,
        })
        .set('User-Agent', userLogins[0].userAgent)
        .set('x-forwarded-for', userLogins[0].ip)
        .expect(200)

      const user2RefreshToken = getRefreshToken(resUser2.get('Set-Cookie'))

      // Try to delete second device by user2 from device list of user1
      const secondDeviceId = user1Devices.body[1].deviceId

      await request(httpServer)
        .delete(`/security/devices/${secondDeviceId}`)
        .set('Cookie', `refreshToken=${user2RefreshToken}`)
        .expect(403)
    },
  )

  it(
    'POST -> "/auth/refresh-token": should return new "refresh" and "access" tokens; status 200; ' +
      'content: new JWT "access" token, new JWT "refresh" token in cookie (http only, secure)',
    async () => {
      const response = await request(httpServer)
        .post('/auth/refresh-token')
        .set('Cookie', `refreshToken=${userLogins[0].refreshToken}`)

      const refreshToken = getRefreshToken(response.get('Set-Cookie'))
      userLogins[0].refreshToken = refreshToken

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('accessToken')
      expect(refreshToken).toBeTruthy()
      expect(refreshToken.includes('HttpOnly')).toBeTruthy()
      expect(refreshToken.includes('Secure')).toBeTruthy()
    },
  )

  it(
    'GET -> "/security/devices": should not change device id after call /auth/refresh-token. ' +
      'LastActiveDate should be changed; status 200; content: device list',
    async () => {
      const deviceListResBefore = await request(httpServer)
        .get('/security/devices')
        .set('Cookie', `refreshToken=${userLogins[0].refreshToken}`)
        .expect(200)

      const deviceListBefore = deviceListResBefore.body

      await delay(1000)

      const refreshTokenRes = await request(httpServer)
        .post('/auth/refresh-token')
        .set('Cookie', `refreshToken=${userLogins[0].refreshToken}`)
        .expect(200)

      userLogins[0].refreshToken = getRefreshToken(
        refreshTokenRes.get('Set-Cookie'),
      )

      const deviceListResAfter = await request(httpServer)
        .get('/security/devices')
        .set('Cookie', `refreshToken=${userLogins[0].refreshToken}`)
        .expect(200)

      const deviceListAfter = deviceListResAfter.body

      expect(deviceListAfter.length).toBe(deviceListBefore.length)
      expect(deviceListAfter[0].deviceId).toEqual(deviceListBefore[0].deviceId)
      expect(deviceListAfter[0].lastActiveDate).not.toEqual(
        deviceListBefore[0].lastActiveDate,
      )
    },
  )

  it(
    'DELETE -> "/security/devices/deviceId": should delete device ' +
      'from device list by deviceId; status 204; used additional methods: GET => /security/devices',
    async () => {
      const deviceListResBefore = await request(httpServer)
        .get('/security/devices')
        .set('Cookie', `refreshToken=${userLogins[0].refreshToken}`)
        .expect(200)

      const deviceListBefore = deviceListResBefore.body

      await request(httpServer)
        .delete(`/security/devices/${deviceListBefore[0].deviceId}`)
        .set('Cookie', `refreshToken=${userLogins[0].refreshToken}`)
        .expect(204)

      const deviceListResAfter = await request(httpServer)
        .get('/security/devices')
        .set('Cookie', `refreshToken=${userLogins[0].refreshToken}`)
        .expect(200)

      const deviceListAfter = deviceListResAfter.body

      expect(deviceListAfter.length).toBe(deviceListBefore.length - 1)
    },
  )

  it(
    'DELETE -> "/security/devices": should delete all other ' +
      'devices from device list; status 204; used additional methods: GET => /security/devices',
    async () => {
      await request(httpServer)
        .get('/security/devices')
        .set('Cookie', `refreshToken=${userLogins[1].refreshToken}`)
        .expect(200)

      await request(httpServer)
        .delete(`/security/devices`)
        .set('Cookie', `refreshToken=${userLogins[1].refreshToken}`)
        .expect(204)

      const deviceListResAfter = await request(httpServer)
        .get('/security/devices')
        .set('Cookie', `refreshToken=${userLogins[1].refreshToken}`)
        .expect(200)

      const deviceListAfter = deviceListResAfter.body

      expect(deviceListAfter.length).toBe(1)
    },
  )

  it('DELETE -> "/testing/all-data": should remove all data; status 204', async () => {
    await request(httpServer).delete('/testing/all-data').expect(204)
  })

  it(
    'POST -> "/auth/registration": should return status code 429 if more than 5 requests were sent ' +
      'within 10 seconds, and 204 after waiting; status 429, 204',
    async () => {
      // Send more than 5 requests within 10 seconds
      for (let i = 0; i < 6; i++) {
        const res = await request(httpServer)
          .post('/auth/registration')
          .send(USER_DATA)

        if (i === 5) {
          expect(res.status).toBe(429)
        }
      }

      // Wait for 10 seconds
      await delay(14000)

      // Send another request
      const newUserData = {
        login: 'testuser2',
        password: 'testpassword2',
        email: 'testuser2@mail.ru',
      }

      await request(httpServer)
        .post('/auth/registration')
        .send(newUserData)
        .expect(204)
    },
  )

  it(
    'POST -> "/auth/login": for a non-existent user, it should return status code 429 if more than ' +
      '5 requests were sent within 10 seconds, and 401 after waiting; status 429, 401',
    async () => {
      // Send more than 5 requests within 10 seconds
      for (let i = 0; i < 6; i++) {
        const res = await request(httpServer).post('/auth/login').send({
          loginOrEmail: USER_DATA.login,
          password: USER_DATA.password,
        })

        if (i === 5) {
          expect(res.status).toBe(429)
        }
      }

      // Wait for 10 seconds
      await delay(10000)

      // Send another request
      await request(httpServer)
        .post('/auth/login')
        .send({
          loginOrEmail: `${USER_DATA.login}a`,
          password: USER_DATA.password,
        })
        .expect(401)
    },
  )
})
