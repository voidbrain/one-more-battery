import { Component, Input, SimpleChanges, OnChanges } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ModalController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
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
import { BatteryResistanceLogInterface } from 'src/app/interfaces/battery-resistance';
import { DbService } from '../../../services/db.service';
import { dbTables } from 'src/app/services/settings.service';

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
    IonTitle,
    IonToolbar,
    DatePipe,
    FormsModule,
  ],
})
export class ModalResistanceLogsComponent {
  @Input() anag: BatteryAnagraphInterface | undefined = undefined;

  newRowForm: BatteryResistanceLogInterface = {
    date: new Date(),

    idBattery: 0,
    enabled: +true,
    deleted: +false,
    values: [],
  };

  logs: BatteryResistanceLogInterface[] = [];
  objectStore = dbTables['batteries-resistance-logs'];

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

  async getItems() {
    if (this.anag?.id) {
      this.newRowForm.idBattery = this.anag.id;
      this.logs = await this.db.getItems(
        this.objectStore,
        'idBattery, enabled, deleted',
        [this.anag.id, +true, +false],
      );
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
      values: [],
    };
    this.getItems();
  }

  get isAddNewDisabled() {
    const isNull = this.newRowForm.values.some(
      (el) => '' + el === '' || el === null,
    );
    return (
      !this.newRowForm.date ||
      this.newRowForm.values.length !== this.anag?.cellsNumber ||
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
