import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import type { RegisterInput } from '../../../shared/schemas/auth.schema';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
  ) { }

  async register(dto: RegisterInput) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new BadRequestException('El email ya está registrado'); //BadRequestException es un error HTTP 400
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        name: dto.name,
        surname: dto.surname,
      },
      select: { id: true, email: true },
    });

    const token = await this.jwtService.signAsync(
      { sub: user.id, type: 'email-verification' }, //el type se usa para diferenciar el token de verificación de email de otros posibles tokens que se puedan generar
      { expiresIn: '1h' },
    );
    await this.mailService.sendVerificationEmail(user.email, token);

    return {
      message: 'Usuario registrado. Revisá tu email para confirmar la cuenta.',
    };
  }

  async confirmEmail(token: string) {
    let payload: { sub: number; type: string };
    try {
      payload = await this.jwtService.verifyAsync<{
        sub: number;
        type: string;
      }>(token);
    } catch {
      throw new BadRequestException(
        'El token de confirmación es inválido o venció',
      );
    }

    if (payload.type !== 'email-verification') {
      throw new BadRequestException(
        'El token de confirmación es inválido o venció',
      );
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user) {
      throw new NotFoundException(
        'Usuario no encontrado. El token de confirmación es inválido o venció',
      );
    }

    if (!user.emailVerified) {
      await this.prisma.user.update({
        where: { id: user.id },
        data: { emailVerified: true },
      });
    }

    return { message: 'Cuenta confirmada' };
  }
}
