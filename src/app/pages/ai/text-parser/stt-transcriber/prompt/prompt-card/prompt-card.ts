import { Component } from '@angular/core';
import { TranscriberComponent } from './prompt/prompt';

@Component({
  selector: 'app-stt-transcriber-prompt-card',
  templateUrl: './prompt-card.html',
  standalone: true,
  imports: [TranscriberComponent],
})
export class TranscriberCard {
  onTranscriptionComplete(transcribedText: string) {
    console.log('Transcribed text:', transcribedText);
    // TODO: Handle the completed transcription as needed by parent components
  }
}
