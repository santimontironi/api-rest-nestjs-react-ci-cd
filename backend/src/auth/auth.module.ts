import { Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtModule } from '@nestjs/jwt'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { MailModule } from '../mail/mail.module'
import { JwtAuthGuard } from './guards/jwt-auth.guard'

@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1d' },
      }),
    }),
    MailModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtAuthGuard],
  exports: [JwtAuthGuard, JwtModule], //se exporta JwtModule porque JwtAuthGuard lo necesita ya que usa JwtService y este esta dentro de JwtModule
})
export class AuthModule { }
