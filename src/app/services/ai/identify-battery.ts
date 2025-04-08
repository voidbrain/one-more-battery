import * as tf from '@tensorflow/tfjs';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class IdentifyBatteryService {
  private model: tf.LayersModel | null = null;

  constructor() {
    this.loadModel();
  }

  async loadModel() {
    try {
      await tf.setBackend('webgl');
      console.log('Loading model...');

      if (this.model) {
        this.model.dispose();
      }

      this.model = await tf.loadLayersModel('/assets/data/tfjs_files/model.json');
      console.log('Model loaded successfully');

      if (this.model.inputs.length > 0) {
        console.log('Model input shape:', this.model.inputs[0].shape);
      }
    } catch (error) {
      console.error('Error loading model:', error);
    }
  }

  async predictNumber(imageTensor: tf.Tensor3D): Promise<{ digit: number | null; confidence: number | null }> {
    if (!this.model) {
      console.error('Model is not loaded');
      return { digit: null, confidence: null };
    }

    if (imageTensor.shape[0] === 0 || imageTensor.shape[1] === 0) {
      console.warn('Empty image tensor passed to prediction');
      return { digit: null, confidence: null };
    }

    const processedTensor = tf.tidy(() => {
      let tensor = imageTensor;

      // Convert RGB to grayscale if needed
      if (tensor.shape.length === 3 && tensor.shape[2] === 3) {
        tensor = tensor.mean(2).expandDims(-1);
      }

      return tf.image
        .resizeBilinear(tensor, [28, 28])
        .div(255.0)
        .reshape([1, 28, 28]); // ✅ correct input shape
    });

    const predictions = this.model.predict(processedTensor) as tf.Tensor;
    const probabilities = await predictions.data();
    const digit = probabilities.indexOf(Math.max(...probabilities));
    const confidence = probabilities[digit];

    processedTensor.dispose();
    predictions.dispose();

    return { digit, confidence };
  }

  async extractDigits(image: HTMLImageElement): Promise<tf.Tensor3D[]> {
    return tf.tidy(() => {
      const imgTensor = tf.browser.fromPixels(image);
      const grayscale = imgTensor.mean(2).expandDims(-1);
      const normalized = grayscale.div(255.0);
      const thresholded = normalized.greater(tf.scalar(0.5)).toFloat();

      // 🧹 Cleanup old canvas
      const oldCanvas = document.getElementById('digit-overlay-canvas');
      if (oldCanvas) oldCanvas.remove();

      // 📐 Overlay canvas
      const canvas = document.createElement('canvas');
      canvas.id = 'digit-overlay-canvas';
      canvas.width = image.width;
      canvas.height = image.height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(image, 0, 0); // Draw original image first
      document.body.appendChild(canvas);

      const [height, width] = thresholded.shape;
      const step = Math.floor(height / 10);
      const boxes: tf.Tensor3D[] = [];

      for (let y = 0; y < height - step; y += step) {
        for (let x = 0; x < width - step; x += step) {
          let region = thresholded.slice([y, x, 0], [step, step, 1]) as tf.Tensor3D;

          const maxVal = region.max().arraySync() as number;

          if (maxVal > 0) {
            boxes.push(region);
            ctx.strokeStyle = 'red';
            ctx.lineWidth = 1;
            ctx.strokeRect(x, y, step, step);
          } else {
            region.dispose();
          }
        }
      }

      imgTensor.dispose();
      grayscale.dispose();
      normalized.dispose();
      thresholded.dispose();

      return boxes;
    });
  }

  async processPhoto(image: HTMLImageElement): Promise<{ digit: number | null; confidence: number | null }[]> {
    const digits = await this.extractDigits(image);
    const results: { digit: number | null; confidence: number | null }[] = [];

    for (const digitTensor of digits) {
      results.push(await this.predictNumber(digitTensor));
      digitTensor.dispose();
    }

    return results;
  }

  disposeModel() {
    if (this.model) {
      this.model.dispose();
      this.model = null;
      console.log('Model disposed.');
    }
  }
}
