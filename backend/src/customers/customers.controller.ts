import { Controller, Post, Body, UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe'
import { CustomersService } from './customers.service'
import { type AddCustomerInput, addCustomerSchema } from '../../../shared/schemas/customer.schema'

@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async addCustomer(@Body(new ZodValidationPipe(addCustomerSchema)) dto: AddCustomerInput) {
    return await this.customersService.addCustomer(dto)
  }
}
