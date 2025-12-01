import { Component, inject, output, signal } from '@angular/core';
import { NotificationService } from '@services/ui/notification.service';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { IonCard, IonCardContent, IonButton, IonIcon } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-stt-transcriber-prompt',
  templateUrl: './prompt.html',
  standalone: true,
  imports: [IonCardContent, TranslocoModule, IonCard, IonButton, IonIcon, CommonModule],
})
export class TranscriberComponent {
  transcriptionComplete = output<string>();
  isTranscriptionInProgress = output<boolean>();

  protected isRecording = signal(false);
  protected isProcessing = signal(false);
  protected transcribedText = signal('');
  protected interimText = signal('');
  protected errorMessage = signal('');

  private recognition: SpeechRecognition | null = null;
  private notificationService = inject(NotificationService);
  private transloco = inject(TranslocoService);

  constructor() {
    this.initializeSpeechRecognition();
  }

  private initializeSpeechRecognition(): void {
    // Check if Web Speech API is supported
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      this.errorMessage.set('Speech recognition is not supported in this browser');
      this.notificationService.showError('Speech recognition not supported');
      return;
    }

    // Initialize speech recognition
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    this.recognition = new SpeechRecognition();

    if (!this.recognition) {
      this.errorMessage.set('Failed to initialize speech recognition');
      return;
    }

    // Configure recognition settings
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = 'en-US'; // Default language, can be made configurable

    // Event handlers
    this.recognition.onstart = () => {
      this.isRecording.set(true);
      this.isTranscriptionInProgress.emit(true);
      this.transcribedText.set('');
      this.interimText.set('');
      this.errorMessage.set('');
      this.notificationService.showInfo('Listening...');
    };

    this.recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      this.transcribedText.update(text => text + finalTranscript);
      this.interimText.set(interimTranscript);
    };

    this.recognition.onend = () => {
      this.isRecording.set(false);
      this.isTranscriptionInProgress.emit(false);
      this.isProcessing.set(false);

      // Combine final and interim text
      const finalText = (this.transcribedText() + this.interimText()).trim();
      if (finalText) {
        this.transcriptionComplete.emit(finalText);
        this.notificationService.showInfo('Speech recognition completed');
      }
    };

    this.recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      this.errorMessage.set(`Speech recognition error: ${event.error}`);
      this.isRecording.set(false);
      this.isProcessing.set(false);
      this.isTranscriptionInProgress.emit(false);
      this.notificationService.showError(`Speech recognition error: ${event.error}`);
    };
  }

  startRecording(): void {
    if (!this.recognition) {
      this.notificationService.showError('Speech recognition not available');
      return;
    }

    try {
      this.recognition.start();
    } catch (error) {
      this.errorMessage.set('Failed to start speech recognition');
      this.notificationService.showError('Failed to start recording');
    }
  }

  stopRecording(): void {
    if (this.recognition && this.isRecording()) {
      this.recognition.stop();
    }
  }
}
