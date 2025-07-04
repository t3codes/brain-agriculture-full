import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  Request,
  UseGuards,
  BadRequestException,
  ForbiddenException,
  Query,
} from '@nestjs/common';
import { FarmsService } from '../services/farms.service';
import { CreateFarmDto } from '../dto/create-farm.dto';
import { UpdateFarmDto } from '../dto/update-farm.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { CreateFarmSwagger, FindAllFarmsSwagger, FindOneFarmSwagger, DeleteFarmSwagger, UpdateFarmSwagger } from '../swagger/farms.swagger';

@ApiTags('farms')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('farms')
export class FarmsController {
  constructor(private readonly farmsService: FarmsService) { }

  @Post('create')
  @CreateFarmSwagger()
  async create(@Body() createDto: CreateFarmDto) {
    return this.farmsService.create(createDto);
  }

  @Get()
  @FindAllFarmsSwagger()
  async findAll(
    @Request() req,
    @Query('producerId') producerId: number,
    @Query('page') page?: string,
  ) {
    const userId = req.user.userId;
    return this.farmsService.findAll(
      producerId,
      page ? Number(page) : 1,
    );
  }



  @Get(':id')
  @FindOneFarmSwagger()
  async findOne(@Param('id') id: string, @Request() req) {
    if (!req.user.userId) {
      throw new ForbiddenException('Usuário não autenticado');
    }
    const userId = req.user.userId;
    const result = await this.farmsService.findOne(+id, userId);
    return result;
  }


  @Put('update/:id')
  @UpdateFarmSwagger()
  async update(
    @Param('id') id: string,
    @Body() updateFarmDto: UpdateFarmDto,
    @Request() req,
  ) {
    if (!req.user.userId) {
      throw new ForbiddenException('Usuário não autenticado');
    }

    const userId = req.user.userId;
    if (!userId) {
      throw new ForbiddenException('ID do usuário não encontrado no token');
    }

    return this.farmsService.update(+id, updateFarmDto, userId);
  }

  @Delete('delete/:id')
  @DeleteFarmSwagger()
  async remove(@Param('id') id: string, @Request() req) {
    if (!req.user.userId) {
      throw new ForbiddenException('Usuário não autenticado');
    }

    const userId = req.user.userId;
    if (!userId) {
      throw new ForbiddenException('ID do usuário não encontrado no token');
    }

    this.farmsService.remove(+id, userId);
    return {message: "Fazenda removida com sucesso"}
  }
}
