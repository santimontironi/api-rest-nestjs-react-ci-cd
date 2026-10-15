import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common'
import { randomUUID } from 'crypto'
import { SqlService } from '../sql/sql.service'
import { type AddCustomerInput, type EditCustomerInput } from '../../../shared/schemas/customer.schema'

type CustomerRow = { id: string; name: string; surname: string; phone: string }

@Injectable()
export class CustomersService {
  constructor(private readonly sql: SqlService) {}

  async getCustomers() {
    const { rows } = await this.sql.pool.query<CustomerRow & { saleCount: number }>(
      `SELECT c.id, c.name, c.surname, c.phone, COUNT(s.id)::int AS "saleCount"
       FROM "Customer" c
       LEFT JOIN "Sale" s ON s."customerId" = c.id
       GROUP BY c.id`,
    )

    return rows.map(({ saleCount, ...customer }) => ({
      ...customer,
      _count: { sales: saleCount },
    }))
  }

  async addCustomer(dto: AddCustomerInput) {
    const { rows: existing } = await this.sql.pool.query<Pick<CustomerRow, 'id'>>(
      'SELECT id FROM "Customer" WHERE phone = $1',
      [dto.phone],
    )

    if (existing.length > 0) {
      throw new BadRequestException('Ya existe un cliente con este teléfono.')
    }

    const { rows } = await this.sql.pool.query<CustomerRow>(
      'INSERT INTO "Customer" (id, name, surname, phone) VALUES ($1, $2, $3, $4) RETURNING id, name, surname, phone',
      [randomUUID(), dto.name, dto.surname, dto.phone],
    )

    return rows[0]
  }

  async editCustomer(id: string, dto: EditCustomerInput) {
    const { rows: existing } = await this.sql.pool.query<Pick<CustomerRow, 'id'>>(
      'SELECT id FROM "Customer" WHERE phone = $1 AND id <> $2',
      [dto.phone, id],
    )

    if (existing.length > 0) {
      throw new BadRequestException('Ya existe un cliente con este teléfono.')
    }

    const { rows } = await this.sql.pool.query<CustomerRow>(
      'UPDATE "Customer" SET phone = $1 WHERE id = $2 RETURNING id, name, surname, phone',
      [dto.phone, id],
    )

    if (!rows[0]) {
      throw new NotFoundException('Cliente no encontrado.')
    }

    return rows[0]
  }

  async deleteCustomer(id: string) {
    const { rows } = await this.sql.pool.query<CustomerRow>(
      'DELETE FROM "Customer" WHERE id = $1 RETURNING id, name, surname, phone',
      [id],
    )

    if (!rows[0]) {
      throw new NotFoundException('Cliente no encontrado.')
    }

    return rows[0]
  }
}
