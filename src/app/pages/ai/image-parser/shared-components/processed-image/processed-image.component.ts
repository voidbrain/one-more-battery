import { Component, input } from '@angular/core';

import { TranslocoModule } from '@jsverse/transloco';

@Component({
  selector: 'app-processed-image',
  templateUrl: './processed-image.component.html',
  styleUrls: ['./processed-image.component.scss'],
  standalone: true,
  imports: [TranslocoModule],
})
export class ProcessedImageComponent {
  processedImage = input<string | null>(null);
}
