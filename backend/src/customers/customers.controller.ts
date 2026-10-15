import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe'
import { CustomersService } from './customers.service'
import {
  type AddCustomerInput,
  type EditCustomerInput,
  addCustomerSchema,
  editCustomerSchema,
} from '../../../shared/schemas/customer.schema'

@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async getCustomers() {
    return this.customersService.getCustomers()
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async addCustomer(@Body(new ZodValidationPipe(addCustomerSchema)) dto: AddCustomerInput) {
    return await this.customersService.addCustomer(dto)
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async editCustomer(@Param('id') id: string, @Body(new ZodValidationPipe(editCustomerSchema)) dto: EditCustomerInput) {
    return await this.customersService.editCustomer(id, dto)
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async deleteCustomer(@Param('id') id: string) {
    return this.customersService.deleteCustomer(id)
  }
}
