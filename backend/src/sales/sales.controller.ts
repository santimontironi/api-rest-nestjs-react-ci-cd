import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe'
import { SalesService } from './sales.service'
import {
  type AddSaleInput,
  type SalesFilters,
  addSaleSchema,
  salesFiltersSchema,
} from '../../../shared/schemas/sale.schema'

@Controller('sales')
export class SalesController {
  constructor(private readonly salesService: SalesService) { }

  @Get()
  @UseGuards(JwtAuthGuard)
  async getSales(@Query(new ZodValidationPipe(salesFiltersSchema)) filters: SalesFilters) {
    return await this.salesService.getSales(filters)
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async addSale(@Body(new ZodValidationPipe(addSaleSchema)) dto: AddSaleInput) {
    return await this.salesService.addSale(dto)
  }
}
