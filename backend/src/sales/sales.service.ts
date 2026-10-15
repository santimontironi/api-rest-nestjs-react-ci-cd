import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { randomUUID } from 'crypto'
import { SqlService } from '../sql/sql.service'
import type { AddSaleInput, Sale, SalesFilters } from '../../../shared/schemas/sale.schema'

type ProductForSaleRow = { id: string; name: string; stock: number; price: number; categoryName: string }
type CustomerRow = { id: string; name: string; surname: string; phone: string }
type SaleRow = Omit<Sale, 'items'>
type SaleItemRow = Sale['items'][number] & { saleId: string }

@Injectable()
export class SalesService {
  constructor(private readonly sql: SqlService) { }

  async getSales(filters: SalesFilters) {
    const { rows: sales } = await this.sql.pool.query<SaleRow>(
      `SELECT id, total, "paymentMethod", "customerId", "customerName", "customerSurname",
              "customerPhone", "createdAt", "updatedAt"
       FROM "Sale"
       WHERE ($1::date IS NULL OR "createdAt" >= $1::date)
         AND ($2::date IS NULL OR "createdAt" < $2::date + 1)
         AND ($3::text IS NULL OR "customerId" = $3)
       ORDER BY "createdAt" DESC`,
      [filters.from ?? null, filters.to ?? null, filters.customerId ?? null],
    )

    const { rows: items } = await this.sql.pool.query<SaleItemRow>(
      `SELECT id, "saleId", "productId", quantity, "unitPrice", "productName", "categoryName"
       FROM "SaleItem"
       WHERE "saleId" = ANY($1)`,
      [sales.map((sale) => sale.id)],
    )

    return sales.map((sale) => ({ ...sale, items: items.filter((item) => item.saleId === sale.id) }))
  }

  async addSale(dto: AddSaleInput) {
    const client = await this.sql.pool.connect()

    try {
      await client.query('BEGIN')
      let customer: CustomerRow | undefined

      if (dto.customerId) {
        const { rows } = await client.query<CustomerRow>(
          'SELECT id, name, surname, phone FROM "Customer" WHERE id = $1',
          [dto.customerId],
        )
        customer = rows[0]

        if (!customer) {
          throw new NotFoundException('Cliente no encontrado.')
        }
      }

      // FOR UPDATE bloquea los productos hasta el COMMIT, así dos ventas simultáneas no pueden
      // validar el mismo stock y dejarlo negativo.
      const { rows: products } = await client.query<ProductForSaleRow>(
        `SELECT p.id, p.name, p.stock, p.price, c.name AS "categoryName"
         FROM "Product" p
         JOIN "Category" c ON c.id = p."categoryId"
         WHERE p.id = ANY($1)
         FOR UPDATE OF p`,
        [dto.items.map((item) => item.productId)],
      )

      const lines = dto.items.map((item) => {
        const product = products.find((p) => p.id === item.productId)

        if (!product) {
          throw new NotFoundException('Producto no encontrado.')
        }

        if (product.stock < item.quantity) {
          throw new BadRequestException(`Stock insuficiente para "${product.name}" (disponible: ${product.stock}).`)
        }

        return { product, quantity: item.quantity }
      })

      const total = lines.reduce((sum, line) => sum + line.product.price * line.quantity, 0)
      const saleId = randomUUID()

      const { rows: saleRows } = await client.query<SaleRow>(
        `INSERT INTO "Sale" (id, total, "paymentMethod", "customerId", "customerName", "customerSurname", "customerPhone", "updatedAt")
         VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
         RETURNING id, total, "paymentMethod", "customerId", "customerName", "customerSurname", "customerPhone", "createdAt", "updatedAt"`,
        [saleId, total, dto.paymentMethod, customer?.id ?? null, customer?.name ?? null, customer?.surname ?? null, customer?.phone ?? null],
      )

      const items: SaleItemRow[] = []

      for (const { product, quantity } of lines) {
        const { rows: itemRows } = await client.query<SaleItemRow>(
          `INSERT INTO "SaleItem" (id, "saleId", "productId", quantity, "unitPrice", "productName", "categoryName")
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           RETURNING id, "saleId", "productId", quantity, "unitPrice", "productName", "categoryName"`,
          [randomUUID(), saleId, product.id, quantity, product.price, product.name, product.categoryName],
        )
        items.push(itemRows[0])

        await client.query('UPDATE "Product" SET stock = stock - $1, "updatedAt" = NOW() WHERE id = $2', [quantity, product.id])
      }

      await client.query('COMMIT')
      return { ...saleRows[0], items }
    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    } finally {
      client.release()
    }
  }
}
