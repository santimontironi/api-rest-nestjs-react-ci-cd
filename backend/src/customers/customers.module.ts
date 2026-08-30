import { Module } from '@nestjs/common'
import { CustomersController } from './customers.controller'
import { CustomersService } from './customers.service'
import { AuthModule } from 'src/auth/auth.module'

@Module({
  controllers: [CustomersController],
  providers: [CustomersService],
  imports: [AuthModule],
})
export class CustomersModule {}
