/// <reference lib="webworker" />

import { StripeDetectionResult, StripeResult, ColorClassificationResult } from '@interfaces/index';

// Message types for worker communication
interface WorkerMessage<T = unknown> {
  type: string;
  data: T;
}

// Message types
type DetectStripesMessage = WorkerMessage<{
  imageElement: ImageBitmap; // Will be transferred from main thread
}>;

type WorkerResponse = WorkerMessage<StripeDetectionResult[] | { error: string }>;

// In web worker context, self refers to the worker global scope
const ctx = self as DedicatedWorkerGlobalScope;

// Convert ImageBitmap to canvas for processing
function imageBitmapToCanvas(imageBitmap: ImageBitmap): OffscreenCanvas {
  const canvas = new OffscreenCanvas(imageBitmap.width, imageBitmap.height);
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context in worker');
  ctx.drawImage(imageBitmap, 0, 0);
  return canvas;
}

// Extract stripe regions from image
function extractStripeRegions(imageElement: OffscreenCanvas): {
  canvas: OffscreenCanvas;
  region: { x: number; y: number; width: number; height: number };
}[] {
  const canvas = new OffscreenCanvas(imageElement.width, imageElement.height);
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');

  ctx.drawImage(imageElement, 0, 0);

  // Get image data for analysis
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  // Simple stripe detection algorithm
  const regions: { x: number; y: number; width: number; height: number }[] = [];

  // Look for horizontal stripes (thin rectangles)
  findHorizontalStripes(data, canvas.width, canvas.height, regions);

  // Look for vertical stripes (thin rectangles)
  findVerticalStripes(data, canvas.width, canvas.height, regions);

  // Filter and return valid stripe regions
  return regions
    .filter(region => isValidStripeRegion(region))
    .map(region => ({
      canvas: createCroppedCanvas(canvas, region),
      region,
    }));
}

function findHorizontalStripes(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  regions: { x: number; y: number; width: number; height: number }[],
): void {
  const stripeHeightThreshold = 5;
  const minStripeWidth = 20;

  for (let y = 0; y < height - stripeHeightThreshold; y++) {
    for (let x = 0; x < width - minStripeWidth; x++) {
      const region = analyzeHorizontalRegion(
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

function findVerticalStripes(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  regions: { x: number; y: number; width: number; height: number }[],
): void {
  const stripeWidthThreshold = 5;
  const minStripeHeight = 20;

  for (let x = 0; x < width - stripeWidthThreshold; x++) {
    for (let y = 0; y < height - minStripeHeight; y++) {
      const region = analyzeVerticalRegion(
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

function analyzeHorizontalRegion(
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

function analyzeVerticalRegion(
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

function isValidStripeRegion(region: { x: number; y: number; width: number; height: number }): boolean {
  const area = region.width * region.height;
  const aspectRatio = Math.max(region.width / region.height, region.height / region.width);

  // Stripes should be elongated (high aspect ratio) but not too large
  return aspectRatio > 3 && aspectRatio < 50 && area > 100 && area < 10000;
}

function createCroppedCanvas(
  sourceCanvas: OffscreenCanvas,
  region: { x: number; y: number; width: number; height: number },
): OffscreenCanvas {
  const croppedCanvas = new OffscreenCanvas(region.width, region.height);
  const ctx = croppedCanvas.getContext('2d')!;

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

function analyzeRegionColor(canvas: OffscreenCanvas): ColorClassificationResult {
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
  const color = classifyColor(avgR, avgG, avgB);
  const confidence = 0.85; // Placeholder confidence

  return {
    color,
    confidence,
    rgb: [avgR, avgG, avgB],
  };
}

function classifyColor(r: number, g: number, b: number): ColorClassificationResult['color'] {
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

function determineOrientation(region: { width: number; height: number }): boolean {
  // Return true if horizontal (width > height), false if vertical
  return region.width > region.height;
}

// Main stripe detection logic
function detectStripes(imageElement: OffscreenCanvas): StripeDetectionResult[] {
  console.log('Worker: Starting stripe detection');

  const stripeRegions = extractStripeRegions(imageElement);
  const results: StripeDetectionResult[] = [];

  console.log(`Worker: Found ${stripeRegions.length} stripe regions`);

  for (const region of stripeRegions) {
    // Analyze color of each stripe region
    const colorResult = analyzeRegionColor(region.canvas);
    const isHorizontal = determineOrientation(region.region);

    const stripeResult: StripeResult = {
      position: region.region,
      color: colorResult,
      isHorizontal,
    };

    results.push({
      stripes: [stripeResult],
      dominantColors: [colorResult],
    });

    console.log(`Worker: Processed region:`, {
      position: region.region,
      color: colorResult.color,
      isHorizontal
    });
  }

  return results;
}

// Message handler
ctx.onmessage = async (event: MessageEvent<DetectStripesMessage>) => {
  const { type, data } = event.data;

  if (type === 'DETECT_STRIPES') {
    try {
      const canvas = imageBitmapToCanvas(data.imageElement);
      const results = detectStripes(canvas);

      const response: WorkerResponse = {
        type: 'DETECT_STRIPES_SUCCESS',
        data: results,
      };
      ctx.postMessage(response);
    } catch (error) {
      const response: WorkerResponse = {
        type: 'DETECT_STRIPES_ERROR',
        data: { error: error instanceof Error ? error.message : 'Unknown error' },
      };
      ctx.postMessage(response);
    }
  }
};

// Worker ready
ctx.postMessage({ type: 'WORKER_READY' });
