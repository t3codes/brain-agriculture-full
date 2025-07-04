import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateProducerDto } from '../dto/create-producer.dto';
import { UpdateProducerDto } from '../dto/update-producer.dto';

@Injectable()
export class ProducersService {
  constructor(private readonly prisma: PrismaService) { }

  private async validateCpfCnpj(
    cpfOrCnpj: string,
    userId: number,
    ignoreId?: number,
  ): Promise<void> {
    const existing = await this.prisma.producer.findFirst({
      where: {
        cpfOrCnpj,
        userId,
        NOT: ignoreId ? { id: ignoreId } : undefined,
      },
    });

    if (existing) {
      throw new ConflictException('CPF/CNPJ já está em uso, tente outro ou chama o suporte');
    }
  }

  async create(createDto: CreateProducerDto, userId: number) {
    await this.validateCpfCnpj(createDto.cpfOrCnpj, userId);

    try {
      return await this.prisma.producer.create({
        data: {
          ...createDto,
          userId,
        },
        
      });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('CPF/CNPJ já está em uso');
      }
      throw error;
    }
  }

  async findAll(userId: number, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [producers, total] = await Promise.all([
      this.prisma.producer.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      this.prisma.producer.count({ where: { userId } })
    ]);

    return {
      producers,
      page,
      limit,
      total,
      lastPage: Math.ceil(total / limit)
    };
  }

  async findOne(id: number, userId: number) {
    const producer = await this.prisma.producer.findUnique({
      where: { id },
      include: { farms: true },
    });

    if (!producer || producer.userId !== userId) {
      return null;
    }

    return producer;
  }

  async findByUserId(userId: number) {
    return this.prisma.producer.findFirst({
      where: { userId },
      include: { farms: true },
    });
  }

  async updateByUserId(userId: number, updateDto: UpdateProducerDto) {
    const producer = await this.findByUserId(userId);
    if (!producer) {
      throw new NotFoundException('Produtor não encontrado');
    }

    return this.update(producer.id, updateDto, userId);
  }



  async update(id: number, updateDto: UpdateProducerDto, userId: number) {
    const producer = await this.findOne(id, userId);
    if (!producer) {
      throw new ForbiddenException('Acesso negado');
    }

    if (
      updateDto.cpfOrCnpj &&
      updateDto.cpfOrCnpj !== producer.cpfOrCnpj
    ) {
      await this.validateCpfCnpj(updateDto.cpfOrCnpj, userId, id);
    }

    try {
      return await this.prisma.producer.update({
        where: { id },
        data: updateDto,
        include: {
          farms: true,
          user: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('CPF/CNPJ já está em uso, tente outro ou chama o suporte');
      }
      throw error;
    }
  }

  async remove(id: number) {
    const producer = await this.prisma.producer.findUnique({
      where: { id },
    });

    if (!producer) {
      throw new NotFoundException('Produtor não encontrado');
    }

    const hasFarms = await this.prisma.farm.count({
      where: { producerId: id },
    });

    await this.prisma.producer.delete({ where: { id } });

    return {
      success: true,
      message: 'Produtor removido com sucesso',
      deletedProducer: {
        id: producer.id,
        name: producer.name,
      },
    };
  }
}
