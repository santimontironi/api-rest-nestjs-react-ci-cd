import { Module } from '@nestjs/common'
import { CategoriesController } from './categories.controller'
import { CategoriesService } from './categories.service'
import { AuthModule } from 'src/auth/auth.module'
import { CloudinaryModule } from '../cloudinary/cloudinary.module'

@Module({
  controllers: [CategoriesController],
  providers: [CategoriesService],
  imports: [AuthModule, CloudinaryModule],
})
export class CategoriesModule {}
