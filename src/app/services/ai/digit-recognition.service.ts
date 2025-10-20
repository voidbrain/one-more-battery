// src/app/services/digit-recognition.service.ts
import { Injectable, Inject } from '@angular/core';
import { APP_BASE_HREF } from '@angular/common';
import * as tf from '@tensorflow/tfjs';

@Injectable({
  providedIn: 'root',
})
export class DigitRecognitionService {
  private model: tf.LayersModel | null = null;
  private modelPath: string;

  constructor(@Inject(APP_BASE_HREF) private baseHref: string) {
    console.log('DigitRecognitionService constructor called.');
    this.modelPath = `${this.baseHref}assets/model/model.json`;
    this.loadModel();
  }

  async loadModel() {
    console.log('loadModel method called.');
    try {
      await tf.setBackend('webgl');
      console.log('Using backend:', tf.getBackend());
      this.model = await tf.loadLayersModel(this.modelPath);

      if (!this.model) throw new Error('Failed to load model');

      console.log('✅ Model loaded successfully.');
      console.log('Model input shape:', this.model.inputs[0].shape);
      console.log('Model summary:');
      this.model.summary();

      return true;
    } catch (error) {
      console.error('❌ Error loading model:', error);
      throw error;
    }
  }

  async predictDigitsFromImage(
    img: HTMLImageElement,
    threshold: number,
    erosion: number,
    dilation: number,
    forceInvert: boolean
  ): Promise<{ predictions: { id: number; image: string; digit: number; confidence: number; box: number[] }[]; processedImageBase64: string }> {
    if (!this.model) {
      console.warn('Model not loaded yet, loading now...');
      await this.loadModel();
    }

    console.log('Starting digit extraction and prediction...');
    const { digits, boxes, processedImageBase64 } = this.extractDigits(img, threshold, erosion, dilation, forceInvert);
    const predictions: { id: number; image: string; digit: number; confidence: number; box: number[] }[] = [];

    for (let i = 0; i < digits.length; i++) {
      const digitCanvas = digits[i];
      const box = boxes[i];

      console.log(`🖼️ Processing digit #${i + 1}/${digits.length}`);

      const inputTensor = this.preprocessDigit(digitCanvas);

      // Optional: visualize the 28x28 preprocessed image
      const previewBase64 = digitCanvas.toDataURL();
      console.log(`Preview for digit ${i + 1}:`, previewBase64);

      const pred = this.model!.predict(inputTensor) as tf.Tensor;
      const data = (await pred.data()) as Float32Array;

      const confidence = Math.max(...data);
      const predictedDigit = data.indexOf(confidence);

      // Sort predictions for readability
      const sorted = Array.from(data)
        .map((v, idx) => ({ idx, v }))
        .sort((a, b) => b.v - a.v)
        .slice(0, 5);
      console.log('🔢 Prediction breakdown (top 5):', sorted);

      console.log(`🧠 Predicted digit ${i + 1}: ${predictedDigit}, Confidence: ${(confidence * 100).toFixed(2)}%`);

      predictions.push({ id: i + 1, image: previewBase64, digit: predictedDigit, confidence, box });

      // Cleanup
      inputTensor.dispose();
      pred.dispose();
    }

    return { predictions, processedImageBase64 };
  }

  async recognizeDigitFromBase64(
    base64Image: string,
    threshold: number,
    erosion: number,
    dilation: number,
    forceInvert: boolean
  ): Promise<{ predictions: { id: number; image: string; digit: number; confidence: number; box: number[] }[]; processedImageBase64: string }> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = async () => {
        try {
          const result = await this.predictDigitsFromImage(img, threshold, erosion, dilation, forceInvert);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      };
      img.onerror = () => reject(new Error('Failed to load image from base64 string.'));
      img.src = base64Image;
    });
  }

  // --- Image preprocessing chain (binary, morphology, box detection) ---
  private extractDigits(
    img: HTMLImageElement,
    threshold: number,
    erosion: number,
    dilation: number,
    forceInvert: boolean
  ): {
    digits: HTMLCanvasElement[];
    boxes: number[][];
    processedImageBase64: string;
  } {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const smoothed = this.smoothImage(imageData, 1);
    const binaryData = this.toBinary(smoothed, threshold);
    const erodedData = this.erode(binaryData, canvas.width, canvas.height, erosion);
    const dilatedData = this.dilate(erodedData, canvas.width, canvas.height, dilation);

    const boxes = this.findBoundingBoxes(dilatedData, canvas.width, canvas.height);

    // Sort boxes: prioritize central + larger area
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;

    boxes.sort((a, b) => {
      const [xA, yA, wA, hA] = a;
      const [xB, yB, wB, hB] = b;
      const centerDistA = Math.hypot(xA + wA / 2 - cx, yA + hA / 2 - cy);
      const centerDistB = Math.hypot(xB + wB / 2 - cx, yB + hB / 2 - cy);
      const areaA = wA * hA;
      const areaB = wB * hB;

      // prioritize closer to center, then by area
      return centerDistA - centerDistB || areaB - areaA;
    });

    // Keep only top 1–2 boxes
    boxes.splice(2);

    const digitCanvases: HTMLCanvasElement[] = [];

    for (const [idx, box] of boxes.entries()) {
      let [x, y, w, h] = box;
      console.log(`Box detected ${idx}: x=${x}, y=${y}, w=${w}, h=${h}`);
      if (w < 20 || h < 20) continue; // Skip tiny boxes

      const pad = 4;
      x = Math.max(0, x - pad);
      y = Math.max(0, y - pad);
      w = Math.min(canvas.width - x, w + pad * 2);
      h = Math.min(canvas.height - y, h + pad * 2);

      const maxDim = Math.max(w, h);

      const digitCanvas = document.createElement('canvas');
      digitCanvas.width = 28;
      digitCanvas.height = 28;
      const dctx = digitCanvas.getContext('2d')!;

      // Fill black background
      dctx.fillStyle = 'black';
      dctx.fillRect(0, 0, 28, 28);

      const scale = 28 / maxDim;
      const scaledW = w * scale;
      const scaledH = h * scale;
      const offsetX = (28 - scaledW) / 2;
      const offsetY = (28 - scaledH) / 2;

      dctx.drawImage(canvas, x, y, w, h, offsetX, offsetY, scaledW, scaledH);

      // Auto-invert
      const imgData = dctx.getImageData(0, 0, 28, 28);
      let lightPixels = 0;
      let darkPixels = 0;
      for (let i = 0; i < imgData.data.length; i += 4) {
        const avg = (imgData.data[i] + imgData.data[i + 1] + imgData.data[i + 2]) / 3;
        if (avg > 128) lightPixels++;
        else darkPixels++;
      }

      const totalPixels = lightPixels + darkPixels;
      const avgBrightness = totalPixels ? lightPixels / totalPixels : 0;
      const contrast = totalPixels ? Math.abs(lightPixels - darkPixels) / totalPixels : 0;

      // Compute border brightness average
      const borderSamples = [];
      const step = 2;
      for (let y = 0; y < 28; y += step) {
        for (let x = 0; x < 28; x += step) {
          if (x < 2 || y < 2 || x > 25 || y > 25) {
            const idx = (y * 28 + x) * 4;
            const avg = (imgData.data[idx] + imgData.data[idx + 1] + imgData.data[idx + 2]) / 3;
            borderSamples.push(avg);
          }
        }
      }
      const borderMean = borderSamples.reduce((a, b) => a + b, 0) / borderSamples.length;
      const autoInvert = borderMean > 128; // light border → dark digit
      const invert = forceInvert ? !autoInvert : autoInvert;

      console.log(
        `Digit #${idx + 1}: light=${lightPixels}, dark=${darkPixels}, avg=${(avgBrightness * 100).toFixed(1)}%, contrast=${contrast.toFixed(2)}, invert=${invert}`
      );

      for (let i = 0; i < imgData.data.length; i += 4) {
        const avg = (imgData.data[i] + imgData.data[i + 1] + imgData.data[i + 2]) / 3;
        let value = invert ? 255 - avg : avg; // invert if needed
        value = value > 128 ? 255 : 0; // threshold to pure black/white
        imgData.data[i] = value;
        imgData.data[i + 1] = value;
        imgData.data[i + 2] = value;
        imgData.data[i + 3] = 255;
      }
      dctx.putImageData(imgData, 0, 0);

      digitCanvases.push(digitCanvas);
    }

    // Processed full image for debugging
    const processedCanvas = document.createElement('canvas');
    processedCanvas.width = canvas.width;
    processedCanvas.height = canvas.height;
    const pctx = processedCanvas.getContext('2d')!;
    const processedImageData = pctx.createImageData(canvas.width, canvas.height);
    for (let i = 0; i < dilatedData.length; i++) {
      const val = dilatedData[i] === 1 ? 255 : 0;
      processedImageData.data[i * 4] = val;
      processedImageData.data[i * 4 + 1] = val;
      processedImageData.data[i * 4 + 2] = val;
      processedImageData.data[i * 4 + 3] = 255;
    }
    pctx.putImageData(processedImageData, 0, 0);
    const processedImageBase64 = processedCanvas.toDataURL();

    return { digits: digitCanvases, boxes, processedImageBase64 };
  }

  private smoothImage(imageData: ImageData, radius = 1): ImageData {
    const w = imageData.width;
    const h = imageData.height;
    const src = imageData.data;
    const dst = new Uint8ClampedArray(src.length);

    for (let y = 1; y < h - 1; y++) {
      for (let x = 1; x < w - 1; x++) {
        let sum = 0;
        for (let j = -radius; j <= radius; j++) {
          for (let i = -radius; i <= radius; i++) {
            const idx = ((y + j) * w + (x + i)) * 4;
            const avg = (src[idx] + src[idx + 1] + src[idx + 2]) / 3;
            sum += avg;
          }
        }
        const mean = sum / ((2 * radius + 1) ** 2);
        const idx = (y * w + x) * 4;
        dst[idx] = dst[idx + 1] = dst[idx + 2] = mean;
        dst[idx + 3] = 255;
      }
    }

    return new ImageData(dst, w, h);
  }


  // --- Morphology operations ---
  // ORIGINAL VERSION
  // private toBinary(imageData: ImageData, threshold: number): Uint8ClampedArray {
  //   const binary = new Uint8ClampedArray(imageData.data.length / 4);

  //   // Compute global mean brightness
  //   let sum = 0;
  //   for (let i = 0; i < imageData.data.length; i += 4) {
  //     const avg = (imageData.data[i] + imageData.data[i + 1] + imageData.data[i + 2]) / 3;
  //     sum += avg;
  //   }
  //   const mean = sum / (imageData.data.length / 4);
  //   const adaptiveThreshold = threshold || mean * 0.9; // relative to scene brightness

  //   for (let i = 0; i < imageData.data.length; i += 4) {
  //     const avg = (imageData.data[i] + imageData.data[i + 1] + imageData.data[i + 2]) / 3;
  //     binary[i / 4] = avg < adaptiveThreshold ? 1 : 0;
  //   }

  //   return binary;
  // }

  // private toBinary(imageData: ImageData, threshold?: number): Uint8ClampedArray {
  //   const { data, width, height } = imageData;
  //   const grayValues = new Uint8ClampedArray(width * height);

  //   // 1️⃣ Convert to grayscale
  //   for (let i = 0, j = 0; i < data.length; i += 4, j++) {
  //     grayValues[j] = (data[i] + data[i + 1] + data[i + 2]) / 3;
  //   }

  //   // 2️⃣ Auto compute threshold if not provided or out of range
  //   let usedThreshold: number;
  //   if (threshold == null || threshold < 0 || threshold > 255) {
  //     usedThreshold = this.otsuThreshold(grayValues);
  //   } else {
  //     usedThreshold = threshold;
  //   }

  //   // 3️⃣ Apply threshold to produce binary image
  //   const binaryData = new Uint8ClampedArray(width * height);
  //   for (let i = 0; i < grayValues.length; i++) {
  //     binaryData[i] = grayValues[i] > usedThreshold ? 1 : 0;
  //   }

  //   return binaryData;
  // }


  private toBinary(imageData: ImageData, threshold?: number): Uint8ClampedArray {
    const { data, width, height } = imageData;
    const n = width * height;
    const gray = new Uint8ClampedArray(n);

    // 1) convert to grayscale 0..255
    for (let i = 0, j = 0; i < data.length; i += 4, j++) {
      gray[j] = Math.round((data[i] + data[i + 1] + data[i + 2]) / 3);
    }

    // 2) threshold selection (Otsu if threshold not provided or out of range)
    let usedThreshold: number;
    if (threshold == null || threshold < 0 || threshold > 255) {
      usedThreshold = this.otsuThreshold(gray);
    } else {
      usedThreshold = Math.round(threshold);
    }

    // 3) initial binary assuming "foreground = darker than threshold"
    const bin = new Uint8ClampedArray(n);
    for (let i = 0; i < n; i++) bin[i] = gray[i] < usedThreshold ? 1 : 0;

    // 4) determine polarity robustly:
    //    compute mean brightness of border region and center region.
    const borderH = Math.max(2, Math.floor(height * 0.08)); // 8% border
    const borderW = Math.max(2, Math.floor(width * 0.08));
    let borderSum = 0, borderCount = 0;
    // top border
    for (let y = 0; y < borderH; y++) for (let x = 0; x < width; x++) { borderSum += gray[y * width + x]; borderCount++; }
    // bottom border
    for (let y = height - borderH; y < height; y++) for (let x = 0; x < width; x++) { borderSum += gray[y * width + x]; borderCount++; }
    // left/right vertical strips (excluding corners already counted lightly)
    for (let y = borderH; y < height - borderH; y++) {
      for (let x = 0; x < borderW; x++) { borderSum += gray[y * width + x]; borderCount++; }
      for (let x = width - borderW; x < width; x++) { borderSum += gray[y * width + x]; borderCount++; }
    }
    const borderMean = borderCount ? borderSum / borderCount : 128;

    // center box mean
    const centerW = Math.max(4, Math.floor(width * 0.4));
    const centerH = Math.max(4, Math.floor(height * 0.4));
    const startX = Math.floor((width - centerW) / 2);
    const startY = Math.floor((height - centerH) / 2);
    let centerSum = 0, centerCount = 0;
    for (let y = startY; y < startY + centerH; y++) {
      for (let x = startX; x < startX + centerW; x++) {
        centerSum += gray[y * width + x];
        centerCount++;
      }
    }
    const centerMean = centerCount ? centerSum / centerCount : 128;

    // If center is *lighter* than border, the digit is likely lighter than background -> flip
    // If center is *darker* than border, the current binary (gray < threshold => 1) is correct.
    const shouldFlip = centerMean > borderMean + 6; // +6 tolerance
    if (shouldFlip) {
      for (let i = 0; i < n; i++) bin[i] = 1 - bin[i];
    }

    // 5) small morphological opening to remove speckles and tighten shapes
    //    apply 1 erosion then 1 dilation (3x3 kernel)
    const eroded = this.morphologyBinary(bin, width, height, 'erode');
    const opened = this.morphologyBinary(eroded, width, height, 'dilate');

    // 6) Optional: if result is almost empty or almost full, fallback to inverted Otsu
    const sumOpened = opened.reduce((s, v) => s + v, 0);
    if (sumOpened < 10 || sumOpened > n * 0.9) {
      // try inverted thresholding as fallback (handles pathological images)
      const inverted = new Uint8ClampedArray(n);
      for (let i = 0; i < n; i++) inverted[i] = gray[i] > usedThreshold ? 1 : 0;
      const invE = this.morphologyBinary(inverted, width, height, 'erode');
      const invO = this.morphologyBinary(invE, width, height, 'dilate');
      const sumInv = invO.reduce((s, v) => s + v, 0);
      // pick the one with more reasonable amount of foreground
      if (sumInv > 10 && sumInv < n * 0.95) {
        return invO;
      }
    }

    return opened;
  }

  /** small binary morphology for 3x3 kernel (operates on 0/1 arrays) */
  private morphologyBinary(data: Uint8ClampedArray, width: number, height: number, op: 'erode' | 'dilate'): Uint8ClampedArray {
    const out = new Uint8ClampedArray(data.length);
    const match = op === 'erode' ? 1 : 0;
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        let found = false;
        for (let j = -1; j <= 1 && !found; j++) {
          for (let i = -1; i <= 1; i++) {
            if (data[(y + j) * width + (x + i)] === match) {
              found = true;
              break;
            }
          }
        }
        out[y * width + x] = found ? match : 1 - match;
      }
    }
    // fill borders conservatively
    for (let x = 0; x < width; x++) { out[x] = data[x]; out[(height - 1) * width + x] = data[(height - 1) * width + x]; }
    for (let y = 0; y < height; y++) { out[y * width + 0] = data[y * width + 0]; out[y * width + (width - 1)] = data[y * width + (width - 1)]; }
    return out;
  }

  /** Otsu threshold supporting Uint8ClampedArray input */
  private otsuThreshold(gray: Uint8ClampedArray): number {
    const hist = new Array(256).fill(0);
    for (let i = 0; i < gray.length; i++) hist[gray[i]]++;
    const total = gray.length;
    let sum = 0;
    for (let t = 0; t < 256; t++) sum += t * hist[t];

    let sumB = 0;
    let wB = 0;
    let maxVar = 0;
    let threshold = 128;

    for (let t = 0; t < 256; t++) {
      wB += hist[t];
      if (wB === 0) continue;
      const wF = total - wB;
      if (wF === 0) break;

      sumB += t * hist[t];
      const mB = sumB / wB;
      const mF = (sum - sumB) / wF;
      const between = wB * wF * (mB - mF) * (mB - mF);
      if (between > maxVar) {
        maxVar = between;
        threshold = t;
      }
    }
    return threshold;
  }

  private imageContrast(gray: Uint8ClampedArray): number {
    let min = 255, max = 0;
    for (let i = 0; i < gray.length; i++) {
      if (gray[i] < min) min = gray[i];
      if (gray[i] > max) max = gray[i];
    }
    return max - min;
  }

  private erode(data: Uint8ClampedArray, width: number, height: number, iterations: number): Uint8ClampedArray {
    let result = data;
    for (let i = 0; i < iterations; i++) result = this.morphology(result, width, height, 'erode');
    return result;
  }

  private dilate(data: Uint8ClampedArray, width: number, height: number, iterations: number): Uint8ClampedArray {
    let result = data;
    for (let i = 0; i < iterations; i++) result = this.morphology(result, width, height, 'dilate');
    return result;
  }

  private morphology(data: Uint8ClampedArray, width: number, height: number, op: 'erode' | 'dilate'): Uint8ClampedArray {
    const output = new Uint8ClampedArray(data.length);
    const matchValue = op === 'erode' ? 1 : 0;

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = y * width + x;
        let mismatch = false;
        for (let j = -1; j <= 1; j++) {
          for (let i = -1; i <= 1; i++) {
            if (data[(y + j) * width + (x + i)] === matchValue) {
              mismatch = true;
              break;
            }
          }
          if (mismatch) break;
        }
        output[idx] = mismatch ? matchValue : 1 - matchValue;
      }
    }
    return output;
  }

  // --- Bounding boxes ---
  private findBoundingBoxes(binary: Uint8ClampedArray, width: number, height: number): [number, number, number, number][] {
    const boxes: [number, number, number, number][] = [];
    const visited = new Uint8Array(binary.length);
    const getIndex = (x: number, y: number) => y * width + x;

    const floodFill = (x0: number, y0: number) => {
      const queue: [number, number][] = [[x0, y0]];
      let minX = x0, maxX = x0, minY = y0, maxY = y0;

      while (queue.length) {
        const [x, y] = queue.pop()!;
        const idx = getIndex(x, y);
        if (x < 0 || y < 0 || x >= width || y >= height || visited[idx] || binary[idx] === 0) continue;
        visited[idx] = 1;
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y);
        queue.push([x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1]);
      }

      if (maxX - minX >= 20 && maxY - minY >= 20) boxes.push([minX, minY, maxX - minX, maxY - minY]);
    };

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = getIndex(x, y);
        if (!visited[idx] && binary[idx] === 1) floodFill(x, y);
      }
    }

    return boxes;
  }

  // --- Tensor preprocessing with debug ---
  private preprocessDigit(canvas: HTMLCanvasElement): tf.Tensor {
    const ctx = canvas.getContext('2d')!;
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const gray: number[] = [];

    // Count bright vs dark pixels
    let brightCount = 0;
    let darkCount = 0;

    for (let i = 0; i < imgData.data.length; i += 4) {
      const r = imgData.data[i];
      const g = imgData.data[i + 1];
      const b = imgData.data[i + 2];
      const avg = (r + g + b) / 3;

      if (avg > 127) brightCount++;
      else darkCount++;
    }

    // Decide whether to invert
    const invert = brightCount > darkCount; // true if background is white

    for (let i = 0; i < imgData.data.length; i += 4) {
      const r = imgData.data[i];
      const g = imgData.data[i + 1];
      const b = imgData.data[i + 2];
      const avg = (r + g + b) / 255;

      gray.push(invert ? 1 - avg : avg);

    }

    const tensor = tf.tensor3d(gray, [28, 28, 1]);
    const reshapedTensor = tensor.reshape([1, 28, 28]);

    console.log('🧠 [Preprocess] Tensor shape:', reshapedTensor.shape);
    reshapedTensor.data().then((data: any) => {
      console.log('🧠 [Preprocess] Sample values:', data.slice(0, 10));
    });

    return reshapedTensor;
  }

}
