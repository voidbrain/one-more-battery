// src/app/services/digit-recognition.service.ts
import { Injectable } from '@angular/core';
import * as tf from '@tensorflow/tfjs';

@Injectable({
  providedIn: 'root',
})
export class DigitRecognitionService {
  private model: tf.LayersModel | null = null;

  constructor() {
    this.loadModel();
  }

  async loadModel() {
    try {
      await tf.setBackend('webgl');
      console.log('Using backend:', tf.getBackend());

      this.model = await tf.loadLayersModel('/assets/data/tfjs_files/model.json');

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

  async predictDigitsFromImage(img: HTMLImageElement): Promise<number[]> {
    if (!this.model) {
      await this.loadModel();
    }

    const digits = this.extractDigits(img);
    const predictions: number[] = [];

    for (const digitCanvas of digits) {
      const inputTensor = this.preprocessDigit(digitCanvas);
      const pred = this.model!.predict(inputTensor) as tf.Tensor;
      const data = await pred.data();
      const predictedDigit = data.indexOf(Math.max(...data));
      predictions.push(predictedDigit);

      // Cleanup
      inputTensor.dispose();
      pred.dispose();
    }

    return predictions;
  }

  private extractDigits(img: HTMLImageElement): HTMLCanvasElement[] {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const binaryData = this.toBinary(imageData);
    const boxes = this.findBoundingBoxes(binaryData, canvas.width, canvas.height);
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

    return digitCanvases;
  }

  private toBinary(imageData: ImageData): Uint8ClampedArray {
    const threshold = 127;
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

      if ((maxX - minX > 5) && (maxY - minY > 5)) {
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
