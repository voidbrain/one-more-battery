import { Component, inject, signal, computed } from '@angular/core';
import { DetectorService } from '@services/ai/object-detector/detector.service';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { TranslocoModule } from '@jsverse/transloco';
import { DetectionResult } from '@interfaces/index';

@Component({
  selector: 'app-object-detector',
  templateUrl: './detector.component.html',
  styleUrls: ['./detector.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, TranslocoModule],
})
export class DetectorComponent {
  // Detection state - reactive computed signal from service
  isDetectorLoaded = computed(() => this.detectorService.isModelLoaded);

  isDetectionInProgress = signal(false);
  detectionResults = signal<DetectionResult[]>([]);
  error = signal<string | null>(null);

  // Image handling
  selectedImage: string | null = null;
  imageFile: File | null = null;
  isImageLoading = signal(false);

  private detectorService = inject(DetectorService);

  constructor() {
    // Initialize other signal values
    this.isDetectionInProgress.set(this.detectorService.isBusy);
    this.detectionResults.set(this.detectorService.detection || []);
    this.error.set(this.detectorService.error);
  }



  onImageSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

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
        const detections = await this.detectorService.detectObjects(canvas);
        if (detections) {
          console.log('Detection results:', detections);
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
    this.error.set(null);
    this.isImageLoading.set(false);

    // Reset file input to allow selecting the same file again
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }


}
