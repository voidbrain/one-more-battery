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
      console.log('Model input shape:', this.model.inputs[0].shape);
    } catch (error) {
      console.error('Error loading model:', error);
    }
  }

  async predictNumber(imageTensor: tf.Tensor3D): Promise<{ digit: number | null; confidence: number | null }> {
    if (!this.model) {
      console.error('Model is not loaded');
      return { digit: null, confidence: null };
    }

    const processedTensor = tf.tidy(() => {
      let tensor = imageTensor;

      if (tensor.shape.length === 3 && tensor.shape[2] === 3) {
        tensor = tensor.mean(2).expandDims(-1); // Convert RGB to grayscale
      }

      // Resize, normalize, and reshape to [1, 28, 28, 1]
      tensor = tf.image.resizeBilinear(tensor, [28, 28]).div(255.0).reshape([1, 28, 28]);

      return tensor;
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
      const grayscale = imgTensor.mean(2).toFloat().expandDims(-1) as tf.Tensor3D;

      // Normalize and threshold
      const normalized = grayscale.div(255.0);

      // Adaptive thresholding
      const localMeanImage = tf.avgPool(normalized, [5, 5], [1, 1], 'same');
      const C = 0.03;
      const thresholded = normalized.greater(localMeanImage.sub(tf.scalar(C))).toFloat(); // Binary
      localMeanImage.dispose();

      const [height, width] = thresholded.shape;

      // Sum along the vertical axis to detect digit regions
      const projection = thresholded.sum(0).squeeze() as tf.Tensor1D;
      const projectionData = projection.arraySync() as number[];

      const digitBoxes: [number, number][] = [];
      let inBox = false;
      let start = 0;

      for (let x = 0; x < projectionData.length; x++) {
        if (projectionData[x] > 0 && !inBox) {
          start = x;
          inBox = true;
        } else if (projectionData[x] === 0 && inBox) {
          digitBoxes.push([start, x]);
          inBox = false;
        }
      }

      if (inBox) {
        digitBoxes.push([start, projectionData.length]);
      }

      const digitTensors: tf.Tensor3D[] = [];

      for (const [xStart, xEnd] of digitBoxes) {
        const digitWidth = xEnd - xStart;
        if (digitWidth > 2) {
          const cropped = thresholded.slice([0, xStart, 0], [height, digitWidth, 1]) as tf.Tensor3D;

          // Ensure the tensor has rank 3 before resizing
          const resized = tf.image.resizeBilinear(cropped, [28, 28]) as tf.Tensor3D;

          digitTensors.push(resized);

          // Optional: visual debug
          this.renderTensorToCanvas(resized.squeeze() as tf.Tensor2D, `Digit from x=${xStart}`);
        }
      }

      imgTensor.dispose();
      grayscale.dispose();
      normalized.dispose();
      // thresholded is disposed further down if it's part of the return chain,
      // but if not, it should be disposed here.
      // For now, let's assume it's handled by the existing logic.
      // thresholded.dispose(); // Already part of the digitTensors which are returned or disposed
      projection.dispose();

      return digitTensors;
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

  private renderTensorToCanvas(tensor: tf.Tensor2D, title = 'Digit') {
    tf.browser.toPixels(tensor).then((pixels) => {
      const canvas = document.createElement('canvas');
      canvas.width = tensor.shape[1];
      canvas.height = tensor.shape[0];
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const imgData = new ImageData(pixels, canvas.width, canvas.height);
        ctx.putImageData(imgData, 0, 0);
        document.body.appendChild(document.createElement('hr'));
        const label = document.createElement('div');
        label.textContent = title;
        document.body.appendChild(label);
        document.body.appendChild(canvas);
      }
    });
  }
}
