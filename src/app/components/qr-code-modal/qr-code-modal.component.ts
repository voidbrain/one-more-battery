import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ModalController,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonContent,
  IonIcon,
  IonText,
} from '@ionic/angular/standalone';
import { TranslocoModule } from '@jsverse/transloco';

@Component({
  selector: 'app-qr-code-modal',
  templateUrl: './qr-code-modal.component.html',
  styleUrls: ['./qr-code-modal.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonContent,
    IonIcon,
    IonText,
    TranslocoModule,
  ],
})
export class QrCodeModalComponent {
  @Input() qrCodeDataUrl!: string;
  @Input() batteryLabel!: string;
  @Input() qrText!: string;

  constructor(private modalController: ModalController) {}

  dismiss() {
    this.modalController.dismiss();
  }

  downloadQrCode() {
    const link = document.createElement('a');
    link.href = this.qrCodeDataUrl;
    link.download = `battery-${this.batteryLabel}-qr.png`;
    link.click();
  }
}
