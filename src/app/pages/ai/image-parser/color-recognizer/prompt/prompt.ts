import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslocoModule } from '@jsverse/transloco';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { ColorClassifierService } from '@services/ai/color-classifier/color-classifier.service';
import { ImageService } from '@services/utils/image.service';
import { ProcessedImageComponent } from '../../shared-components/processed-image/processed-image.component';
import { StripeDetectionResult, StripeResult } from '@interfaces/index';

@Component({
  selector: 'app-color-classifier-prompt',
  templateUrl: './prompt.html',
  styleUrls: ['./prompt.scss'],
  standalone: true,
  imports: [FormsModule, TranslocoModule, IonicModule, CommonModule, ProcessedImageComponent]
})

export class ColorClassifierPrompt {
  private colorClassifierService = inject(ColorClassifierService);
  private ImageService = inject(ImageService);

  processedImage = signal<string | null>(null);

  isModelLoaded = computed(() => this.colorClassifierService.isModelLoaded);
  isDetectionBusy = computed(() => this.colorClassifierService.isBusy);
  // detectionResults = computed(() => this.colorClassifierService.detection || []);
  error = computed(() => this.colorClassifierService.error);

  selectedFile = computed(() => this.ImageService.selectedFile());
  isImageSelected = computed(() => this.ImageService.isImageSelected());
  colorDetectionSignal = computed(() => this.colorClassifierService.colorDetectionSignal())

  // protected async recognizeColor(){
  //   const file = this.selectedFile();  // ✅ Call signal to get File
  //   if (!file) {
  //     console.log("not found");
  //     return;                  // ✅ Handle null case
  //   }
  //   console.log("file found")
  //   const img = new Image();
  //   img.onload = async () => {
  //     // Wait for image to load, then call detectStripes
  //     try {
  //       console.log("detectStripes")
  //       await this.colorClassifierService.detectStripes(img);
  //       // Handle results if needed
  //     } catch (error) {
  //       console.error('Color recognition failed:', error);
  //     }
  //   };
  //   img.src = URL.createObjectURL(file);  // ✅ Now File is correctly passed
  // }

  async recognizeColor() {
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
        const detections: StripeDetectionResult[] = await this.colorClassifierService.detectStripes(canvas);
        if (detections && detections.length > 0) {
          console.log('Detection results:', detections);

          // Create processed image with overlays - flatten all stripes from all detections
          const allStripes = detections.flatMap(detection => detection.stripes);
          this.createProcessedImageWithOverlays(img, allStripes);
        }
      };
      const file = this.selectedFile();
      if (!file) return;

      img.src = URL.createObjectURL(file);

    } catch (error) {
      console.error('Detection failed:', error);
      // Note: Error state is managed by service, we don't set it here
    }
  }

  getColorClass(color: string): string {
    const colorMap: Record<string, string> = {
      'red': 'danger',
      'yellow': 'warning',
      'blue': 'primary',
      'green': 'success',
      'black': 'dark',
      'unknown': 'medium'
    };
    return colorMap[color.toLowerCase()] || 'medium';
  }

  private createProcessedImageWithOverlays(
      originalImage: HTMLImageElement,
      detections: StripeResult[],
    ): void {
      console.log("createProcessedImageWithOverlays")
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
        this.drawStripeOverlay(ctx, detection, index);
      });

      // Convert to data URL and set processed image
      const processedDataURL = canvas.toDataURL('image/png');
      console.log('Setting processed image:', processedDataURL.substring(0, 100) + '...');
      this.processedImage.set(processedDataURL);
      console.log('Processed image set, current value:', this.processedImage());
    }

    private drawStripeOverlay(
      ctx: CanvasRenderingContext2D,
      stripe: StripeResult,
      index: number,
    ): void {
      const { position, color, isHorizontal } = stripe;

      // Draw bounding rectangle
      ctx.strokeStyle = '#00FF00'; // Green for stripes
      ctx.lineWidth = 2;
      ctx.strokeRect(position.x, position.y, position.width, position.height);

      // Draw label background
      ctx.fillStyle = 'rgba(0, 255, 0, 0.8)';
      const directionText = isHorizontal ? 'Horizontal' : 'Vertical';
      const labelText = `${color.color} (${directionText}) ${Math.round(color.confidence * 100)}%`;
      const fontSize = 14;
      ctx.font = `${fontSize}px Arial`;
      const textMetrics = ctx.measureText(labelText);
      const textHeight = fontSize + 4;

      const labelX = position.x;
      const labelY = position.y - textHeight - 5;

      // Make sure label doesn't go outside bounds
      const labelBgWidth = textMetrics.width + 8;

      ctx.fillRect(labelX, labelY, labelBgWidth, textHeight);

      // Draw label text
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText(labelText, labelX + 4, labelY + fontSize);

      // Log the stripe detection
      console.log(`Stripe ${index + 1}:`, {
        position,
        color: color.color,
        confidence: color.confidence,
        isHorizontal,
      });
    }
}
