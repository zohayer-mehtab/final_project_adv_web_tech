import {
  IsString,
  IsNotEmpty,
  IsNumber,
  Min,
  IsPositive,
} from 'class-validator';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNumber()
  @IsPositive() // Price must be greater than 0
  price: number;

  @IsNumber()
  @Min(0) // Stock can be 0, but not negative
  stock: number;
}
