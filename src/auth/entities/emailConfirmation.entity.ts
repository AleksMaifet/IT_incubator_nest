import { add } from 'date-fns/add'
import { v4 as uuidv4 } from 'uuid'
import { DEFAULTS } from '../constants'
import { IEmailConfirmation } from '../interfaces'

class EmailConfirmation implements IEmailConfirmation {
  public readonly code: string
  public readonly expiresIn: Date
  public readonly isConfirmed: boolean

  constructor(public readonly userId: string) {
    this.code = uuidv4()
    this.expiresIn = add(new Date(), {
      minutes: DEFAULTS.EMAIL_CONFIRMATION_EXPIRES,
    })
    this.isConfirmed = false
  }
}

export { EmailConfirmation }
