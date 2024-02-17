import { createTransport } from 'nodemailer'
import Mail from 'nodemailer/lib/mailer'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

@Injectable()
class AdapterEmail {
  private readonly _email: Mail
  private readonly _email_user: string

  constructor(private readonly configService: ConfigService) {
    const service = this.configService.get('EMAIL_SERVICE')
    this._email_user = this.configService.get('EMAIL_USER')
    const pass = this.configService.get('EMAIL_PASSWORD')

    this._email = createTransport({
      service,
      auth: {
        user: this._email_user,
        pass,
      },
    })
  }

  public async sendConfirmationCode(dto: {
    email: string
    subject: string
    html: string
  }) {
    const { email, subject, html } = dto

    const mailOptions = {
      // Sender address
      from: `"It_Incubator 👻" <${this._email_user}>`,
      // list of receivers
      to: email,
      // Subject line
      subject,
      // Html body
      html,
    }

    return await this._email.sendMail(mailOptions)
  }
}

export { AdapterEmail }
