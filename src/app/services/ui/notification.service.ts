import { inject, Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { LoggerService } from '../utils/logger.service';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private toastController = inject(ToastController);

  async showSuccess(message: string): Promise<void> {
    const toast = await this.toastController.create({
      message: message,
      duration: 1000,
      color: 'success',
      buttons: [{ text: 'X', role: 'cancel' }],
    });
    await toast.present();
  }

  async showError(message: string): Promise<void> {
    const toast = await this.toastController.create({
      message: message,
      duration: 1000,
      color: 'danger',
      buttons: [{ text: 'X', role: 'cancel' }],
    });
    await toast.present();
    LoggerService.logError(message);
  }

  async showInfo(message: string): Promise<void> {
    const toast = await this.toastController.create({
      message: message,
      duration: 1000,
      color: 'medium',
      buttons: [{ text: 'X', role: 'cancel' }],
    });
    await toast.present();
  }

  async showWarning(message: string): Promise<void> {
    const toast = await this.toastController.create({
      message: message,
      duration: 1000,
      color: 'warning',
      buttons: [{ text: 'X', role: 'cancel' }],
    });
    await toast.present();
  }

  async showCustomError(message: string, title: string): Promise<void> {
    const toast = await this.toastController.create({
      header: title,
      message: message,
      duration: 1000,
      color: 'danger',
      buttons: [{ text: 'X', role: 'cancel' }],
    });
    await toast.present();
  }

  async showCustomSuccess(message: string, title: string): Promise<void> {
    const toast = await this.toastController.create({
      header: title,
      message: message,
      duration: 1000,
      color: 'success',
      buttons: [{ text: 'X', role: 'cancel' }],
    });
    await toast.present();
  }
}
