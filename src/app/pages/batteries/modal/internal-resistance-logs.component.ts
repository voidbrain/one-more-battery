import { Component, Input } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ModalController } from '@ionic/angular';
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
  IonToolbar,
  } from '@ionic/angular/standalone';
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
    DatePipe
  ]
})
export class ModalResistanceLogsComponent {
  @Input() anag: BatteryAnagraphInterface | undefined = undefined;
  @Input() logs: BatteryResistanceLogInterface[] = [];
  name: string ="name";

  constructor(
    private modalCtrl: ModalController,
    private settings: SettingsService,
    private fillDb: FillDbService
  ) {
  }

  async ionViewWillEnter() {
    if(this.settings.fillDb) {
      await this.fillDb.fillDb();
    }
  }

  cancel() {
    return this.modalCtrl.dismiss(null, 'cancel');
  }

  confirm() {
    return this.modalCtrl.dismiss(this.name, 'confirm');
  }
}
