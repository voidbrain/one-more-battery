import { Injectable, signal, WritableSignal } from '@angular/core';
import { StripeDetectionResult } from '@interfaces/index';

@Injectable({
  providedIn: 'root',
})
export class ColorClassifierService {
  // stripe detection process
  public isBusySignal: WritableSignal<boolean> = signal<boolean>(false);
  public errorSignal: WritableSignal<string | null> = signal<string | null>(null);
  public colorDetectionSignal: WritableSignal<StripeDetectionResult[] | null> = signal<
    StripeDetectionResult[] | null
  >(null);

  // Simplified for worker approach
  public isModelLoadingSignal: WritableSignal<boolean> = signal<boolean>(false);
  public isModelLoadedSignal: WritableSignal<boolean> = signal<boolean>(false); // Always ready for worker approach

  // Web Worker
  private worker: Worker | null = null;



  private initializeWorker(): void {
    try {
      this.worker = new Worker(new URL('./color-recognition.worker.ts', import.meta.url), {
        type: 'module'
      });

      this.worker.onmessage = (event) => {
        const { type, data } = event.data;

        switch (type) {
          case 'WORKER_READY':
            console.log('[ColorClassifierService] Web worker ready ✅');
            this.isModelLoadedSignal.set(true);
            break;

          case 'DETECT_STRIPES_SUCCESS':
            this.colorDetectionSignal.set(data);
            this.errorSignal.set(null);

            // Create processed image with overlays for successful detection
            if (data && data.length > 0) {
              // We need the original image to create overlays, which we don't have here
              // The overlay creation happens in the detectStripes method when we have the original image
            }
            break;

          case 'DETECT_STRIPES_ERROR':
            this.errorSignal.set(data.error);
            console.error('Worker error:', data.error);
            break;
        }

        // Always clear busy state after worker responds
        this.isBusySignal.set(false);
      };

      this.worker.onerror = (error) => {
        console.error('Worker error:', error);
        this.errorSignal.set('Color recognition worker error');
        this.isBusySignal.set(false);
      };
    } catch (error) {
      console.error('Failed to initialize worker:', error);
      this.errorSignal.set('Failed to initialize color recognition worker');
      this.isModelLoadedSignal.set(false);
    }
  }

  // Getters for accessing signals in templates or codes
  get detection() {
    return this.colorDetectionSignal();
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
    this.initializeWorker()
    console.log('[ColorClassifierService] Service loaded (using web worker) ✅');
  }

  async detectStripes(
    imageElement: HTMLImageElement | HTMLCanvasElement,
  ): Promise<StripeDetectionResult[]> {
    if (!this.worker) {
      throw new Error('Web worker not initialized');
    }

    try {
      this.isBusySignal.set(true);
      this.errorSignal.set(null);
      this.colorDetectionSignal.set(null);

      // Convert image to createImageBitmap for transfer
      const imageBitmap = await createImageBitmap(imageElement);

      this.worker.postMessage({
        type: 'DETECT_STRIPES',
        data: { imageElement: imageBitmap }
      }, [imageBitmap]);

      // Return a promise that resolves when worker responds
      return new Promise<StripeDetectionResult[]>((resolve, reject) => {
        const messageHandler = (event: MessageEvent) => {
          const { type, data } = event.data;

          if (type === 'DETECT_STRIPES_SUCCESS') {
            this.worker!.removeEventListener('message', messageHandler);
            this.colorDetectionSignal.set(data);
            this.isBusySignal.set(false);

            // Create processed image with overlays for successful detection
            if (data && data.length > 0 && imageElement instanceof HTMLImageElement) {
              this.createProcessedImageWithOverlays(imageElement, data);
            }

            resolve(data);
          } else if (type === 'DETECT_STRIPES_ERROR') {
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
          const timeoutError = 'Color recognition timed out';
          this.errorSignal.set(timeoutError);
          this.isBusySignal.set(false);
          reject(new Error(timeoutError));
        }, 30000);
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Color recognition failed';
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
    console.log('[ColorClassifierService] Color classifier unloaded ✅');
  }

  private createProcessedImageWithOverlays(
    originalImage: HTMLImageElement,
    detections: StripeDetectionResult[],
  ): void {
    // Create new canvas for processed image
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.error('Could not get canvas context for overlay processing');
      return;
    }

    canvas.width = originalImage.width;
    canvas.height = originalImage.height;

    // Draw original image
    ctx.drawImage(originalImage, 0, 0);

    // Draw stripe overlays
    detections.forEach((detection, index) => {
      this.drawStripeOverlay(ctx, detection, index);
    });

    // Convert to data URL and log
    const processedDataURL = canvas.toDataURL('image/png');
    console.log('Setting processed color classification image:', processedDataURL.substring(0, 100) + '...');
  }

  private drawStripeOverlay(
    ctx: CanvasRenderingContext2D,
    detection: StripeDetectionResult,
    index: number,
  ): void {
    const stripes = detection.stripes;
    if (!stripes || stripes.length === 0) return;

    stripes.forEach((stripe, stripeIndex) => {
      const { position, color, isHorizontal } = stripe;

      // Draw bounding rectangle
      ctx.strokeStyle = '#00FF00'; // Green for stripes
      ctx.lineWidth = 2;
      ctx.strokeRect(position.x, position.y, position.width, position.height);

      // Draw label background
      ctx.fillStyle = 'rgba(0, 255, 0, 0.8)';
      const directionText = isHorizontal ? 'Horizontal' : 'Vertical';
      const labelText = `${color} ${directionText}`;
      const fontSize = 14;
      ctx.font = `${fontSize}px Arial`;
      const textMetrics = ctx.measureText(labelText);
      const textHeight = fontSize + 4;

      const labelX = position.x;
      const labelY = position.y - textHeight - 5;

      // Make sure label doesn't go outside bounds
      const labelBgWidth = textMetrics.width + 8;

      ctx.fillRect(labelX, labelY, labelBgWidth, textHeight);

      // Draw label text
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText(labelText, labelX + 4, labelY + fontSize);

      // Log the stripe detection
      console.log(`Stripe ${stripeIndex} (${index}):`, {
        position,
        color: color,
        isHorizontal,
      });
    });
  }
}
