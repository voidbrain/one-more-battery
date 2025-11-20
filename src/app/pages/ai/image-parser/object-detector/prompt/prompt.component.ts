import { Component, inject, signal, computed } from '@angular/core';
import { DetectorService } from '@services/ai/image-object-detector/detector.service';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { TranslocoModule } from '@jsverse/transloco';
import { DetectionResult } from '@interfaces/index';
import { DetectionPromptPanelComponent } from '@pages/ai/image-parser/shared-components/detection-prompt-panel/detection-prompt-form';
import { ImageSignalService } from '@services/utils/image-signal.service';

@Component({
  selector: 'app-image-object-detector-prompt',
  templateUrl: './prompt.component.html',
  styleUrls: ['./prompt.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, TranslocoModule, DetectionPromptPanelComponent],
})
export class ImageObjectDetectorComponent {
  private imageObjectDetectorService = inject(DetectorService);
  private imageSignalService = inject(ImageSignalService);

  processedImage = signal<string | null>(null);

  isModelLoaded = computed(() => this.imageObjectDetectorService.isModelLoaded);
  isDetectionBusy = computed(() => this.imageObjectDetectorService.isBusy);
  detectionResults = computed(() => this.imageObjectDetectorService.detection || []);
  error = computed(() => this.imageObjectDetectorService.error);

  selectedFile = computed(() => this.imageSignalService.selectedFile());
  isImageSelected = computed(() => this.imageSignalService.isImageSelected());

  async detectObjects() {
    if (!this.isImageSelected() || !this.isModelLoaded()) return;

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
