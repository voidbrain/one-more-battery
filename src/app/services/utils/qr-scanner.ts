import { Injectable, inject } from '@angular/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { BrowserMultiFormatReader, NotFoundException } from '@zxing/library';
import { ToastService } from '../ui/toast';

@Injectable({
  providedIn: 'root',
})
export class QrScannerService {
  private toast = inject(ToastService);
  private codeReader = new BrowserMultiFormatReader();

  async scanFromCamera(): Promise<string | null> {
    try {
      // Request camera permission and capture image
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Prompt,
        width: 800,
        height: 800,
      });

      // Create HTMLImageElement from data URL
      const img = new Image();
      img.src = image.dataUrl!;

      // Wait for image to load
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      // Decode QR code
      const result = await this.codeReader.decodeFromImage(img);

      return result.getText();
    } catch (error) {
      if (error instanceof NotFoundException) {
        this.toast.showError('No QR code found in the image');
      } else {
        console.error('Camera scan error:', error);
        this.toast.showError('Failed to scan QR code from camera');
      }
      return null;
    }
  }

  async scanFromLibrary(): Promise<string | null> {
    try {
      // Request image from photo library
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Photos,
        width: 800,
        height: 800,
      });

      // Create HTMLImageElement from data URL
      const img = new Image();
      img.src = image.dataUrl!;

      // Wait for image to load
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      // Decode QR code
      const result = await this.codeReader.decodeFromImage(img);

      return result.getText();
    } catch (error) {
      if (error instanceof NotFoundException) {
        this.toast.showError('No QR code found in the selected image');
      } else {
        console.error('Library scan error:', error);
        this.toast.showError('Failed to scan QR code from library');
      }
      return null;
    }
  }

  // Photo taking methods (without QR decoding)
  async takePhotoFromCamera(): Promise<{ dataUrl: string; format: string } | null> {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Prompt,
        width: 1200,
        height: 1200,
      });

      return {
        dataUrl: image.dataUrl!,
        format: image.format,
      };
    } catch (error) {
      console.error('Camera photo error:', error);
      throw error;
    }
  }

  async takePhotoFromLibrary(): Promise<{ dataUrl: string; format: string } | null> {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Photos,
        width: 1200,
        height: 1200,
      });

      return {
        dataUrl: image.dataUrl!,
        format: image.format,
      };
    } catch (error) {
      console.error('Library photo error:', error);
      throw error;
    }
  }

  // Clean up resources
  destroy(): void {
    this.codeReader.reset();
  }
}
