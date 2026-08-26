import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CloudinaryService } from '../cloudinary/cloudinary.service'
import type { addProductType } from '../../../shared/schemas/product.schema'

@Injectable()
export class ProductsService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly cloudinaryService: CloudinaryService,
  ) { }

  async getProducts() {
    const products = await this.prismaService.product.findMany({ include: { category: true } })

    if (products.length == 0) {
      throw new NotFoundException('No hay productos agregados.')
    }

    return products
  }

  async addProduct(dto: addProductType, image?: Express.Multer.File) {
    let imageUrl: string | undefined

    if (image) {
      imageUrl = await this.cloudinaryService.uploadImage(image.buffer)
    }

    return this.prismaService.product.create({
      data: {
        ...dto,
        ...(imageUrl && { image: imageUrl }),
      },
    })
  }
}
