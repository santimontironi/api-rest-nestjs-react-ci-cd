import { Injectable, BadRequestException } from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'
import { type AddCustomerInput } from '../../../shared/schemas/customer.schema'

@Injectable()
export class CustomersService {
  constructor(private readonly prisma: PrismaService) {}

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
}
