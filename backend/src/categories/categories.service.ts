import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'
import { CloudinaryService } from '../cloudinary/cloudinary.service'
import type { AddCategoryInput } from '../../../shared/schemas/category.schema'

@Injectable()
export class CategoriesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinaryService: CloudinaryService,
  ) { }

  async getCategories() {
    return this.prisma.category.findMany({
      include: { _count: { select: { products: true } } },
    })
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

  async deleteCategory(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: { products: true },
    })

    if (!category) {
      throw new NotFoundException('Categoría no encontrada.')
    }

    const [, deletedCategory] = await this.prisma.$transaction([this.prisma.product.deleteMany({ where: { categoryId: id } }), this.prisma.category.delete({ where: { id } })])

    for (const product of category.products) {
      if (product.imagePublicId) {
        await this.cloudinaryService.deleteImage(product.imagePublicId)
      }
    }

    return deletedCategory
  }
}
