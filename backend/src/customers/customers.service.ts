import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common'
import { randomUUID } from 'crypto'
import { SqlService } from '../sql/sql.service'
import { type AddCustomerInput } from '../../../shared/schemas/customer.schema'

type CustomerRow = { id: string; name: string; surname: string; phone: string }

@Injectable()
export class CustomersService {
  constructor(private readonly sql: SqlService) {}

  async getCustomers() {
    const { rows } = await this.sql.query<CustomerRow & { saleCount: number }>(
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
    const { rows: existing } = await this.sql.query<Pick<CustomerRow, 'id'>>(
      'SELECT id FROM "Customer" WHERE phone = $1',
      [dto.phone],
    )

    if (existing.length > 0) {
      throw new BadRequestException('Ya existe un cliente con este teléfono.')
    }

    const { rows } = await this.sql.query<CustomerRow>(
      'INSERT INTO "Customer" (id, name, surname, phone) VALUES ($1, $2, $3, $4) RETURNING id, name, surname, phone',
      [randomUUID(), dto.name, dto.surname, dto.phone],
    )

    return rows[0]
  }

  async deleteCustomer(id: string) {
    const { rows } = await this.sql.query<CustomerRow>(
      'DELETE FROM "Customer" WHERE id = $1 RETURNING id, name, surname, phone',
      [id],
    )

    if (!rows[0]) {
      throw new NotFoundException('Cliente no encontrado.')
    }

    return rows[0]
  }
}
