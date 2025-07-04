import { IsOptional, IsPositive, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class PaginationDto {
  @IsOptional()
  @IsPositive({ message: 'A página deve ser um número positivo' })
  @IsInt({ message: 'A página deve ser um número inteiro' })
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @IsPositive({ message: 'O limite deve ser um número positivo' })
  @IsInt({ message: 'O limite deve ser um número inteiro' })
  @Type(() => Number)
  limit?: number = 10;
}