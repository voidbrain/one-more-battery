import { Component, computed, inject } from '@angular/core';
import { IonicModule } from '@ionic/angular';

import { TranslocoModule } from '@jsverse/transloco';
import { DetectorService } from '@services/ai/image-object-detector/detector.service';

@Component({
  selector: 'app-detection-prompt-form',
  templateUrl: './detection-prompt-form.html',
  styleUrls: ['./detection-prompt-form.scss'],
  standalone: true,
  imports: [IonicModule, TranslocoModule],
})
export class DetectionPromptPanelComponent {
  // Project signals from detector service (using signals only, no inputs/outputs)
  isModelLoaded = computed(() => this.detectorService.isModelLoaded);
  isDetectionBusy = computed(() => this.detectorService.isBusy);
  detectionResults = computed(() => this.detectorService.detection || []);
  error = computed(() => this.detectorService.error);

  private detectorService = inject(DetectorService);
}
