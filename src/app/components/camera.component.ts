import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { IdentifyBatteryService } from '../services/ai/identify-battery';

@Component({
  selector: 'app-camera',
  imports: [CommonModule],
  standalone: true,
  template: `
    <div class="camera-container">
      <h1>Take a Photo</h1>
      <button (click)="takePhoto()">Capture Photo</button>
      <div *ngIf="photo">
        <!-- <h2>Photo Preview:</h2>
        <img [src]="photo" alt="Captured photo" /> -->
        Photo found
      </div>
    </div>
  `,
  styles: [
    `
      .camera-container {
        text-align: center;
        padding: 20px;
      }
      img {
        margin-top: 20px;
        max-width: 100%;
        border: 1px solid #ccc;
        border-radius: 8px;
      }
      button {
        background-color: #007bff;
        color: white;
        border: none;
        padding: 10px 20px;
        font-size: 16px;
        border-radius: 5px;
        cursor: pointer;
      }
      button:hover {
        background-color: #0056b3;
      }
    `,
  ],
})
export class CameraComponent {
  photo: string | undefined | null = null;

  constructor(
    private identifyBatteryService: IdentifyBatteryService,
  ){

  }

  async takePhoto() {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera,
      });

      const myImage = new Image(224,224);
      myImage.src = image.webPath ?? '';

      this.identifyBatteryService.processPhoto(myImage);
    } catch (error) {
      console.error('Error taking photo:', error);
    }
  }
}
