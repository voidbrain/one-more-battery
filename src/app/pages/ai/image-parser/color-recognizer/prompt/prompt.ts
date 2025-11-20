import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslocoModule } from '@jsverse/transloco';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { ColorClassifierService } from '@services/ai/color-classifier/color-classifier.service';

@Component({
  selector: 'app-color-classifier-prompt',
  templateUrl: './prompt.html',
  styleUrls: ['./prompt.scss'],
  standalone: true,
  imports: [FormsModule, TranslocoModule, IonicModule, CommonModule],
})
export class ColorClassifierPrompt {
  private colorClassifierService = inject(ColorClassifierService);
}
