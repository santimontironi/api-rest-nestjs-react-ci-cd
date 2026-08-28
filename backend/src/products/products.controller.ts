import { Controller, UseGuards, Get, Post, Delete, Param, Body, UseInterceptors, UploadedFile, ParseFilePipeBuilder, HttpStatus } from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { memoryStorage } from 'multer'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { ProductsService } from './products.service'
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe'
import { addProductSchema, type addProductType } from '../../../shared/schemas/product.schema'
import { UPLOAD_ALLOWED_IMAGE_TYPES, UPLOAD_MAX_IMAGE_SIZE } from '../utils/consts/upload.consts'

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async getProducts() {
    return this.productsService.getProducts()
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getProductById(@Param('id') id: string) {
    return this.productsService.getProductById(id)
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('image', { storage: memoryStorage() }))
  async addProduct(
    @Body(new ZodValidationPipe(addProductSchema)) dto: addProductType,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({ fileType: UPLOAD_ALLOWED_IMAGE_TYPES })
        .addMaxSizeValidator({ maxSize: UPLOAD_MAX_IMAGE_SIZE })
        .build({ errorHttpStatusCode: HttpStatus.BAD_REQUEST, fileIsRequired: false }),
    )
    image: Express.Multer.File,
  ) {
    return this.productsService.addProduct(dto, image)
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async deleteProduct(@Param('id') id: string) {
    return this.productsService.deleteProduct(id)
  }
}
