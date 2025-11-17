import {
  Component,
  Input,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  inject,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ModalController,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonContent,
  IonFooter,
  IonIcon,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonList,
  IonItem,
  IonLabel,
  IonBadge,
} from '@ionic/angular/standalone';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { Sqlite } from '@services/database/database.service';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

interface UsageRecord {
  id: number;
  idBattery: number;
  date: string;
  status: number;
  deleted: number;
  enabled: number;
}

@Component({
  selector: 'app-cycles-modal',
  templateUrl: './cycles-modal.html',
  standalone: true,
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonContent,
    IonFooter,
    IonIcon,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonList,
    IonItem,
    IonLabel,
    IonBadge,
    TranslocoModule,
  ],
})
export class CyclesModalComponent implements OnInit, OnDestroy {
  @Input() batteryId = 0;
  @Input() batteryLabel = '';

  @ViewChild('cycleChartCanvas') private cycleChartCanvas!: ElementRef;
  cycleChart: Chart | null = null;

  private sqlite = inject(Sqlite);
  private modalController = inject(ModalController);
  private transloco = inject(TranslocoService);
  private cdr = inject(ChangeDetectorRef);

  protected usageRecords: UsageRecord[] = [];
  protected cycleCount = 0;
  protected totalCharges = 0;
  protected totalDischarges = 0;
  protected firstRecordDate = '';
  protected lastRecordDate = '';

  async ngOnInit() {
    await this.loadData();
  }

  ngOnDestroy(): void {
    if (this.cycleChart) {
      this.cycleChart.destroy();
    }
  }

  private async loadData() {
    try {
      const records = await this.sqlite.getUsageRecords(this.batteryId);
      this.usageRecords = records.sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(), // Sort ascending for chart
      );

      // Calculate analytics
      this.totalCharges = this.usageRecords.filter((r) => r.status === 1).length;
      this.totalDischarges = this.usageRecords.filter((r) => r.status === 3).length;
      this.cycleCount = Math.floor(Math.min(this.totalCharges, this.totalDischarges));

      if (this.usageRecords.length > 0) {
        this.firstRecordDate = new Date(this.usageRecords[0].date).toLocaleDateString();
        this.lastRecordDate = new Date(
          this.usageRecords[this.usageRecords.length - 1].date,
        ).toLocaleDateString();
      }

      this.createCycleChart();

      // Trigger change detection after async data loading
      this.cdr.detectChanges();
    } catch (error) {
      console.error('Error loading cycle data:', error);
    }
  }

  private createCycleChart() {
    if (this.cycleChart) {
      this.cycleChart.destroy();
    }

    const labels = this.usageRecords.map((record) => this.formatDate(record.date));
    const data = this.usageRecords.map((record) => this.getStatusLevel(record.status));

    this.cycleChart = new Chart(this.cycleChartCanvas.nativeElement, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: this.transloco.translate('cycles.chart.title'),
            data: data,
            borderColor: '#4CAF50', // Green for charged
            backgroundColor: 'rgba(76, 175, 80, 0.2)',
            fill: true,
            tension: 0.3,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            type: 'category',
            title: {
              display: true,
              text: this.transloco.translate('cycles.chart.xAxis'),
            },
          },
          y: {
            title: {
              display: true,
              text: this.transloco.translate('cycles.chart.yAxis'),
            },
            min: 0,
            max: 3.5,
            ticks: {
              stepSize: 1,
              callback: (value: number | string) => {
                const numValue = typeof value === 'string' ? parseFloat(value) : value;
                switch (numValue) {
                  case 1:
                    return this.transloco.translate('batteries.status.discharged');
                  case 2:
                    return this.transloco.translate('batteries.status.stored');
                  case 3:
                    return this.transloco.translate('batteries.status.charged');
                  default:
                    return '';
                }
              },
            },
          },
        },
        plugins: {
          tooltip: {
            callbacks: {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              label: (context: any) => {
                const status = context.raw;
                switch (status) {
                  case 1:
                    return this.transloco.translate('batteries.status.discharged');
                  case 2:
                    return this.transloco.translate('batteries.status.stored');
                  case 3:
                    return this.transloco.translate('batteries.status.charged');
                  default:
                    return '';
                }
              },
            },
          },
        },
      },
    });
  }

  protected getStatusText(status: number): string {
    switch (status) {
      case 1:
        return this.transloco.translate('batteries.status.charged');
      case 2:
        return this.transloco.translate('batteries.status.stored');
      case 3:
        return this.transloco.translate('batteries.status.discharged');
      default:
        return 'Unknown';
    }
  }

  protected getStatusLevel(status: number): number {
    switch (status) {
      case 1:
        return 3; // High - Charged
      case 2:
        return 2; // Mid - Stored
      case 3:
        return 1; // Low - Discharged
      default:
        return 0;
    }
  }

  protected formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }

  dismiss() {
    this.modalController.dismiss();
  }
}
