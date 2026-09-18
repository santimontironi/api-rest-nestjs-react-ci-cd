import { BadRequestException, Injectable, UnauthorizedException, NotFoundException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { randomUUID } from 'crypto'
import * as bcrypt from 'bcrypt'
import { SqlService } from '../sql/sql.service'
import { MailService } from '../mail/mail.service'
import type { ForgotPasswordInput, LoginInput, RegisterInput, ResetPasswordInput } from '../../../shared/schemas/auth.schema'

type UserRow = {
  id: string
  email: string
  password: string
  name: string
  surname: string
}

@Injectable()
export class AuthService {
  constructor(
    private readonly sql: SqlService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
    private readonly configService: ConfigService,
  ) {}

  async register(dto: RegisterInput) {
    const { rows: existing } = await this.sql.query<Pick<UserRow, 'id'>>(
      'SELECT id FROM "User" WHERE email = $1',
      [dto.email],
    )

    if (existing.length > 0) {
      throw new BadRequestException('El email ya está registrado')
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10)
    const id = randomUUID()

    const { rows } = await this.sql.query<Pick<UserRow, 'id' | 'email'>>(
      `INSERT INTO "User" (id, email, password, name, surname, "updatedAt")
       VALUES ($1, $2, $3, $4, $5, NOW())
       RETURNING id, email`,
      [id, dto.email, hashedPassword, dto.name, dto.surname],
    )

    return {
      message: 'Usuario registrado.',
      user: rows[0],
    }
  }

  async login(dto: LoginInput) {
    const { rows } = await this.sql.query<UserRow>(
      'SELECT id, email, password, name, surname FROM "User" WHERE email = $1',
      [dto.email],
    )
    const user = rows[0]

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas')
    }

    const passwordMatches = await bcrypt.compare(dto.password, user.password)
    if (!passwordMatches) {
      throw new UnauthorizedException('Credenciales inválidas')
    }

    const token = await this.jwtService.signAsync({ sub: user.id })

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        surname: user.surname,
      },
    }
  }

  async forgotPassword(dto: ForgotPasswordInput) {
    const { rows } = await this.sql.query<Pick<UserRow, 'id' | 'email'>>(
      'SELECT id, email FROM "User" WHERE email = $1',
      [dto.email],
    )
    const user = rows[0]

    if (!user) {
      throw new NotFoundException('Usuario no encontrado')
    }

    const token = await this.jwtService.signAsync({ sub: user.id, type: 'password-reset' }, { expiresIn: '10m' })
    const link = `${this.configService.get<string>('FRONTEND_URL')}/restablecer-contrasena/${token}`
    await this.mailService.sendForgotPasswordEmail(user.email, link)

    return {
      message: 'Email ingresado correctamente, vas a recibir un link para restablecer tu contraseña.',
    }
  }

  async resetPassword(token: string, dto: ResetPasswordInput) {
    let payload: { sub: string; type: string }
    try {
      payload = await this.jwtService.verifyAsync<{ sub: string; type: string }>(token)
    } catch {
      throw new BadRequestException('Token inválido o vencido')
    }

    if (payload.type !== 'password-reset') {
      throw new BadRequestException('Token inválido o vencido')
    }

    const hashedPassword = await bcrypt.hash(dto.newPassword, 10)

    await this.sql.query('UPDATE "User" SET password = $1, "updatedAt" = NOW() WHERE id = $2', [
      hashedPassword,
      payload.sub,
    ])

    return {
      message: 'Contraseña actualizada correctamente.',
    }
  }

  async me(userId: string) {
    const { rows } = await this.sql.query<Pick<UserRow, 'id' | 'email' | 'name' | 'surname'>>(
      'SELECT id, email, name, surname FROM "User" WHERE id = $1',
      [userId],
    )
    const user = rows[0]

    if (!user) {
      throw new UnauthorizedException('No autenticado')
    }

    return user
  }
}
