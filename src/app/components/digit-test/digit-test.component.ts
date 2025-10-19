import { Component, AfterViewInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DigitRecognitionService } from '../../services/ai/digit-recognition.service';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-digit-test',
  templateUrl: './digit-test.component.html',
  styleUrls: ['./digit-test.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule],
})
export class DigitTestComponent implements OnDestroy {
  @ViewChild('canvas', { static: false }) canvasRef!: ElementRef<HTMLCanvasElement>;

  private video!: HTMLVideoElement;
  private overlay!: HTMLCanvasElement;
  private ctx!: CanvasRenderingContext2D;
  private frameInterval: any;
  private stream?: MediaStream;
  isRunning = false;

  base64Image: string | undefined;
  imageUrl: string = 'assets/test-images/IMG_2451.png';
  // imageUrl: string = 'assets/test-images/number.png'; // Default image URL
  predictions: { id: number; digit: number; confidence: number; box: number[]; image: string }[] | undefined;
  processedImageBase64: string | undefined;
  threshold: number = 50;
  erosion: number = 5;
  dilation: number = 5;

  constructor(private digitRecognitionService: DigitRecognitionService) {}

  async loadImage() {
    if (!this.imageUrl) {
      console.error('No image URL provided.');
      return;
    }
    if (!this.canvasRef) {
      console.error('No canvas reference available.');
      return;
    }
    try {
      const response = await fetch(this.imageUrl);
      const blob = await response.blob();
      const reader = new FileReader();
      reader.onload = async (event) => {
        this.base64Image = event.target?.result as string;
        this.recognize();
      };
      reader.readAsDataURL(blob);
    } catch (error) {
      console.error('Error loading image:', error);
      this.base64Image = undefined;
      this.predictions = undefined;
      this.processedImageBase64 = undefined;
    }
  }

  async recognize() {
    if (!this.base64Image) {
      console.error('No image source provided for recognition.');
      return;
    }
    try {
      const result = await this.digitRecognitionService.recognizeDigitFromBase64(
        this.base64Image,
        this.threshold,
        this.erosion,
        this.dilation
      );
      this.predictions = result.predictions;
      this.processedImageBase64 = result.processedImageBase64;
      console.log('recognize - processedImageBase64 set:', !!this.processedImageBase64);
      console.log('recognize - canvasRef:', !!this.canvasRef);

      // If canvasRef is available (meaning ngAfterViewInit has run), draw immediately.
      // Otherwise, ngAfterViewInit will handle the initial draw once the view is ready.
      if (this.canvasRef) {
        console.log('recognize: canvasRef available, calling drawProcessedImage.');
        this.drawProcessedImage();
      } else {
        console.log('recognize: canvasRef not available yet.');
      }
    } catch (error) {
      console.error('Error recognizing digit:', error);
      this.predictions = undefined;
      this.processedImageBase64 = undefined;
    }
  }

  private drawProcessedImage() {
    console.log('drawProcessedImage called');
    if (!this.processedImageBase64 || !this.canvasRef) {
      console.log('Missing processedImageBase64 or canvasRef', { processedImageBase64: !!this.processedImageBase64, canvasRef: !!this.canvasRef });
      return;
    }

    const canvas = this.canvasRef.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.error('Could not get 2D context for canvas.');
      return;
    }

    // Set initial canvas dimensions to avoid it being invisible before image loads
    canvas.width = 600; // Default width, adjust as needed
    canvas.height = 400; // Default height, adjust as needed
    console.log('Canvas initialized with default dimensions:', canvas.width, canvas.height);
    console.log('Processed Image Base64 (truncated):', this.processedImageBase64.substring(0, 100) + '...');


    const img = new Image();
    img.onload = () => {
      console.log('Image loaded successfully. Intrinsic image dimensions:', img.width, img.height);
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas before drawing new image
      ctx.drawImage(img, 0, 0);
      console.log('Image drawn on canvas. Canvas dimensions after drawing:', canvas.width, canvas.height);

      if (this.predictions) {
        this.predictions.forEach(prediction => {
          const [x, y, width, height] = prediction.box;

          // Draw bounding box
          ctx.strokeStyle = 'red';
          ctx.lineWidth = 2;
          ctx.strokeRect(x, y, width, height);

          // Draw digit and confidence
          ctx.fillStyle = 'red';
          ctx.font = '40px Arial';
          ctx.fillText(`${prediction.id}: ${prediction.digit} (${(prediction.confidence * 100).toFixed(2)}%) ${width}x${height}`, x, y > 10 ? y - 5 : y + 15);
        });
      }
    };
    img.src = this.processedImageBase64;
  }

  async startCamera() {
    if (this.isRunning) return;

    this.video = document.getElementById('webcam') as HTMLVideoElement;
    this.overlay = document.getElementById('overlay') as HTMLCanvasElement;
    this.ctx = this.overlay.getContext('2d')!;
    this.overlay.width = this.video.clientWidth;
    this.overlay.height = this.video.clientHeight;

    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      this.video.srcObject = this.stream;
      this.isRunning = true;

      // Process frames periodically
      this.frameInterval = setInterval(() => this.processFrame(), 300);
    } catch (err) {
      console.error('❌ Camera access error:', err);
      alert('Unable to access camera: ' + err);
    }
  }

  private async processFrame() {
    if (!this.video || this.video.readyState !== this.video.HAVE_ENOUGH_DATA) return;

    const w = this.overlay.width;
    const h = this.overlay.height;
    this.ctx.drawImage(this.video, 0, 0, w, h);

    // Extract frame data
    const base64Frame = this.overlay.toDataURL('image/png');
    this.base64Image = base64Frame;
    this.recognize();

    // Example: process with your DigitRecognitionService (optional)
    // const result = await this.digitRecognitionService.recognizeDigitFromBase64(base64Frame, 128, 1, 1);
    // this.drawPredictions(result.predictions);
  }

  stopCamera() {
    if (!this.isRunning) return;

    clearInterval(this.frameInterval);
    if (this.stream) {
      this.stream.getTracks().forEach((t) => t.stop());
      this.stream = undefined;
    }

    this.ctx.clearRect(0, 0, this.overlay.width, this.overlay.height);
    this.video.srcObject = null;
    this.isRunning = false;
  }

  ngOnDestroy() {
    this.stopCamera();
  }
}
