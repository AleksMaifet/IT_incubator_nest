import { add } from 'date-fns/add'
import { v4 as uuidv4 } from 'uuid'
import { DEFAULTS } from '../constants'
import { IPasswordRecoveryConfirmation } from '../interfaces'

class PasswordRecoveryConfirmationEntity
  implements IPasswordRecoveryConfirmation
{
  public readonly code: string
  public readonly expiresIn: Date
  public readonly isConfirmed: boolean

  constructor(public readonly userId: string) {
    this.code = uuidv4()
    this.expiresIn = add(new Date(), {
      minutes: DEFAULTS.PASSWORD_RECOVERY_CONFIRMATION_EXPIRES,
    })
    this.isConfirmed = false
  }
}

export { PasswordRecoveryConfirmationEntity }
