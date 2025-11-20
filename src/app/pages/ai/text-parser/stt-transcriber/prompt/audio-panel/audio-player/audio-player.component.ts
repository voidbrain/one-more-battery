import { Component, input } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';
import { IonCard, IonCardContent } from '@ionic/angular/standalone';

@Component({
  selector: 'app-audio-player',
  templateUrl: './audio-player.component.html',
  standalone: true,
  imports: [IonCardContent, TranslocoModule, IonCard],
})
export class AudioPlayerComponent {
  audioUrl = input.required<string>();
}
