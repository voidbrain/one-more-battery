import {
  Component,
  Input,
  SimpleChanges,
  OnChanges,
  AfterViewInit,
} from '@angular/core';
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
    IonCardContent,
    IonCard,
    IonButton,
    IonButtons,
    IonContent,
    IonGrid,
    IonItem,
    IonHeader,
    IonIcon,
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
      const itemsData: BatteryStatusInterface[] | null = await this.getItems();

      const ctx = document.getElementById(
        'batteryStatusChart',
      ) as HTMLCanvasElement;

      // Prepare labels and data
      const labelsWithTime: string[] = [];
      let timeIncrement = 0;
      let lastDate: string | null = null;

      const originalLabels = itemsData ? itemsData.map((el) => el.date) : [];

      const sortedLabels = originalLabels

        .sort((a, b) => a.getTime() - b.getTime()) // Sort by date
        .map((date) => {
          const day = String(date.getDate()).padStart(2, '0');
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const year = date.getFullYear();
          return `${day}/${month}/${year}`;
        });

      sortedLabels.forEach((date) => {
        if (lastDate === date) {
          timeIncrement += 4; // Increment every 4 hours
        } else {
          timeIncrement = 0; // Reset to 00:00 for new date
        }
        const time = `${timeIncrement.toString().padStart(2, '0')}:00`;
        labelsWithTime.push(`${date} ${time}`);
        lastDate = date;
      });

      const logData = itemsData ? itemsData.map((el) => el.status) : [];

      const backgroundColors = [];
      const datasetData: {
        discharge: number[];
        store: number[];
        charge: number[];
      } = {
        discharge: [],
        store: [],
        charge: [],
      };

      const datasets =  [
        ... itemsData!.map((value, index) => {

          return {
              label: value.status === 2 ? 'stored' : value.status === 1 ? 'discharged' : 'charged',
              //data: [{status: value.status, date: value.date}],
              data: value,
              backgroundColor: value.status === 2 ? '#0f0' : value.status === 1 ? '#f00' : '#f00',
              hoverBackgroundColor: value.status === 2 ? '#0f0' : value.status === 1 ? '#f00' : '#f00',
            };
        })
      ];
      console.log(datasets)

      new Chart(ctx, {
        type: 'bar',
        data: {
          // Use a single label for the Y-axis, since we only have one row
          labels: ['Battery Status'],

          datasets: datasets,

            // {
            //   label: 'Discharge',
            //   data: [datasetData.discharge.reduce((acc, val) => acc + val, 0)],
            //   backgroundColor: 'rgba(63,103,126,1)',
            //   hoverBackgroundColor: 'rgba(50,90,100,1)',
            // },
            // {
            //   label: 'Store',
            //   data: [datasetData.store.reduce((acc, val) => acc + val, 0)],
            //   backgroundColor: 'rgba(163,103,126,1)',
            //   hoverBackgroundColor: 'rgba(140,85,100,1)',
            // },
            // {
            //   label: 'Charge',
            //   data: [datasetData.charge.reduce((acc, val) => acc + val, 0)],
            //   backgroundColor: 'rgba(63,203,226,1)',
            //   hoverBackgroundColor: 'rgba(46,185,235,1)',
            // },

        },
        options: {
          indexAxis: 'y', // Stacked bars should be horizontal
          scales: {
            x: {
              // type: 'time',
              // time: {
              //   unit: 'day',
              //   displayFormats: {
              //     day: 'dd/MM/yyyy',
              //   },
              // },
              title: {
                display: true,
                text: 'Date',
              },
              stacked: true,
            },
            y: {
              display: false, // Hide the Y-axis
              stacked: true,
            },
          },
          plugins: {
            legend: {
              display: false, // Hide legend if not needed
            },
            tooltip: {
              callbacks: {
                title: (tooltipItem: any) => {
                  console.log(tooltipItem)
                  return `Date: ${tooltipItem[0].dataset.data.date}`;
                },
                label: (tooltipItem: any) => {
                  const value = tooltipItem.dataset.data.status;
                  let statusText = '';
                  if (value[0] === 1) statusText = 'Discharge';
                  if (value[0] === 2) statusText = 'Store';
                  if (value[0] === 3) statusText = 'Charge';
                  return `Status: ${statusText}`;
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

  async getItems(): Promise<BatteryStatusInterface[] | null> {
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
