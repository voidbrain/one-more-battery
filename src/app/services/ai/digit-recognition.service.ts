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
    dilation: number
  ): Promise<{ predictions: { id: number; image: string; digit: number; confidence: number; box: number[] }[]; processedImageBase64: string }> {
    if (!this.model) {
      console.warn('Model not loaded yet, loading now...');
      await this.loadModel();
    }

    console.log('Starting digit extraction and prediction...');
    const { digits, boxes, processedImageBase64 } = this.extractDigits(img, threshold, erosion, dilation);
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
    dilation: number
  ): Promise<{ predictions: { id: number; image: string; digit: number; confidence: number; box: number[] }[]; processedImageBase64: string }> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = async () => {
        try {
          const result = await this.predictDigitsFromImage(img, threshold, erosion, dilation);
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
    dilation: number
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
    const binaryData = this.toBinary(imageData, threshold);
    const erodedData = this.erode(binaryData, canvas.width, canvas.height, erosion);
    const dilatedData = this.dilate(erodedData, canvas.width, canvas.height, dilation);

    const boxes = this.findBoundingBoxes(dilatedData, canvas.width, canvas.height);
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

      // Invert if background is clearly light AND contrast is decent
      const invert = avgBrightness > 0.6 && contrast > 0.1;

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



  // --- Morphology operations ---
  private toBinary(imageData: ImageData, threshold: number): Uint8ClampedArray {
    const binary = new Uint8ClampedArray(imageData.data.length / 4);
    for (let i = 0; i < imageData.data.length; i += 4) {
      const avg = (imageData.data[i] + imageData.data[i + 1] + imageData.data[i + 2]) / 3;
      binary[i / 4] = avg < threshold ? 1 : 0;
    }
    return binary;
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
    reshapedTensor.data().then(data => {
      console.log('🧠 [Preprocess] Sample values:', data.slice(0, 10));
    });

    return reshapedTensor;
  }

}
