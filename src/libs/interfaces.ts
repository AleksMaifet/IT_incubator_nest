interface IErrorMessage {
  message: string
  field: string
}

interface IErrorResponse {
  errorsMessages: IErrorMessage[]
}

interface IPartialJwtUser {
  login: string
  email: string
  deviceId: string
  iat: number
  exp: number
}

interface IJwtUser extends Partial<IPartialJwtUser> {
  userId: string
}

export { IErrorResponse, IJwtUser }
