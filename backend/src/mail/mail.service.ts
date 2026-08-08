import { Injectable } from '@nestjs/common';
import transporter from '../config/mail.config';
import { verificationEmailHtml } from './verification-email.template';

@Injectable()
export class MailService {
  async sendVerificationEmail(to: string, token: string): Promise<void> {
    const link = `${process.env.FRONTEND_URL}/confirmar/${token}`;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: to,
      subject: 'Confirmá tu cuenta',
      html: verificationEmailHtml(link),
    });
  }
}
