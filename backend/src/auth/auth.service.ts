import { BadRequestException, Injectable, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import type { ForgotPasswordInput, LoginInput, RegisterInput, ResetPasswordInput } from '../../../shared/schemas/auth.schema';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
    private readonly configService: ConfigService,
  ) {}

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

    return {
      message: 'Usuario registrado.',
      user,
    };
  }

  async login(dto: LoginInput) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const passwordMatches = await bcrypt.compare(dto.password, user.password);
    if (!passwordMatches) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const token = await this.jwtService.signAsync({ sub: user.id });

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        surname: user.surname,
      },
    };
  }

  async forgotPassword(dto: ForgotPasswordInput) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const token = await this.jwtService.signAsync({ sub: user.id, type: 'password-reset' }, { expiresIn: '10m' });
    const link = `${this.configService.get<string>('FRONTEND_URL')}/restablecer-contrasena/${token}`;
    await this.mailService.sendForgotPasswordEmail(user.email, link);

    return {
      message: 'Email ingresado correctamente, vas a recibir un link para restablecer tu contraseña.',
    };
  }

  async resetPassword(token: string, dto: ResetPasswordInput) {
    let payload: { sub: string; type: string };
    try {
      payload = await this.jwtService.verifyAsync<{ sub: string; type: string }>(token);
    } catch {
      throw new BadRequestException('Token inválido o vencido');
    }

    if (payload.type !== 'password-reset') {
      throw new BadRequestException('Token inválido o vencido');
    }

    const hashedPassword = await bcrypt.hash(dto.newPassword, 10);

    await this.prisma.user.update({
      where: { id: payload.sub },
      data: { password: hashedPassword },
    });

    return {
      message: 'Contraseña actualizada correctamente.',
    };
  }

  async me(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, surname: true },
    });

    if (!user) {
      throw new UnauthorizedException('No autenticado');
    }

    return user;
  }
}
