interface IEmailConfirmation {
  userId: string
  code: string
  expiresIn: Date
  isConfirmed: boolean
}

interface IPasswordRecoveryConfirmation extends IEmailConfirmation {}

export { IEmailConfirmation, IPasswordRecoveryConfirmation }
