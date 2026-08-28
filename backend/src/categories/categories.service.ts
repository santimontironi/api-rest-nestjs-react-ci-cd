import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'
import type { AddCategoryInput } from '../../../shared/schemas/category.schema'

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async getCategories() {
    const categories = await this.prisma.category.findMany({
      include: { _count: { select: { products: true } } },
    })

    if (categories.length == 0) {
      throw new NotFoundException('No hay categorías agregadas.')
    }

    return categories
  }

  async getCategoryById(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: { products: { include: { category: true } } },
    })

    if (!category) {
      throw new NotFoundException('Categoría no encontrada.')
    }

    return category
  }

  async newCategory(dto: AddCategoryInput) {
    const existingCategory = await this.prisma.category.findFirst({
      where: { name: dto.name },
    })

    if (existingCategory) {
      throw new BadRequestException('Esta categoría ya existe.')
    }

    return this.prisma.category.create({
      data: { name: dto.name },
    })
  }
}
