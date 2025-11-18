import { Component, Input } from '@angular/core';
import { TranscriberComponent } from '@pages/ai/stt-transcriber/stt-transcriber-output/transcriber.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-transcriber-card',
  templateUrl: './transcriber-card.html',
  styleUrl: './transcriber-card.scss',
  standalone: true,
  imports: [
    TranscriberComponent,
    CommonModule,
  ],
})
export class TranscriberCard {
  @Input() isTranscribeEnabled = false;
  @Input() audioBlob?: Blob;

  setTranscriptionInProgress(isInProgress: boolean) {
    // Handle transcription progress
    console.log('Transcription in progress:', isInProgress);
  }

  onTranscriptionComplete(transcribedText: string) {
    console.log('Transcribed text:', transcribedText);
  }
}
