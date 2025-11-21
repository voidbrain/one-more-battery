import { Injectable, signal, WritableSignal } from '@angular/core';

export interface DigitRecognitionResult {
  digit: number;
  confidence: number;
}

export interface DigitExtractResult {
  recognizedDigits: DigitRecognitionResult[];
  extractedValue: string;
  confidence: number;
}

@Injectable({
  providedIn: 'root',
})
export class DigitRecognizerService {
  // digit recognition process
  public isBusySignal: WritableSignal<boolean> = signal<boolean>(false);
  public errorSignal: WritableSignal<string | null> = signal<string | null>(null);
  public recognitionSignal: WritableSignal<DigitExtractResult[] | null> = signal<
    DigitExtractResult[] | null
  >(null);

  // downloading model files process - simplified for worker approach
  public isModelLoadingSignal: WritableSignal<boolean> = signal<boolean>(false);
  public isModelLoadedSignal: WritableSignal<boolean> = signal<boolean>(false); // Always ready for worker approach

  // Web Worker
  private worker: Worker | null = null;



  private initializeWorker(): void {
    try {
      this.worker = new Worker(new URL('./digit-recognition.worker.ts', import.meta.url), {
        type: 'module'
      });

      this.worker.onmessage = (event) => {
        const { type, data } = event.data;

        switch (type) {
          case 'WORKER_READY':
            console.log('[DigitRecognizerService] Web worker ready ✅');
            this.isModelLoadedSignal.set(true);
            break;

          case 'RECOGNIZE_DIGITS_SUCCESS':
            this.recognitionSignal.set(data);
            this.errorSignal.set(null);
            break;

          case 'RECOGNIZE_DIGITS_ERROR':
            this.errorSignal.set(data.error);
            console.error('Worker error:', data.error);
            break;
        }

        // Always clear busy state after worker responds
        this.isBusySignal.set(false);
      };

      this.worker.onerror = (error) => {
        console.error('Worker error:', error);
        this.errorSignal.set('Digit recognition worker error');
        this.isBusySignal.set(false);
      };
    } catch (error) {
      console.error('Failed to initialize worker:', error);
      this.errorSignal.set('Failed to initialize digit recognition worker');
      this.isModelLoadedSignal.set(false);
    }
  }

  // Getters for accessing signals in templates or codes
  get recognition() {
    return this.recognitionSignal();
  }

  get isBusy() {
    return this.isBusySignal();
  }

  get isModelLoading() {
    return this.isModelLoadingSignal();
  }

  get isModelLoaded() {
    return this.isModelLoadedSignal();
  }

  get error() {
    return this.errorSignal();
  }

  // Simplified load method - worker is always ready
  public async load(): Promise<void> {
    this.initializeWorker();
    console.log('[DigitRecognizerService] Service loaded (using web worker) ✅');
  }

  async recognizeDigits(
    imageElement: HTMLImageElement | HTMLCanvasElement,
  ): Promise<DigitExtractResult[]> {
    if (!this.worker) {
      throw new Error('Web worker not initialized');
    }

    try {
      this.isBusySignal.set(true);
      this.errorSignal.set(null);
      this.recognitionSignal.set(null);

      // Convert image to createImageBitmap for transfer
      const imageBitmap = await createImageBitmap(imageElement);

      this.worker.postMessage({
        type: 'RECOGNIZE_DIGITS',
        data: { imageElement: imageBitmap }
      }, [imageBitmap]);

      // Return a promise that resolves when worker responds
      return new Promise<DigitExtractResult[]>((resolve, reject) => {
        const messageHandler = (event: MessageEvent) => {
          const { type, data } = event.data;

          if (type === 'RECOGNIZE_DIGITS_SUCCESS') {
            this.worker!.removeEventListener('message', messageHandler);
            this.recognitionSignal.set(data);
            this.isBusySignal.set(false);
            resolve(data);
          } else if (type === 'RECOGNIZE_DIGITS_ERROR') {
            this.worker!.removeEventListener('message', messageHandler);
            this.errorSignal.set(data.error);
            this.isBusySignal.set(false);
            reject(new Error(data.error));
          }
        };

        this.worker!.addEventListener('message', messageHandler);

        // Timeout after 30 seconds
        setTimeout(() => {
          this.worker!.removeEventListener('message', messageHandler);
          const timeoutError = 'Digit recognition timed out';
          this.errorSignal.set(timeoutError);
          this.isBusySignal.set(false);
          reject(new Error(timeoutError));
        }, 30000);
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Digit recognition failed';
      this.errorSignal.set(errorMessage);
      this.isBusySignal.set(false);
      throw error;
    }
  }

  // Dispose of resources
  async unload(): Promise<void> {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
    this.isModelLoadedSignal.set(false);
    console.log('[DigitRecognizerService] Digit recognizer unloaded ✅');
  }
}
