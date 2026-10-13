import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common'
import { randomUUID } from 'crypto'
import { SqlService } from '../sql/sql.service'
import { CloudinaryService } from '../cloudinary/cloudinary.service'
import type { AddCategoryInput } from '../../../shared/schemas/category.schema'
import type { Product } from '../../../shared/schemas/product.schema'

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
  stockLevel: Product['stockLevel']
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
    const { rows } = await this.sql.pool.query<CategoryRow & { productCount: number }>(
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
    const { rows: categoryRows } = await this.sql.pool.query<CategoryRow>(
      'SELECT id, name, "createdAt" FROM "Category" WHERE id = $1',
      [id],
    )
    const category = categoryRows[0]

    if (!category) {
      throw new NotFoundException('Categoría no encontrada.')
    }

    const { rows: products } = await this.sql.pool.query<ProductRow>(
      `SELECT id, image, "imagePublicId", name, description, stock, price, "categoryId", "stockLevel", "createdAt", "updatedAt"
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
    const { rows: existing } = await this.sql.pool.query<Pick<CategoryRow, 'id'>>(
      'SELECT id FROM "Category" WHERE name = $1',
      [dto.name],
    )

    if (existing.length > 0) {
      throw new BadRequestException('Esta categoría ya existe.')
    }

    const { rows } = await this.sql.pool.query<CategoryRow>(
      'INSERT INTO "Category" (id, name) VALUES ($1, $2) RETURNING id, name, "createdAt"',
      [randomUUID(), dto.name],
    )

    return rows[0]
  }

  async deleteCategory(id: string) {
    const { rows: products } = await this.sql.pool.query<Pick<ProductRow, 'imagePublicId'>>(
      'SELECT "imagePublicId" FROM "Product" WHERE "categoryId" = $1',
      [id],
    )

    const client = await this.sql.pool.connect()
    let deletedCategory: CategoryRow

    try {
      await client.query('BEGIN')
      await client.query('DELETE FROM "Product" WHERE "categoryId" = $1', [id])
      const { rows } = await client.query<CategoryRow>(
        'DELETE FROM "Category" WHERE id = $1 RETURNING id, name, "createdAt"',
        [id],
      )

      if (!rows[0]) {
        throw new NotFoundException('Categoría no encontrada.')
      }

      deletedCategory = rows[0]
      await client.query('COMMIT')
    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    } finally {
      client.release()
    }

    for (const product of products) {
      if (product.imagePublicId) {
        await this.cloudinaryService.deleteImage(product.imagePublicId)
      }
    }

    return deletedCategory
  }
}
