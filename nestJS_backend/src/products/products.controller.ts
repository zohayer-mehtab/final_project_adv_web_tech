import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Role } from 'src/role.enum';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';

@Controller()
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}
  
  @Get('products')
  findAllPublic() {
    return this.productsService.findAllPublic();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.VENDOR)
  @Post('products')
  create(@Body() createProductDto: CreateProductDto, @Request() req) {
    return this.productsService.create(createProductDto, req.user.userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Patch('admin/products/:id/approve')
  approveProduct(@Param('id') id: string) {
    return this.productsService.approveProduct(+id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Patch('admin/products/:id/reject')
  rejectProduct(@Param('id') id: string) {
    return this.productsService.rejectProduct(+id);
  }

  

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.VENDOR)
  @Get('products/my-products')
  findVendorProducts(@Request() req) {
    return this.productsService.findVendorProducts(req.user.userId);
  }

  @Get('products/:id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(+id);
  }
}
