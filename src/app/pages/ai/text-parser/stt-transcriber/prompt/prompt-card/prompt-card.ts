import { Component, Input } from '@angular/core';
import { TranscriberComponent } from '@pages/ai/text-parser/stt-transcriber/prompt/prompt-card/prompt/prompt';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-stt-transcriber-prompt-card',
  templateUrl: './prompt-card.html',
  styleUrl: './prompt-card.scss',
  standalone: true,
  imports: [TranscriberComponent, CommonModule],
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
