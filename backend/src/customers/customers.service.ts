import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'
import { type AddCustomerInput } from '../../../shared/schemas/customer.schema'

@Injectable()
export class CustomersService {
  constructor(private readonly prisma: PrismaService) {}

  async getCustomers() {
    return this.prisma.customer.findMany({
      include: { _count: { select: { sales: true } } },
    })
  }

  async addCustomer(dto: AddCustomerInput) {
    const existingCustomer = await this.prisma.customer.findFirst({
      where: { phone: dto.phone },
    })

    if (existingCustomer) {
      throw new BadRequestException('Ya existe un cliente con este teléfono.')
    }

    return this.prisma.customer.create({
      data: dto,
    })
  }

  async deleteCustomer(id: string) {
    const customer = await this.prisma.customer.findUnique({ where: { id } })

    if (!customer) {
      throw new NotFoundException('Cliente no encontrado.')
    }

    return this.prisma.customer.delete({ where: { id } })
  }
}
