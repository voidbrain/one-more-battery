import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslocoModule } from '@jsverse/transloco';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { ColorClassifierService } from '@services/ai/color-classifier/color-classifier.service';
import { ImageSignalService } from '@services/utils/image-signal.service';

@Component({
  selector: 'app-color-classifier-prompt',
  templateUrl: './prompt.html',
  styleUrls: ['./prompt.scss'],
  standalone: true,
  imports: [FormsModule, TranslocoModule, IonicModule, CommonModule],
})
export class ColorClassifierPrompt {
  private colorClassifierService = inject(ColorClassifierService);
  private imageSignalService = inject(ImageSignalService);

  processedImage = signal<string | null>(null);

  isModelLoaded = computed(() => this.colorClassifierService.isModelLoaded);
  isDetectionBusy = computed(() => this.colorClassifierService.isBusy);
  // detectionResults = computed(() => this.colorClassifierService.detection || []);
  error = computed(() => this.colorClassifierService.error);

  selectedFile = computed(() => this.imageSignalService.selectedFile());
  isImageSelected = computed(() => this.imageSignalService.isImageSelected());
  colorDetectionSignal = computed(() => this.colorClassifierService.colorDetectionSignal())

  protected async recognizeColor(){
    const file = this.selectedFile();  // ✅ Call signal to get File
    if (!file) {
      console.log("not found");
      return;                  // ✅ Handle null case
    }
    console.log("file found")
    const img = new Image();
    img.onload = async () => {
      // Wait for image to load, then call detectStripes
      try {
        console.log("detectStripes")
        await this.colorClassifierService.detectStripes(img);
        // Handle results if needed
      } catch (error) {
        console.error('Color recognition failed:', error);
      }
    };
    img.src = URL.createObjectURL(file);  // ✅ Now File is correctly passed
  }
}
