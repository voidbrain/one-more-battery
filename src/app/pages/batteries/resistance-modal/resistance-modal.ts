import { Component, Input, OnInit, OnDestroy, ViewChild, ElementRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ModalController,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonContent,
  IonIcon,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonItem,
  IonLabel,
  IonInput,
  IonGrid,
  IonRow,
  IonCol, IonFooter } from '@ionic/angular/standalone';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { Sqlite } from '@services/database/database.service';
import { FormsModule } from '@angular/forms';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

interface ResistanceRecord {
  id: number;
  idBattery: number;
  date: string;
  resistance_values: number[];
}

interface CellData {
  name: string;
  firstRead: string;
  lastRead: string;
  values: number[];
}

@Component({
  selector: 'app-resistance-modal',
  templateUrl: './resistance-modal.html',
  standalone: true,
  imports: [IonFooter,
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonContent,
    IonIcon,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonItem,
    IonLabel,
    IonInput,
    IonGrid,
    IonRow,
    IonCol,
    TranslocoModule,
    FormsModule,
  ],
})
export class ResistanceModalComponent implements OnInit, OnDestroy {
  @Input() batteryId = 0;
  @Input() batteryLabel = '';
  @Input() cellsNumber = 3;

  @ViewChild('resistanceChartCanvas') private resistanceChartCanvas!: ElementRef;
  resistanceChart: Chart | null = null;

  private sqlite = inject(Sqlite);
  private transloco = inject(TranslocoService);
  private modalController = inject(ModalController);

  protected resistanceRecords: ResistanceRecord[] = [];
  protected cellData: CellData[] = [];
  protected averageData: CellData | null = null;
  protected totalRecords = 0;
  protected firstRecordDate = '';
  protected lastRecordDate = '';

  // Form data
  protected newMeasurementDate = new Date().toISOString().split('T')[0];
  protected newResistanceValues: number[] = [];
  protected isSaving = false;

  async ngOnInit() {
    await this.loadData();
  }

  ngOnDestroy(): void {
    if (this.resistanceChart) {
      this.resistanceChart.destroy();
    }
  }

  private async loadData() {
    try {
      const records = await this.sqlite.getResistanceRecords(this.batteryId);
      this.resistanceRecords = records.sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(), // Sort ascending for chart
      );

      this.totalRecords = this.resistanceRecords.length;

      if (this.resistanceRecords.length > 0) {
        this.firstRecordDate = new Date(this.resistanceRecords[0].date).toLocaleDateString();
        this.lastRecordDate = new Date(
          this.resistanceRecords[this.resistanceRecords.length - 1].date,
        ).toLocaleDateString();

        // Process cell data
        this.processCellData();
      }

      // Initialize form with empty values for each cell based on battery's cell count
      this.newResistanceValues = new Array(this.cellsNumber).fill(0);

      this.createResistanceChart();
    } catch (error) {
      console.error('Error loading resistance data:', error);
    }
  }

  private processCellData() {
    if (this.resistanceRecords.length === 0) return;

    // Get the maximum number of cells from all records
    const maxCells = Math.max(...this.resistanceRecords.map((r) => r.resistance_values.length));

    this.cellData = [];

    // Process each cell
    for (let cellIndex = 0; cellIndex < maxCells; cellIndex++) {
      const cellValues = this.resistanceRecords
        .filter((r) => r.resistance_values[cellIndex] !== undefined)
        .map((r) => ({
          date: r.date,
          value: r.resistance_values[cellIndex],
        }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      if (cellValues.length > 0) {
        this.cellData.push({
          name: `Cell ${cellIndex + 1}`,
          firstRead: new Date(cellValues[0].date).toLocaleDateString(),
          lastRead: new Date(cellValues[cellValues.length - 1].date).toLocaleDateString(),
          values: cellValues.map((v) => v.value),
        });
      }
    }

    // Calculate average data
    if (this.cellData.length > 0) {
      const avgValues: number[] = [];
      const maxLength = Math.max(...this.cellData.map((c) => c.values.length));

      for (let i = 0; i < maxLength; i++) {
        const valuesAtIndex = this.resistanceRecords
          .map((r) => r.resistance_values[i])
          .filter((v) => v !== undefined);

        if (valuesAtIndex.length > 0) {
          avgValues.push(valuesAtIndex.reduce((sum, val) => sum + val, 0) / valuesAtIndex.length);
        }
      }

      this.averageData = {
        name: 'Average',
        firstRead: this.firstRecordDate,
        lastRead: this.lastRecordDate,
        values: avgValues,
      };
    }
  }

  private createResistanceChart() {
    if (this.resistanceChart) {
      this.resistanceChart.destroy();
    }

    const labels = this.resistanceRecords.map((record) => this.formatDate(record.date));
    const datasets = this.cellData.map((cell, index) => ({
      label: cell.name,
      data: cell.values,
      borderColor: `hsl(${index * 60}, 70%, 50%)`, // Different color for each cell
      backgroundColor: `hsla(${index * 60}, 70%, 50%, 0.2)`,
      fill: false,
      tension: 0.3,
    }));

    if (this.averageData) {
      datasets.push({
        label: this.transloco.translate('resistance.chart.average'),
        data: this.averageData.values,
        borderColor: '#FF0000', // Red for average
        backgroundColor: 'rgba(255, 0, 0, 0.2)',
        fill: false,
        tension: 0.3,
      });
    }

    this.resistanceChart = new Chart(this.resistanceChartCanvas.nativeElement, {
      type: 'line',
      data: {
        labels: labels,
        datasets: datasets,
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            type: 'category',
            title: {
              display: true,
              text: this.transloco.translate('resistance.chart.xAxis'),
            },
          },
          y: {
            title: {
              display: true,
              text: this.transloco.translate('resistance.chart.yAxis'),
            },
            beginAtZero: true,
          },
        },
      },
    });
  }

  protected formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }

  protected async saveMeasurement() {
    if (this.newResistanceValues.some((v) => v <= 0)) {
      // Show validation error
      return;
    }

    this.isSaving = true;
    try {
      await this.sqlite.insertResistanceRecord({
        idBattery: this.batteryId,
        date: this.newMeasurementDate,
        resistance_values: this.newResistanceValues,
        deleted: 0,
        enabled: 1,
      });

      // Reset form
      this.newMeasurementDate = new Date().toISOString().split('T')[0];
      this.newResistanceValues = new Array(this.newResistanceValues.length).fill(0);

      // Reload data
      await this.loadData();
    } catch (error) {
      console.error('Error saving resistance measurement:', error);
    } finally {
      this.isSaving = false;
    }
  }

  protected hasInvalidValues(): boolean {
    return this.newResistanceValues.some((v) => v <= 0);
  }

  dismiss() {
    this.modalController.dismiss();
  }
}
