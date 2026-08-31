import { Module } from '@nestjs/common';
import { SalesController } from './sales.controller';
import { SalesService } from './sales.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  controllers: [SalesController],
  providers: [SalesService],
  imports: [AuthModule]
})
export class SalesModule { }
