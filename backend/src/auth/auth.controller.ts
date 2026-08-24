import { Body, Controller, Get, Param, Post, Req, Res, UseGuards } from '@nestjs/common'
import { Throttle } from '@nestjs/throttler'
import type { Request, Response } from 'express'
import { AuthService } from './auth.service'
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe'
import { JwtAuthGuard } from './guards/jwt-auth.guard'
import { forgotPasswordSchema, loginSchema, registerSchema, resetPasswordSchema } from '../../../shared/schemas/auth.schema'
import type { ForgotPasswordInput, LoginInput, RegisterInput, ResetPasswordInput } from '../../../shared/schemas/auth.schema'
import { THROTTLE_AUTH_LIMIT, THROTTLE_AUTH_TTL } from '../utils/consts/auth.consts'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @Throttle({ default: { limit: THROTTLE_AUTH_LIMIT, ttl: THROTTLE_AUTH_TTL } })
  register(@Body(new ZodValidationPipe(registerSchema)) dto: RegisterInput) {
    return this.authService.register(dto)
  }

  @Post('login')
  @Throttle({ default: { limit: THROTTLE_AUTH_LIMIT, ttl: THROTTLE_AUTH_TTL } })
  async login(@Body(new ZodValidationPipe(loginSchema)) dto: LoginInput, @Res({ passthrough: true }) res: Response) {
    //@Res({ passthrough: true }) permite que NestJS maneje la respuesta automáticamente, pero aún así nos da acceso al objeto de respuesta para establecer cookies o encabezados personalizados.
    const { token, user } = await this.authService.login(dto)

    res.cookie('session_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 24 * 60 * 60 * 1000,
    })

    return user
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('session_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    })
  }

  @Post('forgot-password')
  @Throttle({ default: { limit: THROTTLE_AUTH_LIMIT, ttl: THROTTLE_AUTH_TTL } })
  forgotPassword(@Body(new ZodValidationPipe(forgotPasswordSchema)) dto: ForgotPasswordInput) {
    return this.authService.forgotPassword(dto)
  }

  @Post('reset-password/:token')
  resetPassword(@Param('token') token: string, @Body(new ZodValidationPipe(resetPasswordSchema)) dto: ResetPasswordInput) {
    return this.authService.resetPassword(token, dto)
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@Req() req: Request & { userId: string }) {
    return this.authService.me(req.userId)
  }
}
