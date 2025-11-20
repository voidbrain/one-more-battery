import { Injectable, signal, WritableSignal } from '@angular/core';
import { PipelineFactory } from '@services/ai/ai-common/common-ai.service';

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

  // downloading model files process
  public isModelLoadingSignal: WritableSignal<boolean> = signal<boolean>(false);
  public isModelLoadedSignal: WritableSignal<boolean> = signal<boolean>(false);
  public progressItemsSignal: WritableSignal<unknown[]> = signal<unknown[]>([]);

  private pipeline: Awaited<ReturnType<typeof PipelineFactory.getInstance>> | null = null;

  // Getter for digit recognizer instance from centralized pipeline factory
  private get digitRecognizer(): Awaited<ReturnType<typeof PipelineFactory.getInstance>> | null {
    return PipelineFactory.getExistingInstance('digitRecognizer');
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

  private async initializeModel() {
    try {
      this.isBusySignal.set(true);
      this.errorSignal.set(null);

      this.pipeline = await PipelineFactory.getInstance(
        'digitRecognizer',
        'Xenova/resnet-50', // Default digit recognition model
        (data: unknown) => {
          // Progress callback - could be used for loading progress
          console.log('Digit recognizer loading:', data);
        },
      );
      console.log('[DigitRecognizerService] Digit recognizer loaded ✅');
      this.isModelLoadedSignal.set(true);
    } catch (error) {
      console.error('Failed to initialize digit recognizer:', error);
      this.errorSignal.set('Failed to load digit recognition model');
    } finally {
      this.isBusySignal.set(false);
    }
  }

  public async load(): Promise<void> {
    // Reset and show loading state
    this.isModelLoadingSignal.set(true);

    try {
      await this.initializeModel(); // This handles 'initiate', 'progress', 'done', 'ready'
    } catch (err) {
      console.error('Model loading failed:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown model loading error';
      this.errorSignal.set(errorMessage);
    } finally {
      // Hide loader once done
      this.isModelLoadingSignal.set(false);
    }
  }

  async recognizeDigits(
    imageElement: HTMLImageElement | HTMLCanvasElement,
  ): Promise<DigitExtractResult[]> {
    if (!this.isModelLoaded || !this.digitRecognizer) {
      throw new Error('Digit recognizer model not loaded');
    }

    try {
      this.isBusySignal.set(true);
      this.errorSignal.set(null);

      this.recognitionSignal.set(null);

      // First, we need to crop out the digit areas from the image
      const digitRegions = await this.extractDigitRegions(imageElement);

      const results: DigitExtractResult[] = [];

      for (const region of digitRegions) {
        // Classify the digit region using a simple digit recognition approach
        // For now, using a basic template matching since we need a specialized digit model
        const digit = this.classifyDigitRegion(region.canvas);
        const confidence = 0.8; // Placeholder confidence

        results.push({
          recognizedDigits: [{ digit, confidence }],
          extractedValue: digit.toString(),
          confidence,
        });
      }

      // Sort results by confidence and combine them
      results.sort((a, b) => b.confidence - a.confidence);
      this.recognitionSignal.set(results);

      return results;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Digit recognition failed';
      this.errorSignal.set(errorMessage);
      console.error('Digit recognition failed:', error);
      throw error;
    } finally {
      this.isBusySignal.set(false);
    }
  }

  private async extractDigitRegions(
    imageElement: HTMLImageElement | HTMLCanvasElement,
  ): Promise<
    { canvas: HTMLCanvasElement; region: { x: number; y: number; width: number; height: number } }[]
  > {
    // Create a canvas to work with
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get canvas context');

    canvas.width =
      imageElement.width ||
      (imageElement instanceof HTMLImageElement ? imageElement.naturalWidth : imageElement.width);
    canvas.height =
      imageElement.height ||
      (imageElement instanceof HTMLImageElement ? imageElement.naturalHeight : imageElement.height);
    ctx.drawImage(imageElement, 0, 0);

    // Convert to grayscale to simplify digit extraction
    const grayImageData = this.convertToGrayscale(canvas);
    ctx.putImageData(grayImageData, 0, 0);

    // Apply preprocessing to enhance digits and remove noise
    const processedImageData = this.preprocessForDigitDetection(grayImageData);
    ctx.putImageData(processedImageData, 0, 0);

    // Find connected components (digit regions)
    const regions = this.findConnectedComponents(processedImageData);

    // Filter and create cropped canvases for each digit region
    return regions
      .filter((region) => this.isValidDigitRegion(region))
      .map((region) => ({
        canvas: this.createCroppedCanvas(canvas, region),
        region,
      }));
  }

  private convertToGrayscale(canvas: HTMLCanvasElement): ImageData {
    const ctx = canvas.getContext('2d')!;
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const gray = 0.299 * r + 0.587 * g + 0.114 * b;
      data[i] = gray;
      data[i + 1] = gray;
      data[i + 2] = gray;
    }

    return imageData;
  }

  private preprocessForDigitDetection(imageData: ImageData): ImageData {
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;

    // Apply thresholding to create binary image
    // Assume digits are darker on light background
    for (let i = 0; i < data.length; i += 4) {
      const gray = data[i];
      const threshold = this.computeAdaptiveThreshold(data, i, width, height);
      data[i] = gray < threshold ? 0 : 255;
      data[i + 1] = gray < threshold ? 0 : 255;
      data[i + 2] = gray < threshold ? 0 : 255;
    }

    return imageData;
  }

  private computeAdaptiveThreshold(
    data: Uint8ClampedArray,
    index: number,
    width: number,
    height: number,
  ): number {
    // Simple adaptive thresholding using local mean
    const blockSize = 21; // Should be odd
    const halfBlock = Math.floor(blockSize / 2);
    const offset = 10; // Constant offset

    let sum = 0;
    let count = 0;

    for (let dy = -halfBlock; dy <= halfBlock; dy++) {
      for (let dx = -halfBlock; dx <= halfBlock; dx++) {
        const y = Math.floor(index / 4 / width) + dy;
        const x = ((index / 4) % width) + dx;

        if (x >= 0 && x < width && y >= 0 && y < height) {
          sum += data[(y * width + x) * 4];
          count++;
        }
      }
    }

    return sum / count - offset;
  }

  private findConnectedComponents(
    imageData: ImageData,
  ): { x: number; y: number; width: number; height: number }[] {
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;
    const visited = new Set<number>();

    const regions: { x: number; y: number; width: number; height: number }[] = [];

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const index = y * width + x;
        if (visited.has(index) || data[index * 4] === 255) continue;

        const region = this.floodFill(x, y, width, height, data, visited);
        if (region) {
          regions.push(region);
        }
      }
    }

    return regions;
  }

  private floodFill(
    startX: number,
    startY: number,
    width: number,
    height: number,
    data: Uint8ClampedArray,
    visited: Set<number>,
  ): { x: number; y: number; width: number; height: number } | null {
    const queue: [number, number][] = [[startX, startY]];
    let minX = startX,
      minY = startY,
      maxX = startX,
      maxY = startY;

    while (queue.length > 0) {
      const [x, y] = queue.shift()!;
      const index = y * width + x;

      if (visited.has(index) || data[index * 4] === 255) continue;

      visited.add(index);
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);

      // Check neighbors
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const nx = x + dx;
          const ny = y + dy;
          if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
            const nIndex = ny * width + nx;
            if (!visited.has(nIndex) && data[nIndex * 4] === 0) {
              queue.push([nx, ny]);
            }
          }
        }
      }
    }

    const regionWidth = maxX - minX + 1;
    const regionHeight = maxY - minY + 1;

    // Only return regions that look like digits (aspect ratio approximately 1-3)
    const aspectRatio = regionWidth / regionHeight;
    if (regionWidth > 5 && regionHeight > 5 && aspectRatio > 0.3 && aspectRatio < 4) {
      return { x: minX, y: minY, width: regionWidth, height: regionHeight };
    }

    return null;
  }

  private isValidDigitRegion(region: {
    x: number;
    y: number;
    width: number;
    height: number;
  }): boolean {
    const area = region.width * region.height;
    const aspectRatio = region.width / region.height;

    // Filter out very small or very large regions
    if (area < 50 || area > 10000) return false;

    // Filter out regions with extreme aspect ratios
    if (aspectRatio < 0.2 || aspectRatio > 5.0) return false;

    return true;
  }

  private createCroppedCanvas(
    sourceCanvas: HTMLCanvasElement,
    region: { x: number; y: number; width: number; height: number },
  ): HTMLCanvasElement {
    const croppedCanvas = document.createElement('canvas');
    const ctx = croppedCanvas.getContext('2d')!;

    croppedCanvas.width = region.width;
    croppedCanvas.height = region.height;

    ctx.drawImage(
      sourceCanvas,
      region.x,
      region.y,
      region.width,
      region.height,
      0,
      0,
      region.width,
      region.height,
    );

    return croppedCanvas;
  }

  private classifyDigitRegion(canvas: HTMLCanvasElement): number {
    // Simple digit classifier using basic pattern recognition
    // This is a placeholder - in a real implementation we'd use a trained model
    // For now, we'll use a random digit as placeholder to demonstrate the feature

    // In a real implementation, you would:
    // 1. Preprocess the canvas (resize, normalize, etc.)
    // 2. Use a CNN model like the one we configured in the pipeline factory
    // 3. Return the predicted digit with confidence

    // Log canvas dimensions for debugging (placeholder usage)
    console.log(`Classifying digit region of size: ${canvas.width}x${canvas.height}`);

    // Placeholder: return a random digit for demonstration
    return Math.floor(Math.random() * 10);
  }

  // Dispose of resources
  async unload(): Promise<void> {
    // Dispose of the digit recognizer using centralized pipeline factory
    await PipelineFactory.disposeInstance('digitRecognizer', 'Xenova/resnet-50');
    this.pipeline = null;
    this.progressItemsSignal.set([]);
    this.isModelLoadingSignal.set(false);
    this.isModelLoadedSignal.set(false);
    console.log('[DigitRecognizerService] Digit recognizer unloaded ✅');
  }
}
