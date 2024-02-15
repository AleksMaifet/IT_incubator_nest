interface IErrorMessage {
  message: string
  field: string
}

interface IErrorResponse {
  errorsMessages: IErrorMessage[]
}

export { IErrorResponse }
