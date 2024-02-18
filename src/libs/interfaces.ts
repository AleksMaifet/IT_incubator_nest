interface IErrorMessage {
  message: string
  field: string
}

interface IErrorResponse {
  errorsMessages: IErrorMessage[]
}

interface IJwtUser {
  userId: string
  login?: string
  email?: string
  deviceId?: string
}

export { IErrorResponse, IJwtUser }
