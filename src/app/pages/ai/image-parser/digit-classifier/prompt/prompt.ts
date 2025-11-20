import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslocoModule } from '@jsverse/transloco';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { DigitRecognizerService } from '@services/ai/digit-recognizer/digit-recognizer.service'
import { ImageSignalService } from '@services/utils/image-signal.service';

@Component({
  selector: 'app-digit-classifier-prompt',
  templateUrl: './prompt.html',
  styleUrls: ['./prompt.scss'],
  standalone: true,
  imports: [FormsModule, TranslocoModule, IonicModule, CommonModule],
})
export class DigitClassifierPrompt {

  private digitRecognizerService = inject(DigitRecognizerService);
  private imageSignalService = inject(ImageSignalService);

  processedImage = signal<string | null>(null);

  isModelLoaded = computed(() => this.digitRecognizerService.isModelLoaded);
  isDetectionBusy = computed(() => this.digitRecognizerService.isBusy);
  // detectionResults = computed(() => this.digitRecognizerService.detection || []);
  error = computed(() => this.digitRecognizerService.error);

  selectedFile = computed(() => this.imageSignalService.selectedFile());
  isImageSelected = computed(() => this.imageSignalService.isImageSelected());

  protected detectDigits(){

  }
}
