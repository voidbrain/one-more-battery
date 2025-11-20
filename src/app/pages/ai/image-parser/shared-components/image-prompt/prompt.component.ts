import { Component, inject, signal, computed } from '@angular/core';
import { DetectorService } from '@services/ai/image-object-detector/detector.service';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { TranslocoModule } from '@jsverse/transloco';
import { DetectionResult } from '@interfaces/index';
import { ImageUploadFormComponent } from '@pages/ai/image-parser/shared-components/image-upload-form/image-upload-form';
import { SelectedImageComponent } from '@pages/ai/image-parser/shared-components/selected-image/selected-image.component';
import { ProcessedImageComponent } from '@pages/ai/image-parser/shared-components/processed-image/processed-image.component';

@Component({
  selector: 'app-image-prompt',
  templateUrl: './prompt.component.html',
  styleUrls: ['./prompt.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    TranslocoModule,
    ImageUploadFormComponent,
    SelectedImageComponent,
    ProcessedImageComponent,
  ],
})
export class ImageUploadComponent {
  // Detection state - computed signals for computed values, writable signals for mutable state
  isDetectorLoaded = computed(() => this.imageObjectDetectorService.isModelLoaded);
  isDetectionInProgress = signal(false);
  selectedImageSignal = signal(false);
  isImageLoading = signal(false);
  processedImage = signal<string | null>(null);
  detectionResults = signal<DetectionResult[]>([]);
  error = signal<string | null>(null);

  // Image handling
  selectedImage: string | null = null;
  imageFile: File | null = null;

  private imageObjectDetectorService = inject(DetectorService);

  constructor() {
    // Initialize other signal values
    this.isDetectionInProgress.set(this.imageObjectDetectorService.isBusy);
    this.detectionResults.set(this.imageObjectDetectorService.detection || []);
    this.error.set(this.imageObjectDetectorService.error);
  }

  onImageSelected(file: File) {
    if (file) {
      this.imageFile = file;
      this.isImageLoading.set(true);

      // Create object URL immediately for instant preview
      this.selectedImage = URL.createObjectURL(file);

      // Also read as data URL for consistency (optional cleanup)
      const reader = new FileReader();
      reader.onload = (e) => {
        // Replace object URL with data URL when ready
        URL.revokeObjectURL(this.selectedImage!);
        this.selectedImage = e.target?.result as string;
        this.isImageLoading.set(false);
        this.selectedImageSignal.set(true);
      };
      reader.readAsDataURL(file);
    }
  }

  async detectObjects() {
    if (!this.imageFile || !this.isDetectorLoaded) return;

    try {
      const img = new Image();
      img.onload = async () => {
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
        const detections = await this.imageObjectDetectorService.detectObjects(canvas);
        if (detections) {
          console.log('Detection results:', detections);

          // Create processed image with overlays
          this.createProcessedImageWithOverlays(img, detections);
        }
      };
      img.src = this.selectedImage!;
    } catch (error) {
      console.error('Detection failed:', error);
      this.error.set('Detection failed');
    }
  }

  clearImage() {
    // Revoke object URL to free memory
    if (this.selectedImage && this.selectedImage.startsWith('blob:')) {
      URL.revokeObjectURL(this.selectedImage);
    }

    this.selectedImage = null;
    this.imageFile = null;
    this.detectionResults.set([]);
    this.processedImage.set(null);
    this.error.set(null);
    this.isImageLoading.set(false);
    this.selectedImageSignal.set(false);

    // Reset file input to allow selecting the same file again
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  private createProcessedImageWithOverlays(
    originalImage: HTMLImageElement,
    detections: DetectionResult[],
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
      this.drawDetectionOverlay(ctx, detection, index);
    });

    // Convert to data URL and set processed image
    const processedDataURL = canvas.toDataURL('image/png');
    console.log('Setting processed image:', processedDataURL.substring(0, 100) + '...');
    this.processedImage.set(processedDataURL);
    console.log('Processed image set, current value:', this.processedImage());
  }

  private drawDetectionOverlay(
    ctx: CanvasRenderingContext2D,
    detection: DetectionResult,
    index: number,
  ): void {
    // Handle both array format [x1, y1, x2, y2] and object format {xmin, ymin, xmax, ymax}
    let x1: number, y1: number, x2: number, y2: number;

    if (Array.isArray(detection.box) && detection.box.length === 4) {
      [x1, y1, x2, y2] = detection.box;
    } else if (typeof detection.box === 'object' && detection.box !== null) {
      const boxObj = detection.box as unknown as Record<string, number>;
      x1 = boxObj['xmin'] || boxObj['x1'] || 0;
      y1 = boxObj['ymin'] || boxObj['y1'] || 0;
      x2 = boxObj['xmax'] || boxObj['x2'] || 0;
      y2 = boxObj['ymax'] || boxObj['y2'] || 0;
    } else {
      console.error('Invalid box format:', detection.box);
      return;
    }

    const label = detection.label;
    const score = Math.round(detection.score * 100);
    const boxWidth = x2 - x1;
    const boxHeight = y2 - y1;

    // Draw rectangle
    ctx.strokeStyle = '#FF0000'; // Red border
    ctx.lineWidth = 3;
    ctx.strokeRect(x1, y1, boxWidth, boxHeight);

    // Draw label background
    ctx.fillStyle = 'rgba(255, 0, 0, 0.8)';
    const labelText = `${label} (${score}%)`;
    const fontSize = 16;
    ctx.font = `${fontSize}px Arial`;
    const textMetrics = ctx.measureText(labelText);
    const textHeight = fontSize + 4;

    const labelX = Math.max(x1, 0);
    const labelY = y1 - textHeight - 5;

    // Make sure label doesn't go outside bounds
    const labelBgWidth = textMetrics.width + 8;
    const labelBgHeight = textHeight;

    ctx.fillRect(labelX, labelY, labelBgWidth, labelBgHeight);

    // Draw label text
    ctx.fillStyle = '#FFFFFF'; // White text
    ctx.fillText(labelText, labelX + 4, labelY + fontSize);

    // Also log the detection in the example format for verification
    console.log(`Detection ${index + 1}:`, {
      box: { xmin: x1, ymin: y1, xmax: x2, ymax: y2 },
      label: label,
      score: detection.score,
    });
  }
}
