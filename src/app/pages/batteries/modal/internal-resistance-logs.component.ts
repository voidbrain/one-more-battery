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
import { SettingsService } from '../../../services/settings.service';
import { FillDbService } from 'src/app/services/fillDb.service';

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
  @Input() logs: BatteryResistanceLogInterface[] = [];

  newRowForm: BatteryResistanceLogInterface = {
    date: new Date(),
    dateString: '',
    idBattery: 0,
    enabled: +true,
    deleted: +false,
    values: [],
  };

  addLog(){
    console.log(this.newRowForm)
  }

  get isAddNewDisabled(){
    return !this.newRowForm.date || this.newRowForm.values.find(el=> el === undefined)
  }

  dateTimeFormatOptions = {
    date: {
      month: 'short',
      day: '2-digit',
    },
  };

  constructor(
    private modalCtrl: ModalController,
    private settings: SettingsService,
    private fillDb: FillDbService,
  ) {}

  async ionViewWillEnter() {
    if (this.settings.fillDb) {
      await this.fillDb.fillDb();
    }
  }

  cancel() {
    return this.modalCtrl.dismiss(null, 'cancel');
  }

  getArray(size: number): number[] {
    return Array.from({ length: size });
  }

  updateRow(){

  }

  updateRowValues(value: number, index: number){
    
  }
}
