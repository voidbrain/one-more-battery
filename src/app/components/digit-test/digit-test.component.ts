import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
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
export class DigitTestComponent implements OnInit {
  @ViewChild('canvas', { static: false }) canvasRef!: ElementRef<HTMLCanvasElement>;

  base64Image: string | undefined;
  imageUrl: string = 'assets/test-images/IMG_2451.png';
  predictions: { digit: number; confidence: number; box: number[] }[] | undefined;
  processedImageBase64: string | undefined;
  threshold: number = 60;
  erosion: number = 3;
  dilation: number = 1;

  constructor(private digitRecognitionService: DigitRecognitionService) {}

  ngOnInit() {
    this.loadImage();
  }

  async loadImage() {
    if (!this.imageUrl) {
      console.error('No image URL provided.');
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

      this.drawProcessedImage();
    } catch (error) {
      console.error('Error recognizing digit:', error);
      this.predictions = undefined;
      this.processedImageBase64 = undefined;
    }
  }

  private drawProcessedImage() {
    if (!this.processedImageBase64 || !this.canvasRef) return;

    const canvas = this.canvasRef.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.src = this.processedImageBase64;
  }
}
