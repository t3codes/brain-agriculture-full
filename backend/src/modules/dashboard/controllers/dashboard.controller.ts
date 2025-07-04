  import { Controller, Get, UseGuards } from '@nestjs/common';
  import { OverviewResponseDto } from '../dto/overview-response.dto';
import { DashboardService } from '../services/dashboard.service';
import { GetDashboardOverviewSwagger } from '../sagger/dashboard.swagger';
import { ApiBearerAuth } from '@nestjs/swagger/dist';
import { AuthGuard } from '@nestjs/passport';

  @Controller('dashboard')
  export class DashboardController {
    constructor(private readonly dashboardService: DashboardService) {}
    
    @Get('overview')
    @ApiBearerAuth()
    @UseGuards(AuthGuard('jwt'))
    @GetDashboardOverviewSwagger()
    async getOverview(): Promise<OverviewResponseDto> {
      return this.dashboardService.getOverview();
    }
  }
 