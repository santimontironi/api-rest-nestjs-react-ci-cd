import { Controller, Get, Post, UseGuards, Body } from '@nestjs/common'
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { CategoriesService } from './categories.service'
import { addCategorySchema, type AddCategoryInput } from '../../../shared/schemas/category.schema'

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async getCategories() {
    return this.categoriesService.getCategories()
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async addCategory(@Body(new ZodValidationPipe(addCategorySchema)) dto: AddCategoryInput) {
    return await this.categoriesService.newCategory(dto)
  }
}
