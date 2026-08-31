import { Module } from '@nestjs/common'
import { APP_GUARD } from '@nestjs/core' // token para registrar un guard global
import { ConfigModule } from '@nestjs/config'
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler' // rate limiting
import { AuthModule } from './auth/auth.module'
import { ProductsModule } from './products/products.module'
import { MailModule } from './mail/mail.module'
import { PrismaModule } from './prisma/prisma.module'
import { THROTTLE_GLOBAL_LIMIT, THROTTLE_GLOBAL_TTL } from './utils/consts/rateLimit-consts'
import { CategoriesModule } from './categories/categories.module'
import { CustomersModule } from './customers/customers.module'
import { SalesModule } from './sales/sales.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: THROTTLE_GLOBAL_TTL, limit: THROTTLE_GLOBAL_LIMIT }]), // límite global
    PrismaModule,
    AuthModule,
    ProductsModule,
    MailModule,
    CategoriesModule,
    CustomersModule,
    SalesModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }], // aplica el límite a toda la app. le dice a Nest "usá ThrottlerGuard como guard en cada request de la app"
})
export class AppModule {}
