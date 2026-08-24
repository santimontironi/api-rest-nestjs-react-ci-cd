import { Injectable } from '@nestjs/common'
import transporter from '../config/mail.config'
import { forgotPasswordEmailHtml } from './forgot-password-email.template'

@Injectable()
export class MailService {
  async sendForgotPasswordEmail(to: string, link: string) {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject: 'Restablecé tu contraseña',
      html: forgotPasswordEmailHtml(link),
    })
  }
}
