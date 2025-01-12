import { Component, Input } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ModalController } from '@ionic/angular/standalone';
import { FormsModule } from '@angular/forms';
import { Chart, ChartOptions, registerables } from 'chart.js';
import 'chartjs-adapter-date-fns';
import { differenceInDays, formatDuration } from 'date-fns';

import {
  IonButton,
  IonButtons,
  IonContent,
  IonGrid,
  IonCol,
  IonRow,
  IonHeader,
  IonIcon,
  IonItem,
  IonTitle,
  IonToolbar,
  IonCard,
  IonCardContent,
} from '@ionic/angular/standalone';
import { ExtendedBatteryAnagraphInterface } from 'src/app/interfaces/battery-anagraph';
import { DbService } from '../../../services/db.service';
import {
  batteryStatusActionEnum,
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
    IonCol,
    IonRow,
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
  @Input() battery: ExtendedBatteryAnagraphInterface | undefined = undefined;

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

  getAge(age: Date, skipPostfix = false) {
    console.log(this.calculateStatusStats());

    const differenceDays: number = differenceInDays(
      Date.now(),
      age?.getTime() as number,
    );
    const format = formatDuration(
      { days: differenceDays },
      { format: ['years', 'months', 'weeks', 'days'] },
    );
    return (
      format +
      (format.length ? (skipPostfix === false ? ' ago' : '') : ' Today')
    );
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

      const originalLabels = itemsData ? itemsData.map((el) => el.date) : [];


      const convertToShortDate = (dateString: string): any => {
        const [month, day, year, time, period] = dateString.split(/[, ]+/);
        return (`${day} ${month} ${year}`);
      };

      const plugins = {
        legend: { display: false },
        tooltip: {
          callbacks: {
            title: (tooltipItem: any) => {
              const date = convertToShortDate(tooltipItem[0].label);
              return date;
            },
            label: (tooltipItem: any) => {

              return "Status: " +
              (itemsData ?
                itemsData[tooltipItem.dataIndex].status === 3 ? "Stored" :
                itemsData[tooltipItem.dataIndex].status === 1 ? "Charged" : "Discharged"
                : '');

            },
            labelColor: function(tooltipItem: any) {
              return {
                borderColor:
                (itemsData ? itemsData[tooltipItem.dataIndex].status === 3
                      ? '#0f0'
                      : '#f00':'#000'),
                backgroundColor:
                (itemsData ? itemsData[tooltipItem.dataIndex].status === 3
                      ? '#0f0'
                      : '#f00':'#000'),
              }
            },
          },
        },
      };

      const genericOptions: ChartOptions = {
        interaction: {
          intersect: false,
        },

        plugins: plugins,
        scales: {
          x: {
            type: 'time',
          },
          y: {
            display: false,
          },
        },
        maintainAspectRatio: false,
      };

      new Chart(ctx, {
        type: 'line',
        data: {
          labels: originalLabels,
          datasets: [
            {
              data: itemsData!.map((el) => {
                return el.status === 3 ? 10 :
                el.status === 1 ? 20 : 0;
              }),
              pointBackgroundColor: (ctx: any) => {

                return itemsData && itemsData[ctx.dataIndex].status
                  ? itemsData[ctx.dataIndex].status === 3
                    ? '#0f0'
                    : '#f00'
                  : '#000';
              },
              pointBorderColor: (ctx: any) => {
                return itemsData && itemsData[ctx.dataIndex].status
                  ? itemsData[ctx.dataIndex].status === 3
                    ? '#0f0'
                    : '#f00'
                  : '#000';
              },

              segment: {
                borderColor: (ctx) => {
                  return itemsData && itemsData[ctx.p0DataIndex].status
                    ? itemsData[ctx.p0DataIndex].status === 3
                      ? '#0f0'
                      : '#f00'
                    : '#000';
                },
              },
              spanGaps: true,
              fill: true,
              backgroundColor: (ctx:any) => {

                return itemsData && ctx.dataIndex && itemsData[ctx.dataIndex].status
                  ? itemsData[ctx.dataIndex].status === 3
                    ? '#0f0'
                    : '#f00'
                  : '#000';
              },
            },
          ],
        },
        options: genericOptions,
      });
    } catch (err) {
      console.error('Error during initialization:', err);
    }
  }

  calculateStatusStats() {
    // Initialize variables for status counts
    const statusCounts: {
        [key: number]: number,
    } = {
        1: 0, // Discharge
        2: 0, // Store
        3: 0, // Charge
    };

    // Initialize an array for date differences (in days) between statuses
    const statusDateDiffs: any[] = [];

    // Sort data by date to calculate differences between statuses
    const data = this.cycles


    // Loop through the data to count statuses and calculate the date differences
    data.forEach((item: BatteryStatusInterface, index: number) => {
        // Count the status
        if (statusCounts[item.status] !== undefined) {
            statusCounts[item.status]++;
        }

        // Calculate the difference between current and next status
        if (index < data.length - 1) {
            const currentDate = new Date(item.date);
            const nextDate = new Date(data[index + 1].date);
            // const dateDiff: number = Math.abs((nextDate - currentDate) / (1000 * 60 * 60 * 24)); // Difference in days
            const dateDiff: number = Math.abs((nextDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
            statusDateDiffs.push(dateDiff);
        }
    });

    // Calculate percentages
    //const totalCount = data.length;
    // const percentages = {
    //     1: (statusCounts[1] / totalCount) * 100,
    //     2: (statusCounts[2] / totalCount) * 100,
    //     3: (statusCounts[3] / totalCount) * 100,
    // };

    // // Calculate average days between statuses
    // const averageDays = statusDateDiffs.length > 0 ? statusDateDiffs.reduce((sum, diff) => sum + diff, 0) / statusDateDiffs.length : 0;

    const totalTime = (data[data.length - 1].date.getTime() - data[0].date.getTime()) / (1000 * 60 * 60 * 24); // Total days

// Initialize an object to store the time spent on each status
const statusTimes:any = { 1: 0, 2: 0, 3: 0 };

// Loop through the statuses and calculate time spent on each status
for (let i = 1; i < data.length; i++) {
    const startStatus = data[i - 1];
    const endStatus = data[i];

    const timeSpent = (endStatus.date.getTime() - startStatus.date.getTime()) / (1000 * 60 * 60 * 24); // Time in days
    statusTimes[startStatus.status] += timeSpent;
}

// Calculate the percentage of time spent in each status
const percentages = {
    1: (statusTimes[1] / totalTime) * 100,
    2: (statusTimes[2] / totalTime) * 100,
    3: (statusTimes[3] / totalTime) * 100,
};

// Calculate the average days between statuses
const averageDays = totalTime / (data.length - 1); // Average days between status changes


    return {
        statusCounts,
        percentages,
        averageDays
    };
}




  async getItems(): Promise<BatteryStatusInterface[] | null> {
    if (this.battery?.anag?.id) {
      this.newRowForm.idBattery = this.battery?.anag.id;
      const cycles: BatteryStatusInterface[] = await this.db.getItems(
        this.objectStore,
        'idBattery, enabled, deleted',
        [this.battery?.anag.id, +true, +false],
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
}
