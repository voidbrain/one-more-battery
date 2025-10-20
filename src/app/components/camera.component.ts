import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { DigitRecognitionService } from '../services/ai/digit-recognition.service';

@Component({
  selector: 'app-camera',
  imports: [CommonModule],
  standalone: true,
  template: `
    <div class="camera-container">
      <h1>Take a Photo</h1>
      <button (click)="takePhoto()">Capture Photo</button>
      <div *ngIf="photo">
        <h2>Photo Preview:</h2>
        <canvas id="canvas" width="500" height="500"></canvas>
        <div class="controls">
          <label for="threshold">Threshold:</label>
          <input type="range" id="threshold" name="threshold" min="0" max="255" value="127">
          <span id="thresholdValue">127</span>
          <br>
          <label for="erosion">Erosion:</label>
          <input type="range" id="erosion" name="erosion" min="0" max="10" value="8">
          <span contentEditable="true" id="erosionValue">8</span>
          <br>
          <label for="dilation">Dilation:</label>
          <input type="range" id="dilation" name="dilation" min="0" max="10" value="0.5" step="0.1">
          <span id="dilationValue">0.5</span>
          <br>
          <button (click)="predictNumber()">Predict Number</button>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .camera-container {
        text-align: center;
        padding: 20px;
      }
      #canvas {
        border: 1px solid black;
        cursor: crosshair;
      }
      .controls {
        margin-top: 20px;
      }
    `
  ]
})
export class CameraComponent {
  photo: string | undefined | null = null;
  recognizedDigit: number | undefined | null = null;
  colorBand: string | undefined | null = null;
  recognizedDigitConfidence: number | undefined | null = null;

  constructor(private digitRecognitionService: DigitRecognitionService) {}

  async takePhoto() {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera,
      });

      this.photo = image.dataUrl; // Store photo preview

      const myImage = new Image();
      myImage.src = image.webPath ?? image.dataUrl ?? '';

      myImage.onload = () => {
        const canvas = document.getElementById('canvas') as HTMLCanvasElement;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(myImage, 0, 0, canvas.width, canvas.height);
        }
      };
    } catch (error) {
      console.error('Error taking photo:', error);
    }
  }

  predictNumber() {
    const canvas = document.getElementById('canvas') as HTMLCanvasElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const imgElement = new Image();
    imgElement.src = canvas.toDataURL();
    imgElement.onload = async () => {
      const threshold = parseInt((document.getElementById('threshold') as HTMLInputElement).value);
      const erosion = parseInt((document.getElementById('erosion') as HTMLInputElement).value);
      const dilation = parseFloat((document.getElementById('dilation') as HTMLInputElement).value);
      const result = await this.digitRecognitionService.predictDigitsFromImage(imgElement, threshold, erosion, dilation, false);
      this.drawPredictions(canvas, result.predictions);
    };
  }

  private drawPredictions(
    canvas: HTMLCanvasElement,
    predictions: { digit: number; confidence: number; box: number[] }[]
  ) {
    const ctx = canvas.getContext('2d')!;
    ctx.font = '20px Arial';
    ctx.fillStyle = 'red';
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 2;

    for (const pred of predictions) {
      const [x, y, w, h] = pred.box;
      const text = `${pred.digit} (${(pred.confidence * 100).toFixed(2)}%)`;

      ctx.strokeRect(x, y, w, h);
      ctx.fillText(text, x, y - 5);
    }
  }

}
