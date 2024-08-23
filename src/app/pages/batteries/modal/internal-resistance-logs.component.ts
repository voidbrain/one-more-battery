import { Component, Input } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ModalController } from '@ionic/angular';
import { FormsModule } from '@angular/forms'
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
  IonLabel,
  IonTitle,
  IonToolbar, IonCard, IonCardContent, IonDatetimeButton, IonModal, IonDatetime, IonInput } from '@ionic/angular/standalone';
import { BatteryAnagraphInterface } from 'src/app/interfaces/battery-anagraph';
import { BatteryResistanceLogInterface } from 'src/app/interfaces/battery-resistance';
import { DbService } from '../../../services/db.service';

@Component({
  selector: 'app-modal-internal-resistance-logs',
  templateUrl: 'internal-resistance-logs.component.html',
  styleUrl: 'internal-resistance-logs.component.scss',
  standalone: true,
  imports: [
    IonInput, IonDatetime, IonModal, IonDatetimeButton, IonCardContent, IonCard, 
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
    FormsModule
  ],
})
export class ModalResistanceLogsComponent {
  @Input() anag: BatteryAnagraphInterface | undefined = undefined;
  // @Input() logs: BatteryResistanceLogInterface[] = [];

  newRowForm: BatteryResistanceLogInterface = {
    date: new Date(),
   
    idBattery: 0,
    enabled: +true,
    deleted: +false,
    values: [],
  };

  logs: BatteryResistanceLogInterface[] = [];
  objectStore = "batteries-resistance-logs";

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

  aIonViewWIllEnter(){
    this.getItems();
  }

  async getItems(){
    this.logs = await this.db.getItems(this.objectStore)
    // where idBattery = anag.id
  }

  addLog(){
    this.db.putItem(this.objectStore, this.newRowForm);
    this.newRowForm = {
      date: new Date(),
     
      idBattery: 0,
      enabled: +true,
      deleted: +false,
      values: [],
    }
    this.getItems();
  }

  get isAddNewDisabled(){
    return  !this.newRowForm.date || 
            !this.newRowForm.values.length !== !this.anag?.cellsNumber || 
            this.newRowForm.values.find(el=> el === undefined);
  }

  cancel() {
    return this.modalCtrl.dismiss(null, 'cancel');
  }

  getArray(size: number): number[] {
    return Array.from({ length: size });
  }

  updateRowValues(event: CustomEvent, index: number){
    const value = event.detail.value;
    this.newRowForm.values[index] = value;
  }
}
