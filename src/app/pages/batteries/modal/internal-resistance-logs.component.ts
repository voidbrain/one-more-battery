import { Component, Input, SimpleChanges, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common'
import 'chartjs-adapter-date-fns';
import { format } from 'date-fns';
import { DatePipe } from '@angular/common';
import { ModalController } from '@ionic/angular/standalone';
import { FormsModule } from '@angular/forms';
import { differenceInDays, formatDuration } from 'date-fns';
import {
  IonToggle,
  IonButton,
  IonButtons,
  IonContent,
  IonGrid,
  IonCol,
  IonRow,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonRadio,
  IonRadioGroup,
  IonTitle,
  IonToolbar,
  IonCard,
  IonCardContent,
  IonCardTitle,
  IonDatetimeButton,
  IonModal,
  IonDatetime,
  IonInput,
} from '@ionic/angular/standalone';
import { BatteryAnagraphInterface, ExtendedBatteryAnagraphInterface } from 'src/app/interfaces/battery-anagraph';
import { BatteryResistanceLogInterface } from 'src/app/interfaces/battery-resistance';
import { DbService } from '../../../services/db.service';
import { dbTables } from 'src/app/services/settings.service';
import {
  Chart,
  registerables,
  ChartData,
  ChartOptions,
  ChartDataset,
  ChartType,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

@Component({
  selector: 'app-modal-internal-resistance-logs',
  templateUrl: 'internal-resistance-logs.component.html',
  styleUrl: 'internal-resistance-logs.component.scss',
  standalone: true,
  imports: [
    IonInput,
    IonDatetime,
    IonModal,
    IonDatetimeButton,
    IonCardContent,
    IonCardTitle,
    IonCard,
    IonToggle,
    IonButton,
    IonButtons,
    IonContent,
    IonGrid,
    IonCol,
    IonRow,
    IonItem,
    IonHeader,
    IonIcon,
    IonLabel,
    IonRadio,
    IonRadioGroup,
    IonTitle,
    IonToolbar,
    DatePipe,
    CommonModule,
    FormsModule,
  ],
})
export class ModalResistanceLogsComponent {
  // @Input() anag: BatteryAnagraphInterface | undefined = undefined;
  @Input() battery: ExtendedBatteryAnagraphInterface | undefined = undefined;

  newRowForm: BatteryResistanceLogInterface = {
    date: new Date(),

    idBattery: 0,
    enabled: +true,
    deleted: +false,
    values: [],
  };

  exceededValues = '';
  exceededValuesSpec = '';

  logs: BatteryResistanceLogInterface[] = [];
  refLogs: BatteryResistanceLogInterface[] = [];
  objectStore = dbTables['batteries-resistance-logs'];

  dateTimeFormatOptions = {
    date: {
      month: 'short',
      day: '2-digit',
    },
  };

  lastRead!: Date;
  chart!: any;

  constructor(
    private modalCtrl: ModalController,
    private db: DbService,
  ) {
    // Register necessary components
    Chart.register(...registerables);
  }

  async ionViewWillEnter() {
    console.info('[PAGE]: Start');
    try {
      const forceLoading = false;
      await this.db.initService(forceLoading);

      await this.getItems();
    } catch (err) {
      console.error('Error during initialization:', err);
    }
  }

  getAverage(values: Array<number>){
    const av = values.length
    ? (values.reduce((acc: number, val: number) => +acc + +val, 0) / values.length)
    : 'No Data';
    return (av && typeof av !== 'string' ? av.toFixed(1) : null);
  }


  deleteRow(el: BatteryResistanceLogInterface) {
    el.deleted = +true;
    this.updateRow(el);
  }

  async updateRow(el: BatteryResistanceLogInterface) {
    el.enabled = +el.enabled;
    el.deleted = +el.deleted;
    this.db.putItem(this.objectStore, el);
    await this.getItems();
  }

  checkForExceededValues(logs: any[]) {
    if (logs.length === 0) return;

    const baselineValues = logs[0].values;

    logs.forEach((log, logIndex) => {
      if (logIndex === 0) return; // Skip the first record

      log.values.forEach((value: number, index: number) => {
        const threshold = baselineValues[index] + 15;
        if (value > threshold) {
          this.exceededValues = (
            `Value exceeded for Cell ${index + 1}.`
          );
          this.exceededValuesSpec = (

            `Value: ${value}, Threshold: ${threshold}`
          );
        }
      });
    });
  }

  async getItems() {
    if (this.battery?.anag?.id) {
      this.newRowForm.idBattery = this.battery.anag.id;
      this.logs = await this.db.getItems(
        this.objectStore,
        'idBattery, enabled, deleted',
        [this.battery.anag.id, +true, +false],
      );
      this.refLogs = [this.logs[0]];
      if(this.logs.length > 1) { this.refLogs.push(this.logs[this.logs.length - 1]) }

      this.checkForExceededValues(this.logs);

      const generateChartData = (data: any[]) => {
        // Extract the unique dates as ISO strings
        const labels = data.map((item) => item.date);

        const datasets = data[0]?.values.map(
          (value: number, index: number) => ({
            label: `Cell ${index + 1}`,
            data: data.map((item) => item.values[index]),
            borderColor: `hsl(${index * 60}, 100%, 50%)`,
            fill: false,
            borderWidth: 2,
            pointRadius: 5,
            pointBorderColor: `hsl(${index * 60}, 100%, 50%)`,
            pointBackgroundColor: `hsl(${index * 60}, 100%, 50%)`,
          }),
        );

        const averages = data[0]?.values.map((_: any, index: number) => {
          const total = data.reduce((sum, item) => sum + item.values[index], 0);
          return total / data.length;
        });

        // Add a new dataset for the average
        const averageDataset = {
          label: `Average`,
          data: averages,
          borderColor: `hsl(0, 0.00%, 100.00%)`, // Blue for average
          fill: false,
          borderWidth: 2,
          pointRadius: 5,
          pointBorderColor: `hsl(0, 0.00%, 100.00%)`,
          pointBackgroundColor: `hsl(0, 0.00%, 100.00%)`,
          borderDash: [5, 5], // Dashed line for average
        };

        return { labels, datasets, averageDataset };
      };


      const { labels, datasets, averageDataset } = generateChartData(this.logs);

      this.lastRead = new Date(labels[labels.length - 1]);

      const chartData: ChartData<'line'> = {
        labels,
        datasets, // Default to show cells
      };

      const convertToShortDate = (dateString: string): any => {
        const [month, day, year, time, period] = dateString.split(/[, ]+/);
        console.log(month, day, year, time, period)
        return (`${day} ${month} ${year}`);
      };

      const options: ChartOptions<'line'> = {
        responsive: true,
        scales: {
          x: {
            type: 'time',
            time: {
              unit: 'day',
              displayFormats: {
                day: 'dd/MM/yyyy', // Custom date format
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
              text: 'Value',
            },
          },
        },
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            callbacks: {
              title: (tooltipItem: any) => {
                const date = convertToShortDate(tooltipItem[0].label);
                return date;
              },
              label: (tooltipItem: any) => {
                console.log(tooltipItem)
                return tooltipItem.dataset.label +": "+ tooltipItem.formattedValue + "mΩ";

              },
            },
          },
        },
      };

      if (this.chart) {
        this.destroyChart();
      }

      this.chart = new Chart('myChart', {
        type: 'line',
        data: chartData,
        options,
      });

      // Add toggle functionality
      const showMedia = (show: boolean) => {
        this.chart.data.datasets = show ? [averageDataset] : datasets;
        this.chart.update();
      };

      // Example: Add toggle buttons
      document
        .getElementById('showMedia')
        ?.addEventListener('click', () => showMedia(true));
      document
        .getElementById('showCells')
        ?.addEventListener('click', () => showMedia(false));
    }
  }

  destroyChart() {
    if (this.chart) {
      this.chart.destroy();
      this.chart = null;
    }
  }

  addLog() {
    this.db.putItem(this.objectStore, this.newRowForm);
    this.newRowForm = {
      date: new Date(),

      idBattery: 0,
      enabled: +true,
      deleted: +false,
      values: [],
    };
    this.getItems();
  }

  getAge(age: Date, skipPostfix = false) {
      const differenceDays: number = differenceInDays(
        Date.now(),
        age?.getTime() as number,
      );
      const format = formatDuration(
        { days: differenceDays },
        { format: ['years', 'months', 'weeks', 'days'] },
      );
      return format + (format.length ?
        skipPostfix === false ? ' ago' : ''
        : ' Today');
    }

    getBatteryDisabledTimeAgo(disabledDate: Date | null | undefined) {
      if(disabledDate){
        return this.getAge(disabledDate);
      } else return;
    }

  get isAddNewDisabled() {
    const isNull = this.newRowForm.values.some(
      (el) => '' + el === '' || el === null,
    );
    return (
      !this.newRowForm.date ||
      this.newRowForm.values.length !== this.battery?.anag?.cellsNumber ||
      isNull
    );
  }

  cancel() {
    return this.modalCtrl.dismiss(null, 'cancel');
  }

  getArray(size: number): number[] {
    return Array.from({ length: size });
  }

  updateRowValues(event: CustomEvent, index: number) {
    const value = event.detail.value;
    this.newRowForm.values[index] = value;
  }


}
