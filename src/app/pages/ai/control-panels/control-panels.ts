import { Component } from '@angular/core';
import {} from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ImageObjectDetectorPanel } from '@pages/ai/image-parser/object-detector/control-panel/control-panel';
import { TextClassifierControlPanelComponent } from '@pages/ai/text-parser/text-classifier/control-panel/control-panel.component';
import { ColorClassifierControlPanelComponent } from '@pages/ai/image-parser/color-recognizer/control-panel/control-panel.component';
import { DigitClassifierControlPanelComponent } from '@pages/ai/image-parser/digit-classifier/control-panel/control-panel.component';
import { TranscriberPanelComponent } from '@pages/ai/text-parser/stt-transcriber/control-panel/control-panel';

import { TranslocoModule } from '@jsverse/transloco';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-ai-control-panels',
  templateUrl: './control-panels.html',
  standalone: true,
  imports: [
    FormsModule,
    TextClassifierControlPanelComponent,
    ColorClassifierControlPanelComponent,
    DigitClassifierControlPanelComponent,
    ImageObjectDetectorPanel,
    TextClassifierControlPanelComponent,
    ColorClassifierControlPanelComponent,
    DigitClassifierControlPanelComponent,
    TranscriberPanelComponent,
    TranslocoModule,
    IonicModule,
  ],
})
export class AiControlPanelsComponent {}
