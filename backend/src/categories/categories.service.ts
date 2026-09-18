import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common'
import { randomUUID } from 'crypto'
import { SqlService } from '../sql/sql.service'
import { CloudinaryService } from '../cloudinary/cloudinary.service'
import type { AddCategoryInput } from '../../../shared/schemas/category.schema'

type CategoryRow = { id: string; name: string; createdAt: Date }

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

@Injectable()
export class CategoriesService {
  constructor(
    private readonly sql: SqlService,
    private readonly cloudinaryService: CloudinaryService,
  ) { }

  async getCategories() {
    const { rows } = await this.sql.query<CategoryRow & { productCount: number }>(
      `SELECT c.id, c.name, c."createdAt", COUNT(p.id)::int AS "productCount"
       FROM "Category" c
       LEFT JOIN "Product" p ON p."categoryId" = c.id
       GROUP BY c.id`,
    )

    return rows.map(({ productCount, ...category }) => ({
      ...category,
      _count: { products: productCount },
    }))
  }

  async getCategoryById(id: string) {
    const { rows: categoryRows } = await this.sql.query<CategoryRow>(
      'SELECT id, name, "createdAt" FROM "Category" WHERE id = $1',
      [id],
    )
    const category = categoryRows[0]

    if (!category) {
      throw new NotFoundException('Categoría no encontrada.')
    }

    const { rows: products } = await this.sql.query<ProductRow>(
      `SELECT id, image, "imagePublicId", name, description, stock, price, "categoryId", "createdAt", "updatedAt"
       FROM "Product"
       WHERE "categoryId" = $1`,
      [id],
    )

    return {
      ...category,
      products: products.map((product) => ({ ...product, category })),
    }
  }

  async newCategory(dto: AddCategoryInput) {
    const { rows: existing } = await this.sql.query<Pick<CategoryRow, 'id'>>(
      'SELECT id FROM "Category" WHERE name = $1',
      [dto.name],
    )

    if (existing.length > 0) {
      throw new BadRequestException('Esta categoría ya existe.')
    }

    const { rows } = await this.sql.query<CategoryRow>(
      'INSERT INTO "Category" (id, name) VALUES ($1, $2) RETURNING id, name, "createdAt"',
      [randomUUID(), dto.name],
    )

    return rows[0]
  }

  async deleteCategory(id: string) {
    const { rows: products } = await this.sql.query<Pick<ProductRow, 'imagePublicId'>>(
      'SELECT "imagePublicId" FROM "Product" WHERE "categoryId" = $1',
      [id],
    )

    const deletedCategory = await this.sql.transaction(async (query) => {
      await query('DELETE FROM "Product" WHERE "categoryId" = $1', [id])
      const { rows } = await query<CategoryRow>(
        'DELETE FROM "Category" WHERE id = $1 RETURNING id, name, "createdAt"',
        [id],
      )

      if (!rows[0]) {
        throw new NotFoundException('Categoría no encontrada.')
      }

      return rows[0]
    })

    for (const product of products) {
      if (product.imagePublicId) {
        await this.cloudinaryService.deleteImage(product.imagePublicId)
      }
    }

    return deletedCategory
  }
}
