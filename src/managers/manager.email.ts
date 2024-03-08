import { Injectable } from '@nestjs/common'
import { AdapterEmail } from '../adapters'
import { CreateUserDto } from '../users'

@Injectable()
class ManagerEmail {
  constructor(private readonly adapterEmail: AdapterEmail) {}

  public async sendUserEmailConfirmationCode(
    dto: Pick<CreateUserDto, 'login' | 'email'> & { code: string },
  ) {
    const { login, email, code } = dto

    const subject = 'Confirm Account'
    const html =
      `<h1>Thanks for your registration ${login}</h1> ` +
      '<div>' +
      '<p>To finish registration please follow the link below: ' +
      `<a href='https://localhost:3000/confirm-email?code=${code}'>complete registration</a>` +
      '</p>' +
      '</div>'

    return await this.adapterEmail.sendConfirmationCode({
      email,
      subject,
      html,
    })
  }

  public async sendUserRegistrationEmailResendingCode(
    dto: Pick<CreateUserDto, 'login' | 'email'> & { code: string },
  ) {
    const { login, email, code } = dto

    const subject = 'Confirm Account'
    const html =
      `<h1>Thanks for your registration ${login}</h1> ` +
      '<div>' +
      '<p>To finish registration please follow the link below: ' +
      `<a href='https://localhost:3000/confirm-registration?code=${code}'>complete registration</a>` +
      '</p>' +
      '</div>'

    return await this.adapterEmail.sendConfirmationCode({
      email,
      subject,
      html,
    })
  }

  public async sendPasswordRecoveryConfirmationCode(
    dto: Pick<CreateUserDto, 'login' | 'email'> & { code: string },
  ) {
    const { login, email, code } = dto

    const subject = 'Confirm Account'
    const html =
      `<h1>Password recovery ${login}</h1> ` +
      '<div>' +
      '<p>To finish password recovery please follow the link below: ' +
      `<a href='https://localhost:3000/password-recovery?recoveryCode=${code}'>recovery password</a>` +
      '</p>' +
      '</div>'

    return await this.adapterEmail.sendConfirmationCode({
      email,
      subject,
      html,
    })
  }
}

export { ManagerEmail }
