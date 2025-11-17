import { Component, inject, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { ActionSheetController, IonIcon } from '@ionic/angular/standalone';
import { QrScannerService } from '@services/utils/qr-scanner';
import { ToastService } from '@services/ui/toast';
import { PhotoResult } from '@interfaces/index';

@Component({
  selector: 'app-actions-bar',
  imports: [CommonModule, TranslocoModule, IonIcon],
  templateUrl: './actions-bar.html',
  styleUrl: './actions-bar.scss',
})
export class ActionsBar {
  private actionSheetController = inject(ActionSheetController);
  private qrScanner = inject(QrScannerService);
  private toast = inject(ToastService);
  private transloco = inject(TranslocoService);

  // Output events
  qrCodeScanned = output<string>();
  photoTaken = output<PhotoResult>();

  protected async scanQrCode() {
    try {
      // Show action sheet to choose camera or library
      const actionSheet = await this.actionSheetController.create({
        header: this.transloco.translate('batteries.scanQr'),
        buttons: [
          {
            text: this.transloco.translate('batteries.camera'),
            icon: 'camera',
            handler: () => this.scanFromCamera(),
          },
          {
            text: this.transloco.translate('batteries.photoLibrary'),
            icon: 'images',
            handler: () => this.scanFromLibrary(),
          },
          {
            text: this.transloco.translate('common.cancel'),
            icon: 'close',
            role: 'cancel',
          },
        ],
      });

      await actionSheet.present();
    } catch (error) {
      console.error('Error showing QR scan options:', error);
    }
  }

  private async scanFromCamera() {
    try {
      const qrCode = await this.qrScanner.scanFromCamera();
      if (qrCode) {
        this.qrCodeScanned.emit(qrCode);
      }
    } catch (error) {
      console.error('Camera scan failed:', error);
    }
  }

  private async scanFromLibrary() {
    try {
      const qrCode = await this.qrScanner.scanFromLibrary();
      if (qrCode) {
        this.qrCodeScanned.emit(qrCode);
      }
    } catch (error) {
      console.error('Library scan failed:', error);
    }
  }

  protected async takePhoto() {
    try {
      // Show action sheet to choose camera or library
      const actionSheet = await this.actionSheetController.create({
        header: 'Take Photo',
        buttons: [
          {
            text: this.transloco.translate('batteries.camera'),
            icon: 'camera',
            handler: () => this.takeFromCamera(),
          },
          {
            text: this.transloco.translate('batteries.photoLibrary'),
            icon: 'images',
            handler: () => this.takeFromLibrary(),
          },
          {
            text: this.transloco.translate('common.cancel'),
            icon: 'close',
            role: 'cancel',
          },
        ],
      });

      await actionSheet.present();
    } catch (error) {
      console.error('Error showing photo options:', error);
    }
  }

  private async takeFromCamera() {
    try {
      const image = await this.qrScanner.takePhotoFromCamera();
      if (image) {
        this.photoTaken.emit({
          dataUrl: image.dataUrl,
          format: image.format,
          saved: false, // Camera photos are not automatically saved
        });
        this.toast.showSuccess('Photo taken successfully');
      }
    } catch (error) {
      console.error('Camera photo failed:', error);
      this.toast.showError('Failed to take photo from camera');
    }
  }

  private async takeFromLibrary() {
    try {
      const image = await this.qrScanner.takePhotoFromLibrary();
      if (image) {
        this.photoTaken.emit({
          dataUrl: image.dataUrl,
          format: image.format,
          saved: true, // Library photos are already saved
        });
        this.toast.showSuccess('Photo selected successfully');
      }
    } catch (error) {
      console.error('Library photo failed:', error);
      this.toast.showError('Failed to select photo from library');
    }
  }
}
