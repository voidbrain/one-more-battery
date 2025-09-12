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
    console.log('DigitRecognitionService constructor called.'); // Added for debugging
    this.modelPath = `${this.baseHref}assets/model.json`;
    this.loadModel();
  }

  async loadModel() {
    console.log('loadModel method called.'); // Added for debugging
    try {
      await tf.setBackend('cpu'); // Changed to CPU for debugging
      console.log('Using backend:', tf.getBackend());

      this.model = await tf.loadLayersModel(this.modelPath);

      if (!this.model) {
        throw new Error('Failed to load model');
      }

      console.log('Model loaded successfully');
      console.log('Model input shape:', this.model.inputs[0].shape);

      return true;
    } catch (error) {
      console.error('Error loading model:', error);
      throw error;
    }
  }

  async predictDigitsFromImage(
    img: HTMLImageElement,
    threshold: number,
    erosion: number,
    dilation: number
  ): Promise<{ predictions: { digit: number; confidence: number; box: number[] }[]; processedImageBase64: string }> {
    if (!this.model) {
      await this.loadModel();
    }

    const { digits, boxes, processedImageBase64 } = this.extractDigits(img, threshold, erosion, dilation);
    const predictions: { digit: number; confidence: number; box: number[] }[] =
      [];

    for (let i = 0; i < digits.length; i++) {
      const digitCanvas = digits[i];
      const box = boxes[i];
      const inputTensor = this.preprocessDigit(digitCanvas);
      const pred = this.model!.predict(inputTensor) as tf.Tensor;
      const data = (await pred.data()) as Float32Array;
      const confidence = Math.max(...data);
      const predictedDigit = data.indexOf(confidence);

      predictions.push({
        digit: predictedDigit,
        confidence: confidence,
        box: box,
      });

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
  ): Promise<{ predictions: { digit: number; confidence: number; box: number[] }[]; processedImageBase64: string }> {
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
      img.onerror = (error) => {
        reject(new Error('Failed to load image from base64 string.'));
      };
      img.src = base64Image;
    });
  }

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

    // Calculate the central part of the image (e.g., 50% of width and height)
    const cropWidth = img.width * 0.5;
    const cropHeight = img.height * 0.5;
    const cropX = (img.width - cropWidth) / 2;
    const cropY = (img.height - cropHeight) / 2;

    canvas.width = cropWidth;
    canvas.height = cropHeight;
    ctx.drawImage(img, cropX, cropY, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const binaryData = this.toBinary(imageData, threshold);
    const erodedData = this.erode(binaryData, canvas.width, canvas.height, erosion);
    const dilatedData = this.dilate(erodedData, canvas.width, canvas.height, dilation);
    const boxes = this.findBoundingBoxes(
      dilatedData,
      canvas.width,
      canvas.height
    );
    const digitCanvases: HTMLCanvasElement[] = [];

    for (const box of boxes) {
      const [x, y, w, h] = box;
      const digitCanvas = document.createElement('canvas');
      digitCanvas.width = 28;
      digitCanvas.height = 28;
      const dctx = digitCanvas.getContext('2d')!;

      dctx.drawImage(canvas, x, y, w, h, 0, 0, 28, 28);
      digitCanvases.push(digitCanvas);
    }

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

    return { digits: digitCanvases, boxes: boxes, processedImageBase64 };
  }

  private toBinary(imageData: ImageData, threshold: number): Uint8ClampedArray {
    const binary = new Uint8ClampedArray(imageData.data.length / 4);

    for (let i = 0; i < imageData.data.length; i += 4) {
      const r = imageData.data[i];
      const g = imageData.data[i + 1];
      const b = imageData.data[i + 2];
      const avg = (r + g + b) / 3;
      binary[i / 4] = avg < threshold ? 1 : 0;
    }

    return binary;
  }

  private erode(data: Uint8ClampedArray, width: number, height: number, iterations: number): Uint8ClampedArray {
    let eroded = data;
    for (let i = 0; i < iterations; i++) {
      eroded = this.morphology(eroded, width, height, 'erode');
    }
    return eroded;
  }

  private dilate(data: Uint8ClampedArray, width: number, height: number, iterations: number): Uint8ClampedArray {
    let dilated = data;
    for (let i = 0; i < iterations; i++) {
      dilated = this.morphology(dilated, width, height, 'dilate');
    }
    return dilated;
  }

  private morphology(data: Uint8ClampedArray, width: number, height: number, operation: 'erode' | 'dilate'): Uint8ClampedArray {
    const output = new Uint8ClampedArray(data.length);
    const matchValue = operation === 'erode' ? 1 : 0;

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

  private findBoundingBoxes(binary: Uint8ClampedArray, width: number, height: number): [number, number, number, number][] {
    // Simple connected component labeling (naive, not optimal)
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

      // Filter out elements smaller than 50px
      if ((maxX - minX >= 50) && (maxY - minY >= 50)) {
        boxes.push([minX, minY, maxX - minX, maxY - minY]);
      }
    };

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = getIndex(x, y);
        if (!visited[idx] && binary[idx] === 1) {
          floodFill(x, y);
        }
      }
    }

    return boxes;
  }

  private preprocessDigit(canvas: HTMLCanvasElement): tf.Tensor {
    const ctx = canvas.getContext('2d')!;
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const gray: number[] = [];

    for (let i = 0; i < imgData.data.length; i += 4) {
      const r = imgData.data[i];
      const g = imgData.data[i + 1];
      const b = imgData.data[i + 2];
      const avg = (r + g + b) / 3;
      gray.push((255 - avg) / 255); // Invert: black background
    }

    const tensor = tf.tensor3d(gray, [28, 28, 1]);
    return tensor.reshape([1, 28, 28]);
  }
}
