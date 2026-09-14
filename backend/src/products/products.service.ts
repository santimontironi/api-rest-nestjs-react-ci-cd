import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CloudinaryService } from '../cloudinary/cloudinary.service'
import type { addProductType, editProductInput } from '../../../shared/schemas/product.schema'

@Injectable()
export class ProductsService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async getProducts() {
    return this.prismaService.product.findMany({
      include: { category: true },
      orderBy: { createdAt: 'desc' },
    })
  }

  async addProduct(dto: addProductType, image?: Express.Multer.File) {
    let uploadedImage: { url: string; publicId: string } | undefined

    if (image) {
      uploadedImage = await this.cloudinaryService.uploadImage(image.buffer)
    }

    return this.prismaService.product.create({
      data: {
        ...dto,
        ...(uploadedImage && { image: uploadedImage.url, imagePublicId: uploadedImage.publicId }),
      },
      include: { category: true },
    })
  }

  async getProductById(id: string) {
    const product = await this.prismaService.product.findUnique({
      where: { id },
      include: { category: true },
    })

    if (!product) {
      throw new NotFoundException('Producto no encontrado.')
    }

    return product
  }

  async editProduct(id: string, dto: editProductInput, image?: Express.Multer.File) {
    const product = await this.prismaService.product.findUnique({ where: { id } })

    if (!product) {
      throw new NotFoundException('Producto no encontrado.')
    }

    let uploadedImage: { url: string; publicId: string } | undefined

    if (image) {
      uploadedImage = await this.cloudinaryService.uploadImage(image.buffer)
    }

    const updatedProduct = await this.prismaService.product.update({
      where: { id },
      data: {
        ...dto,
        ...(uploadedImage && { image: uploadedImage.url, imagePublicId: uploadedImage.publicId }),
      },
      include: { category: true },
    })

    if (uploadedImage && product.imagePublicId) {
      await this.cloudinaryService.deleteImage(product.imagePublicId)
    }

    return updatedProduct
  }

  async deleteProduct(id: string) {
    const product = await this.prismaService.product.findUnique({ where: { id } })

    if (!product) {
      throw new NotFoundException('Producto no encontrado.')
    }

    const deletedProduct = await this.prismaService.product.delete({ where: { id }, include: { category: true } })

    if (product.imagePublicId) {
      await this.cloudinaryService.deleteImage(product.imagePublicId)
    }

    return deletedProduct
  }
}
