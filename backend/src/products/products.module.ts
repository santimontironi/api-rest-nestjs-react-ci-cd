import { Module } from '@nestjs/common'
import { ProductsController } from './products.controller'
import { ProductsService } from './products.service'
import { AuthModule } from '../auth/auth.module'
import { CloudinaryModule } from '../cloudinary/cloudinary.module'

@Module({
  imports: [AuthModule, CloudinaryModule],
  controllers: [ProductsController],
  providers: [ProductsService],
})
export class ProductsModule {}
