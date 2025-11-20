import { Component, input, output } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { TranslocoModule } from '@jsverse/transloco';

@Component({
  selector: 'app-detection-prompt-form',
  templateUrl: './detection-prompt-form.html',
  styleUrls: ['./detection-prompt-form.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, TranslocoModule],
})
export class DetectionPromptPanelComponent {
  selectedImage = input<string | null>(null);
  isDetectorLoaded = input<boolean>(false);
  isDetectionInProgress = input<boolean>(false);

  detect = output<void>();
}
