import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxChartsModule, LegendPosition } from '@swimlane/ngx-charts';
import { ApiService } from '../../core/api.service';
import { IDashboardState } from './store/dashboard.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, NgxChartsModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss']
})
export class Dashboard implements OnInit {

  // -------------------------------
  // 📊 Estados e propriedades
  // -------------------------------
  isLoading = true;
  errorMessage = '';
  data!: IDashboardState;

  chartByState: any[] = [];
  chartByCrop: any[] = [];
  chartLandUse: any[] = [];

  view: [number, number] = [500, 400];
  legendPosition = LegendPosition.Below;

  // -------------------------------
  // 🧱 Injeção de dependências
  // -------------------------------
  constructor(
    private api: ApiService,
    private router: Router,
    private cdRef: ChangeDetectorRef
  ) {}

  // -------------------------------
  // 🚀 Ciclo de vida (inicialização)
  // -------------------------------
  ngOnInit(): void {
    this.isLoading = true;

    this.api.get<IDashboardState>('dashboard/overview').subscribe({
      next: (res) => {
        this.data = res;

        this.chartByState = res.byState.map((s) => ({
          name: s.state,
          value: s.total,
        }));

        this.chartByCrop = res.byCrop.map((c) => ({
          name: c.name,
          value: c.total,
        }));

        this.chartLandUse = [
          { name: 'Área Agricultável', value: res.landUse.arableArea },
          { name: 'Vegetação', value: res.landUse.vegetationArea },
        ];

        this.isLoading = false;
        this.cdRef.detectChanges();
      },
      error: (err) => {
        this.isLoading = false;
        console.error(err);
      },
    });
  }

  // -------------------------------
  // ✅ Validação de dados carregados
  // -------------------------------
  hasData(): boolean {
    return (
      this.data &&
      (this.chartByState.length > 0 ||
        this.chartByCrop.length > 0 ||
        this.chartLandUse.some((c) => c.value > 0))
    );
  }
}
