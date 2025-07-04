import { ApiProperty } from '@nestjs/swagger';

export class PaginatedResponseDto<T> {
  @ApiProperty({ description: 'Dados da página atual' })
  data: T[];

  @ApiProperty({ example: 1, description: 'Página atual' })
  page: number;

  @ApiProperty({ example: 10, description: 'Itens por página' })
  limit: number;

  @ApiProperty({ example: 100, description: 'Total de itens' })
  total: number;

  @ApiProperty({ example: 10, description: 'Total de páginas' })
  last_page: number;
}