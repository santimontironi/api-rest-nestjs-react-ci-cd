import { Injectable, NotFoundException } from '@nestjs/common'
import { randomUUID } from 'crypto'
import { SqlService } from '../sql/sql.service'
import { CloudinaryService } from '../cloudinary/cloudinary.service'
import type { addProductType, editProductInput } from '../../../shared/schemas/product.schema'

type ProductRow = {
  id: string
  image: string | null
  imagePublicId: string | null
  name: string
  description: string
  stock: number
  price: number
  categoryId: string
  createdAt: Date
  updatedAt: Date
}
type ProductWithCategoryRow = ProductRow & { categoryName: string; categoryCreatedAt: Date }

const PRODUCT_WITH_CATEGORY_SELECT = `
  SELECT p.id, p.image, p."imagePublicId", p.name, p.description, p.stock, p.price, p."categoryId",
         p."createdAt", p."updatedAt", c.name AS "categoryName", c."createdAt" AS "categoryCreatedAt"
  FROM "Product" p
  JOIN "Category" c ON c.id = p."categoryId"
`

@Injectable()
export class ProductsService {
  constructor(
    private readonly sql: SqlService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  private toProduct({ categoryName, categoryCreatedAt, ...product }: ProductWithCategoryRow) {
    return { ...product, category: { id: product.categoryId, name: categoryName, createdAt: categoryCreatedAt } }
  }

  private async findProductById(id: string) {
    const { rows } = await this.sql.query<ProductWithCategoryRow>(`${PRODUCT_WITH_CATEGORY_SELECT} WHERE p.id = $1`, [id])
    return rows[0] ? this.toProduct(rows[0]) : null
  }

  async getProducts() {
    const { rows } = await this.sql.query<ProductWithCategoryRow>(`${PRODUCT_WITH_CATEGORY_SELECT} ORDER BY p."createdAt" DESC`)
    return rows.map((row) => this.toProduct(row))
  }

  async addProduct(dto: addProductType, image?: Express.Multer.File) {
    let uploadedImage: { url: string; publicId: string } | undefined

    if (image) {
      uploadedImage = await this.cloudinaryService.uploadImage(image.buffer)
    }

    const id = randomUUID()
    await this.sql.query(
      `INSERT INTO "Product" (id, name, description, stock, price, "categoryId", image, "imagePublicId", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())`,
      [id, dto.name, dto.description, dto.stock, dto.price, dto.categoryId, uploadedImage?.url ?? null, uploadedImage?.publicId ?? null],
    )

    return this.findProductById(id)
  }

  async getProductById(id: string) {
    const product = await this.findProductById(id)

    if (!product) {
      throw new NotFoundException('Producto no encontrado.')
    }

    return product
  }

  async editProduct(id: string, dto: editProductInput, image?: Express.Multer.File) {
    const { rows } = await this.sql.query<Pick<ProductRow, 'image' | 'imagePublicId'>>(
      'SELECT image, "imagePublicId" FROM "Product" WHERE id = $1',
      [id],
    )
    const existingProduct = rows[0]

    if (!existingProduct) {
      throw new NotFoundException('Producto no encontrado.')
    }

    let uploadedImage: { url: string; publicId: string } | undefined

    if (image) {
      uploadedImage = await this.cloudinaryService.uploadImage(image.buffer)
    }

    const nextImage = uploadedImage?.url ?? existingProduct.image
    const nextImagePublicId = uploadedImage?.publicId ?? existingProduct.imagePublicId

    await this.sql.query(
      `UPDATE "Product"
       SET name = $1, description = $2, stock = $3, price = $4, "categoryId" = $5, image = $6, "imagePublicId" = $7, "updatedAt" = NOW()
       WHERE id = $8`,
      [dto.name, dto.description, dto.stock, dto.price, dto.categoryId, nextImage, nextImagePublicId, id],
    )

    const updatedProduct = await this.findProductById(id)

    if (uploadedImage && existingProduct.imagePublicId) {
      await this.cloudinaryService.deleteImage(existingProduct.imagePublicId)
    }

    return updatedProduct
  }

  async deleteProduct(id: string) {
    const product = await this.findProductById(id)

    if (!product) {
      throw new NotFoundException('Producto no encontrado.')
    }

    await this.sql.query('DELETE FROM "Product" WHERE id = $1', [id])

    if (product.imagePublicId) {
      await this.cloudinaryService.deleteImage(product.imagePublicId)
    }

    return product
  }
}
