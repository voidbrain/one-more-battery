import { Component, Input, SimpleChanges, OnChanges, AfterViewInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ModalController } from '@ionic/angular/standalone';
import { FormsModule } from '@angular/forms';
import { Chart, registerables, TooltipItem } from 'chart.js';
import 'chartjs-adapter-date-fns';
import { format } from 'date-fns';

import {
  IonButton,
  IonButtons,
  IonToggle,
  IonContent,
  IonGrid,
  IonCol,
  IonRow,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonTitle,
  IonToolbar,
  IonCard,
  IonCardContent,
  IonDatetimeButton,
  IonModal,
  IonDatetime,
  IonInput,
} from '@ionic/angular/standalone';
import { BatteryAnagraphInterface } from 'src/app/interfaces/battery-anagraph';
import { DbService } from '../../../services/db.service';
import {
  batteryStatusActionEnum,
  batteryStatusDaysAlertEnum,
  BatteryStatusInterface,
} from 'src/app/interfaces/battery-status';
import { dbTables } from 'src/app/services/settings.service';

@Component({
  selector: 'app-modal-cycles-logs',
  templateUrl: 'cycles-logs.component.html',
  styleUrl: 'cycles-logs.component.scss',
  standalone: true,
  imports: [
    IonInput,
    IonDatetime,
    IonModal,
    IonDatetimeButton,
    IonCardContent,
    IonCard,
    IonButton,
    IonButtons,
    IonToggle,
    IonContent,
    IonGrid,
    IonCol,
    IonRow,
    IonItem,
    IonHeader,
    IonIcon,
    IonLabel,
    IonTitle,
    IonToolbar,
    DatePipe,
    FormsModule,
  ],
})
export class ModalCyclesLogsComponent {
  @Input() anag: BatteryAnagraphInterface | undefined = undefined;

  newRowForm: BatteryStatusInterface = {
    date: new Date(),
    idBattery: 0,
    enabled: +true,
    deleted: +false,
    status: 0,
  };

  cycles: BatteryStatusInterface[] = [];
  objectStore = dbTables['batteries-status'];
  public batteryStatusActionEnum = batteryStatusActionEnum;

  dateTimeFormatOptions = {
    date: {
      month: 'short',
      day: '2-digit',
    },
  };

  batteryData = [];

  constructor(
    private modalCtrl: ModalController,
    private db: DbService,
  ) {
    Chart.register(...registerables);
  }

  getBatteryStatus(status: number | undefined) {
    if (status) {
      return batteryStatusActionEnum[status];
    }
    return;
  }

  deleteRow(el: BatteryStatusInterface) {
    el.deleted = +true;
    this.updateRow(el);
  }

  async updateRow(el: BatteryStatusInterface) {
    el.enabled = +el.enabled;
    el.deleted = +el.deleted;
    this.db.putItem(this.objectStore, el);
    await this.getItems();
  }

  async ionViewWillEnter() {
    console.info('[PAGE]: Start');
    try {
      const forceLoading = false;
      await this.db.initService(forceLoading);

       const itemsData: BatteryStatusInterface[] | null = await this.getItems();
      // // Extracting chart data
      // const labels = data?.map((item) =>
      //   new Intl.DateTimeFormat('it-IT').format(item.date)
      // );

      //const dataset = data?.map((item) => item.status);

      // Build Chart.js chart
      const ctx = document.getElementById('batteryStatusChart') as HTMLCanvasElement;
      const gradient = ctx.getContext('2d')?.createLinearGradient(0, 0, ctx.height, 0);
      if (gradient) {
        gradient.addColorStop(0, 'red'); // Start color
        gradient.addColorStop(0.5, 'green'); // Middle color
        gradient.addColorStop(1, 'red'); // End color
      }
      // const dataSet = {
      //   labels,
      //   datasets: [
      //     {
      //       label: 'Battery Status',
      //       data: dataset,
      //       borderColor: gradient || 'gray', // Use gradient if available
      //       borderWidth: 1,
      //       pointBackgroundColor: (ctx: any) => {
      //         const raw = ctx.raw as { x: string; y: number };
      //         const value = raw.y;
      //         return value === 2 ? 'green' : 'red';
      //       },
      //       pointRadius: 5,

      //       tension: 0.3, // Smooth curve
      //     },
      //   ],
      // };
      // console.log(dataSet)

      let labelsWithTime: string[] = [];
      let timeIncrement = 0;
      let lastDate: string  | null = null;

      const originalLabels = itemsData ? itemsData.map(el=> el.date) : [];

      let sortedLabels = originalLabels
        .map(dateStr => {
          // Convert string to Date object by parsing the format dd/MM/yyyy
          console.log(dateStr)
          const [day, month, year] = [
            new Date(dateStr).getDate(),
            new Date(dateStr).getMonth(),
            new Date(dateStr).getFullYear()
          ];

          return new Date(year, month - 1, day);  // Month is 0-indexed in Date constructor
        })
        .sort((a: Date, b: Date): number => a.getTime() - b.getTime())
        .map(date => {
          // Convert back to the original string format dd/MM/yyyy
          console.log(date)
          const day = String(date.getDate()).padStart(2, '0');
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const year = date.getFullYear();
          return `${day}/${month}/${year}`;
        });

        sortedLabels.forEach((date) => {
          // If the current date is the same as the last date, increment the time by 4 hours
          if (lastDate === date) {
            timeIncrement += 4;
          } else {
            // Reset time to 00:00 if it's a new date
            timeIncrement = 0;
          }

          // Format time as `hh:mm`
          const time = `${(timeIncrement).toString().padStart(2, '0')}:00`;

          // Push the date with the assigned time
          labelsWithTime.push(`${date} ${time}`);

          // Update last date to the current date
          lastDate = date;
        });

        console.log(labelsWithTime);

      const data = {
        labels: labelsWithTime,

        datasets: [
          {
            label: 'Battery Status',
            data: [
              1, 2, 3, 1, 2, 3, 1, 2, 3, 1, 2, 3, 1, 2, 3, 1, 2, 3, 1, 2, 3, 1, 2, 1, 2, 3, 1, 2, 1, 2, 3, 1, 2, 3, 1, 1, 2, 3,
              1, 2, 1, 2, 3, 1, 2, 3, 1, 2, 3, 1, 2, 3, 1, 2, 3, 1, 2, 3, 1, 2, 3, 1, 2, 1, 2, 3, 1, 2, 1, 2, 3, 1, 2, 3, 1, 2,
              3, 1, 1, 2, 3, 1, 2, 1, 2, 3, 1, 2, 3, 1, 2, 3, 1, 2, 1, 2, 3, 1, 2, 3, 1, 2, 3, 1, 2, 1, 2, 3, 1, 2, 3, 1, 2, 3
            ],
            pointBackgroundColor: function(context:any) {
              const value = context.dataset.data[context.dataIndex];
              // Set point color based on the y-value
              if (value === 1 || value === 3) {
                return 'red';  // Red for 1 and 3
              } else if (value === 2) {
                return 'green';  // Green for 2
              }
              return 'black'; // Default if no match
            },
            pointBorderColor: function(context:any) {
              const value = context.dataset.data[context.dataIndex];
              // Set point color based on the y-value
              if (value === 1 || value === 3) {
                return 'red';  // Red for 1 and 3
              } else if (value === 2) {
                return 'green';  // Green for 2
              }
              return 'black'; // Default if no match
            },
            borderColor: function(context: any) {
              const chart = context.chart;
              const ctx = chart.ctx;
              const dataset = context.dataset;
              const data = dataset.data;
              const len = data.length;

              // Create a vertical gradient (from top to bottom)
              const gradient = ctx.createLinearGradient(0, 0, 0, chart.width);

              // Loop through the data and set color stops based on the transitions
              for (let i = 0; i < len - 1; i++) {
                const currentValue = data[i];
                const nextValue = data[i + 1];

                // Color transition logic
                if ((currentValue === 1 && nextValue === 2) || (currentValue === 3 && nextValue === 2)) {
                  gradient.addColorStop(i / len, 'red');  // Red to Green (1 -> 2 or 3 -> 2)
                  gradient.addColorStop((i + 1) / len, 'green');
                }
                else if ((currentValue === 2 && nextValue === 1) || (currentValue === 2 && nextValue === 3)) {
                   // Green to Red (2 -> 1 or 2 -> 3)
                  gradient.addColorStop((i ) / len, 'green');
                  gradient.addColorStop((i + 1) / len, 'red');
                }

              }

              // Return the dynamically created gradient
              return gradient;
            },
            borderWidth: 2,
            pointRadius: 5,
            tension: 0.2,





          }
        ]
      };

      // Convert date strings to Date objects
      const labels = data.labels.map(dateStr => {
        const [day, month, year] = dateStr.split('/');
        return new Date(`${month}/${day}/${year}`);
      });

      new Chart(ctx, {
        type: 'line',
        data: {
          labels: labels, // Use Date objects as labels
          datasets: data.datasets
        },
        options: {
          plugins: {
            legend: {
              display: false, // Disable the legend
            },
            tooltip: {
              callbacks: {
                title: (tooltipItem: any) => {
                  const date = tooltipItem[0].label;
                  return `Date: ${date}`;
                },
                label: (tooltipItem: any) => {
                  const value = tooltipItem?.raw;
                  let statusText = '';
                  if (value === 1) statusText = 'Discharge';
                  if (value === 2) statusText = 'Store';
                  if (value === 3) statusText = 'Charge';
                  return `Status: ${statusText}`;
                },
              },
            },
          },
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: {
              type: 'time', // Use time scale
              time: {
                unit: 'day', // Set the unit to 'day'
                displayFormats: {
                  day: 'dd/MM/yyyy', // Custom date format for x-axis
                },
              },
              title: {
                display: true,
                text: 'Date',
              },
            },
            y: {
              title: {
                display: true,
                text: 'Status',
              },
              ticks: {
                callback: (value) => {
                  // Map Y-axis ticks to statuses
                  if (value === 1) return 'Discharge';
                  if (value === 2) return 'Store';
                  if (value === 3) return 'Charge';
                  return value;
                },
              },
            },
          },
        },
      });
    } catch (err) {
      console.error('Error during initialization:', err);
    }
  }

  async getItems() : Promise<BatteryStatusInterface[] | null> {
    if (this.anag?.id) {
      this.newRowForm.idBattery = this.anag.id;
      const cycles: BatteryStatusInterface[] = await this.db.getItems(
        this.objectStore,
        'idBattery, enabled, deleted',
        [this.anag.id, +true, +false],
      );
      cycles.map((row) => {
        const alertStatus =
          row.status !== batteryStatusActionEnum.Store
            ? 'warning'
            : row.status !== batteryStatusActionEnum.Store
              ? 'danger'
              : row.status !== batteryStatusActionEnum.Store
                ? 'danger'
                : 'success';
        row.alertStatus = alertStatus;
      });
      this.cycles = cycles;
      return cycles;
    }
    return null;
  }

  addLog() {
    this.db.putItem(this.objectStore, this.newRowForm);
    this.newRowForm = {
      date: new Date(),

      idBattery: 0,
      enabled: +true,
      deleted: +false,
      status: 0,
    };
    this.getItems();
  }

  get isAddNewDisabled() {
    return !this.newRowForm.date || this.newRowForm.status === 0;
  }

  cancel() {
    return this.modalCtrl.dismiss(null, 'cancel');
  }

  getArray(size: number): number[] {
    return Array.from({ length: size });
  }
}
