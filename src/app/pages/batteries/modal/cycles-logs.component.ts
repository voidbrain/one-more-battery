import { Component, Input, SimpleChanges, OnChanges } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ModalController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
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

  constructor(
    private modalCtrl: ModalController,
    private db: DbService,
  ) {}

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

      await this.getItems();
    } catch (err) {
      console.error('Error during initialization:', err);
    }
  }

  async getItems() {
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
    }
  }

  addLog() {
    console.log(this.newRowForm);
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
