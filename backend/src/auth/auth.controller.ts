import { Body, Controller, Get, Post, Param } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import {
  registerSchema,
  type RegisterInput,
} from '../../../shared/schemas/auth.schema';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body(new ZodValidationPipe(registerSchema)) dto: RegisterInput) {
    return this.authService.register(dto);
  }

  @Get('confirm-email/:token')
  confirmEmail(@Param('token') token: string) {
    return this.authService.confirmEmail(token);
  }
}
