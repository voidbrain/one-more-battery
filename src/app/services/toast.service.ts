import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';

export interface ToastMessage {
  message: string;
  duration: number;
  position: string;
  cssClass: string;
}

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private toastMsgs: string[] = [];

  constructor(private toastCtrl: ToastController) {}

  async presentToast() {
    const toast = await this.toastCtrl.create({
      message: this.toastMsgs.toString().split(',').join('\n'),
      duration: 3000,
      position: 'top',
      cssClass: 'globe',
    });
    toast.present();
    await toast.onDidDismiss();
    this.toastMsgs = [];
  }

  pushMessage(message: string) {
    this.toastMsgs.push(message);
  }
}
