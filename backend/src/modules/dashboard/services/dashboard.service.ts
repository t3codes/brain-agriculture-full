import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getOverview(): Promise<any> {
    try {
      const [totalFarms, totalHectaresAgg, farms, crops, landUseAgg] = await Promise.all([
        this.prisma.farm.count(),
        this.prisma.farm.aggregate({
          _sum: { totalArea: true },
        }),
        this.prisma.farm.findMany({
          select: { state: true },
        }),
        this.prisma.crop.findMany({
          select: { name: true },
        }),
        this.prisma.farm.aggregate({
          _sum: {
            arableArea: true,
            vegetationArea: true,
          },
        }),
      ]);

      const mappedStates = farms.map(f => f.state);
      const mappedCrops = crops.map(c => c.name);
      const byState = this.countBy(mappedStates).map(([state, total]) => ({ state, total }));
      const byCrop = this.countBy(mappedCrops).map(([name, total]) => ({ name, total }));
      const response = {
        totalFarms,
        totalHectares: totalHectaresAgg._sum.totalArea ?? 0,
        byState,
        byCrop,
        landUse: {
          arableArea: landUseAgg._sum.arableArea ?? 0,
          vegetationArea: landUseAgg._sum.vegetationArea ?? 0,
        },
      };
      return response;
    } catch (error) {
      console.error('===> ERRO dentro de getOverview():', error);
      throw error;
    }
  }

  private countBy(items: string[]): [string, number][] {
    console.log('===> Executando countBy para:', items);

    const counts: Record<string, number> = {};
    for (const item of items) {
      if (!item) continue;
      counts[item] = (counts[item] || 0) + 1;
    }

    console.log('===> Resultado do countBy:', counts);
    return Object.entries(counts);
  }
}
