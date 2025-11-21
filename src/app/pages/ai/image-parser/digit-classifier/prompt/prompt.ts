import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslocoModule } from '@jsverse/transloco';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { DigitExtractResult, DigitRecognizerService } from '@services/ai/digit-recognizer/digit-recognizer.service'
import { ImageService } from '@services/utils/image.service';
import { ProcessedImageComponent } from '../../shared-components/processed-image/processed-image.component';

@Component({
  selector: 'app-digit-classifier-prompt',
  templateUrl: './prompt.html',
  styleUrls: ['./prompt.scss'],
  standalone: true,
  imports: [FormsModule, TranslocoModule, IonicModule, CommonModule, ProcessedImageComponent],
})
export class DigitClassifierPrompt {

  private digitRecognizerService = inject(DigitRecognizerService);
  private ImageService = inject(ImageService);

  processedImage = signal<string | null>(null);

  isModelLoaded = computed(() => this.digitRecognizerService.isModelLoaded);
  isDetectionBusy = computed(() => this.digitRecognizerService.isBusySignal());
  error = computed(() => this.digitRecognizerService.error);
  digitDetectionSignal = computed(() => this.digitRecognizerService.recognition);

  selectedFile = computed(() => this.ImageService.selectedFile());
  isImageSelected = computed(() => this.ImageService.isImageSelected());

  async detectDigits() {
      if (!this.isImageSelected() || !this.isModelLoaded()) return;

      try {
        const img = new Image();
        img.onload = async () => {
          console.log("img.onload")
          // Create canvas and draw image
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            throw new Error('Could not get canvas context');
          }

          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);

          // Try passing canvas element directly (some models expect this)
          const detections: DigitExtractResult[] = await this.digitRecognizerService.recognizeDigits(canvas);
          if (detections && detections.length > 0) {
            console.log('Detection results:', detections);
          } else {
            console.log('No digits detected in the image');
          }

          // Always create processed image, even when no digits detected
          this.createProcessedImageWithOverlays(img, detections || []);
        };
        const file = this.selectedFile();
        if (!file) return;

        img.src = URL.createObjectURL(file);

      } catch (error) {
        console.error('Detection failed:', error);
        // Note: Error state is managed by service, we don't set it here
      }
    }

    private createProcessedImageWithOverlays(
    originalImage: HTMLImageElement,
    detections: DigitExtractResult[],
  ): void {
    // Create new canvas for processed image
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.error('Could not get canvas context for overlay processing');
      return;
    }

    canvas.width = originalImage.width;
    canvas.height = originalImage.height;

    // Draw original image
    ctx.drawImage(originalImage, 0, 0);

    // Draw detection overlays
    detections.forEach((detection, index) => {
      this.drawDigitOverlay(ctx, detection, index);
    });

    // Convert to data URL and set processed image
    const processedDataURL = canvas.toDataURL('image/png');
    console.log('Setting processed image:', processedDataURL.substring(0, 100) + '...');
    this.processedImage.set(processedDataURL);
    console.log('Processed image set, current value:', this.processedImage());
  }

  private drawDigitOverlay(
    ctx: CanvasRenderingContext2D,
    digitResult: DigitExtractResult,
    index: number,
  ): void {
    // For digit recognition, we display text overlays showing the recognized digits
    // Since digit recognition works differently from object detection (no bounding boxes),
    // we position overlays vertically to avoid overlapping

    // Note: The service doesn't provide bounding box coordinates for individual digits
    // so we can't draw bounding boxes like in object detection
    // This is intentional - digit recognition focuses on text extraction, not spatial localization

    const label = digitResult.extractedValue || digitResult.recognizedDigits.map(d => d.digit).join('');
    const confidence = Math.round(digitResult.confidence * 100);

    // Draw label background at the top-center of the canvas, spaced vertically
    ctx.fillStyle = 'rgba(0, 100, 255, 0.8)'; // Blue background for digits
    const labelText = `${label} (${confidence}%)`;
    const fontSize = 18;
    ctx.font = `${fontSize}px Arial`;
    const textMetrics = ctx.measureText(labelText);
    const textHeight = fontSize + 6;

    const canvasWidth = ctx.canvas.width;

    const labelX = Math.max(0, (canvasWidth - textMetrics.width) / 2); // Ensure it doesn't go off-left
    const labelY = 30 + index * (textHeight + 5); // Space overlays vertically

    // Make sure label doesn't go outside bounds
    const labelBgWidth = textMetrics.width + 8;
    const labelBgHeight = textHeight;

    // Ensure background doesn't exceed canvas width
    const clampedBgWidth = Math.min(labelBgWidth, canvasWidth - labelX);
    ctx.fillRect(labelX, labelY, clampedBgWidth, labelBgHeight);

    // Draw label text
    ctx.fillStyle = '#FFFFFF'; // White text
    ctx.fillText(labelText, Math.max(4, labelX + 4), labelY + fontSize);

    // Also log the digit extraction result
    console.log(`Digit extraction ${index + 1}:`, {
      extractedValue: digitResult.extractedValue,
      recognizedDigits: digitResult.recognizedDigits.map(d => ({ digit: d.digit, confidence: d.confidence })),
      confidence: digitResult.confidence,
    });
  }
}
