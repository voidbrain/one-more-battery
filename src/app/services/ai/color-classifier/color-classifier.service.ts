import { inject, Injectable, signal, WritableSignal } from '@angular/core';
import { PipelineFactory } from '@services/ai/ai-common/common-ai.service';
import { StripeDetectionResult, StripeResult, ColorClassificationResult } from '@interfaces/index';
import { LLMConfigService } from '@services/ai/ai-common/common-ai-config.service';

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

  // downloading model files process
  public isModelLoadingSignal: WritableSignal<boolean> = signal<boolean>(false);
  public isModelLoadedSignal: WritableSignal<boolean> = signal<boolean>(false);

  private pipeline: Awaited<ReturnType<typeof PipelineFactory.getInstance>> | null = null;
  protected llmConfig = inject(LLMConfigService);

  // Getter for classifier instance - use local pipeline
  private get classifier(): Awaited<ReturnType<typeof PipelineFactory.getInstance>> | null {
    return this.pipeline; // Use local instance, not global factory lookup
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

  private async initializeModel() {
    try {
      this.isBusySignal.set(true);
      this.errorSignal.set(null);

      // Use default color classifier model
      this.pipeline = await PipelineFactory.getInstance(
        'colorClassifier',
        'Xenova/vit-base-patch16-224', // Default color classifier model
        (data: unknown) => {
          // Progress callback - could be used for loading progress
          console.log('Color classifier loading:', data);
        },
      );
      console.log('[ColorClassifierService] Color classifier loaded ✅');
      this.isModelLoadedSignal.set(true);
    } catch (error) {
      console.error('Failed to initialize color classifier:', error);
      this.errorSignal.set('Failed to load color classification model');
    } finally {
      this.isBusySignal.set(false);
    }
  }

  public async load(): Promise<void> {
    // Reset and show loading state
    this.isModelLoadingSignal.set(true);
    this.isModelLoadedSignal.set(false); // 🔍 Ensure we clear any previous successful load
    console.log('[ColorClassifierService] Starting model load...');

    try {
      await this.initializeModel(); // This handles 'initiate', 'progress', 'done', 'ready'
      console.log('[ColorClassifierService] Model load completed successfully ✅');
    } catch (err) {
      console.error('[ColorClassifierService] Model loading FAILED ❌:', {
        error: err,
        message: err instanceof Error ? err.message : 'Unknown error',
        stack: err instanceof Error ? err.stack : undefined,
      });
      const errorMessage = err instanceof Error ? err.message : 'Unknown model loading error';
      this.errorSignal.set(errorMessage);
      this.isModelLoadedSignal.set(false); // 🔍 Explicitly set false on failure
    } finally {
      // Hide loader once done
      this.isModelLoadingSignal.set(false);
    }
  }

  async detectStripes(
    imageElement: HTMLImageElement | HTMLCanvasElement,
  ): Promise<StripeDetectionResult[]> {
    if (!this.isModelLoaded || !this.classifier) {
      throw new Error('Color classifier model not loaded');
    }

    try {
      console.log("detectStripes")
      this.isBusySignal.set(true);
      this.errorSignal.set(null);

      this.colorDetectionSignal.set(null);

      // First extract potential stripe regions
      const stripeRegions = this.extractStripeRegions(imageElement);

      const results: StripeDetectionResult[] = [];

      for (const region of stripeRegions) {
        console.log("region")
        // Analyze color of each stripe region
        const colorResult = await this.analyzeRegionColor(region.canvas);
        const isHorizontal = this.determineOrientation(region.region);

        const stripeResult: StripeResult = {
          position: region.region,
          color: colorResult,
          isHorizontal,
        };

        results.push({
          stripes: [stripeResult],
          dominantColors: [colorResult],
        });
      }
      console.log(results)
      this.colorDetectionSignal.set(results);

      // Create processed image with overlays if we have results
      if (results.length > 0 && imageElement instanceof HTMLImageElement) {
        this.createProcessedImageWithOverlays(imageElement, results);
      }

      return results;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Stripe detection failed';
      this.errorSignal.set(errorMessage);
      console.error('Stripe detection failed:', error);
      throw error;
    } finally {
      this.isBusySignal.set(false);
    }
  }

  public async unload(): Promise<void> {
    // Dispose of the color classifier using centralized pipeline factory
    await PipelineFactory.disposeInstance('colorClassifier', 'Xenova/vit-base-patch16-224');
    this.pipeline = null;
    this.isModelLoadingSignal.set(false);
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

  private extractStripeRegions(imageElement: HTMLImageElement | HTMLCanvasElement): {
    canvas: HTMLCanvasElement;
    region: { x: number; y: number; width: number; height: number };
  }[] {
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

    // Get image data for analysis
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // Simple stripe detection algorithm
    const regions: { x: number; y: number; width: number; height: number }[] = [];

    // Look for horizontal stripes (thin rectangles)
    this.findHorizontalStripes(data, canvas.width, canvas.height, regions);

    // Look for vertical stripes (thin rectangles)
    this.findVerticalStripes(data, canvas.width, canvas.height, regions);

    // Filter and return valid stripe regions
    return regions
      .filter((region) => this.isValidStripeRegion(region))
      .map((region) => ({
        canvas: this.createCroppedCanvas(canvas, region),
        region,
      }));
  }

  private findHorizontalStripes(
    data: Uint8ClampedArray,
    width: number,
    height: number,
    regions: { x: number; y: number; width: number; height: number }[],
  ): void {
    const stripeHeightThreshold = 5;
    const minStripeWidth = 20;

    for (let y = 0; y < height - stripeHeightThreshold; y++) {
      for (let x = 0; x < width - minStripeWidth; x++) {
        const region = this.analyzeHorizontalRegion(
          data,
          x,
          y,
          width,
          height,
          minStripeWidth,
          stripeHeightThreshold,
        );
        if (region) {
          regions.push(region);
          // Skip the detected stripe
          x += region.width;
        }
      }
    }
  }

  private findVerticalStripes(
    data: Uint8ClampedArray,
    width: number,
    height: number,
    regions: { x: number; y: number; width: number; height: number }[],
  ): void {
    const stripeWidthThreshold = 5;
    const minStripeHeight = 20;

    for (let x = 0; x < width - stripeWidthThreshold; x++) {
      for (let y = 0; y < height - minStripeHeight; y++) {
        const region = this.analyzeVerticalRegion(
          data,
          x,
          y,
          width,
          height,
          stripeWidthThreshold,
          minStripeHeight,
        );
        if (region) {
          regions.push(region);
          // Skip the detected stripe
          y += region.height;
        }
      }
    }
  }

  private analyzeHorizontalRegion(
    data: Uint8ClampedArray,
    startX: number,
    startY: number,
    width: number,
    height: number,
    minWidth: number,
    maxHeight: number,
  ): { x: number; y: number; width: number; height: number } | null {
    let currentWidth = 0;
    let currentHeight = 1;

    // Get dominant color of starting pixel
    const startPixelIndex = (startY * width + startX) * 4;
    if (startPixelIndex >= data.length) return null;

    const startR = data[startPixelIndex];
    const startG = data[startPixelIndex + 1];
    const startB = data[startPixelIndex + 2];
    const colorThreshold = 30;

    // Extend horizontally until color changes significantly
    for (let x = startX; x < width && currentWidth < width / 2; x++) {
      let heightUniform = true;

      for (let h = 0; h < Math.min(maxHeight, height - startY); h++) {
        const pixelIndex = ((startY + h) * width + x) * 4;
        if (pixelIndex >= data.length) break;

        const r = data[pixelIndex];
        const g = data[pixelIndex + 1];
        const b = data[pixelIndex + 2];

        // Check if color is similar to start color
        if (
          Math.abs(r - startR) > colorThreshold ||
          Math.abs(g - startG) > colorThreshold ||
          Math.abs(b - startB) > colorThreshold
        ) {
          heightUniform = false;
          break;
        }
      }

      if (heightUniform) {
        currentWidth++;
        // Find actual height of uniform color
        for (let h = 1; h < maxHeight && startY + h < height; h++) {
          const pixelIndex = ((startY + h) * width + x) * 4;
          if (pixelIndex >= data.length) break;

          const r = data[pixelIndex];
          const g = data[pixelIndex + 1];
          const b = data[pixelIndex + 2];

          if (
            Math.abs(r - startR) < colorThreshold &&
            Math.abs(g - startG) < colorThreshold &&
            Math.abs(b - startB) < colorThreshold
          ) {
            currentHeight = Math.max(currentHeight, h + 1);
          } else {
            break;
          }
        }
      } else {
        break;
      }
    }

    if (currentWidth >= minWidth && currentHeight <= maxHeight) {
      return {
        x: startX,
        y: startY,
        width: currentWidth,
        height: currentHeight,
      };
    }

    return null;
  }

  private analyzeVerticalRegion(
    data: Uint8ClampedArray,
    startX: number,
    startY: number,
    width: number,
    height: number,
    maxWidth: number,
    minHeight: number,
  ): { x: number; y: number; width: number; height: number } | null {
    let currentHeight = 0;
    let currentWidth = 1;

    // Get dominant color of starting pixel
    const startPixelIndex = (startY * width + startX) * 4;
    if (startPixelIndex >= data.length) return null;

    const startR = data[startPixelIndex];
    const startG = data[startPixelIndex + 1];
    const startB = data[startPixelIndex + 2];
    const colorThreshold = 30;

    // Extend vertically until color changes significantly
    for (let y = startY; y < height && currentHeight < height / 2; y++) {
      let widthUniform = true;

      for (let w = 0; w < Math.min(maxWidth, width - startX); w++) {
        const pixelIndex = (y * width + (startX + w)) * 4;
        if (pixelIndex >= data.length) break;

        const r = data[pixelIndex];
        const g = data[pixelIndex + 1];
        const b = data[pixelIndex + 2];

        // Check if color is similar to start color
        if (
          Math.abs(r - startR) > colorThreshold ||
          Math.abs(g - startG) > colorThreshold ||
          Math.abs(b - startB) > colorThreshold
        ) {
          widthUniform = false;
          break;
        }
      }

      if (widthUniform) {
        currentHeight++;
        // Find actual width of uniform color
        for (let w = 1; w < maxWidth && startX + w < width; w++) {
          const pixelIndex = (y * width + (startX + w)) * 4;
          if (pixelIndex >= data.length) break;

          const r = data[pixelIndex];
          const g = data[pixelIndex + 1];
          const b = data[pixelIndex + 2];

          if (
            Math.abs(r - startR) < colorThreshold &&
            Math.abs(g - startG) < colorThreshold &&
            Math.abs(b - startB) < colorThreshold
          ) {
            currentWidth = Math.max(currentWidth, w + 1);
          } else {
            break;
          }
        }
      } else {
        break;
      }
    }

    if (currentHeight >= minHeight && currentWidth <= maxWidth) {
      return {
        x: startX,
        y: startY,
        width: currentWidth,
        height: currentHeight,
      };
    }

    return null;
  }

  private isValidStripeRegion(region: {
    x: number;
    y: number;
    width: number;
    height: number;
  }): boolean {
    const area = region.width * region.height;
    const aspectRatio = Math.max(region.width / region.height, region.height / region.width);

    // Stripes should be elongated (high aspect ratio) but not too large
    return aspectRatio > 3 && aspectRatio < 50 && area > 100 && area < 10000;
  }

  private async analyzeRegionColor(canvas: HTMLCanvasElement): Promise<ColorClassificationResult> {
    // Extract dominant color from canvas
    const ctx = canvas.getContext('2d')!;
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // Calculate average color
    let totalR = 0,
      totalG = 0,
      totalB = 0,
      count = 0;

    for (let i = 0; i < data.length; i += 4) {
      totalR += data[i];
      totalG += data[i + 1];
      totalB += data[i + 2];
      count++;
    }

    const avgR = Math.round(totalR / count);
    const avgG = Math.round(totalG / count);
    const avgB = Math.round(totalB / count);

    // Classify the color
    const color = this.classifyColor(avgR, avgG, avgB);
    const confidence = 0.85; // Placeholder confidence

    return {
      color,
      confidence,
      rgb: [avgR, avgG, avgB],
    };
  }

  private classifyColor(r: number, g: number, b: number): ColorClassificationResult['color'] {
    // Simple color classification based on RGB values
    const max = Math.max(r, g, b);

    // Black detection (very dark)
    if (max < 50) return 'black';

    // Red detection
    if (r > g + 30 && r > b + 30) return 'red';

    // Blue detection
    if (b > r + 30 && b > g + 30) return 'blue';

    // Green detection
    if (g > r + 30 && g > b + 30) return 'green';

    // Yellow detection (high red and green, low blue)
    if (r > 150 && g > 150 && b < 100) return 'yellow';

    return 'unknown';
  }

  private determineOrientation(region: { width: number; height: number }): boolean {
    // Return true if horizontal (width > height), false if vertical
    return region.width > region.height;
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
}
