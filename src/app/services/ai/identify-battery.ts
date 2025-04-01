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

      // Ensure correct shape: Convert to grayscale if needed
      if (tensor.shape.length === 3 && tensor.shape[2] === 3) {
        tensor = tensor.mean(2).expandDims(-1); // Convert RGB to grayscale
      }

      // Resize, normalize, and reshape for model input
      tensor = tf.image.resizeBilinear(tensor, [28, 28]).div(255.0).reshape([1, 28, 28, 1]);

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
      const grayscale = imgTensor.mean(2).expandDims(-1);

      // Normalize image
      const normalized = grayscale.div(255.0);

      // Apply thresholding
      const thresholded = normalized.greater(tf.scalar(0.5)).toFloat();

      // Visualize the original image
      tf.browser.toPixels(imgTensor).then((pixels) => {
        const canvas = document.createElement('canvas');
        canvas.width = imgTensor.shape[1];
        canvas.height = imgTensor.shape[0];
        canvas.getContext('2d')?.putImageData(new ImageData(pixels, canvas.width, canvas.height), 0, 0);
        document.body.appendChild(canvas); // Append canvas to body
      });

      // Visualize the thresholded image
      tf.browser.toPixels(thresholded as tf.Tensor3D).then((pixels) => {
        const canvas = document.createElement('canvas');
        canvas.width = thresholded.shape[1] as number;
        canvas.height = thresholded.shape[0];
        canvas.getContext('2d')?.putImageData(new ImageData(pixels, canvas.width, canvas.height), 0, 0);
        document.body.appendChild(canvas); // Append canvas to body
      });

      // Get image dimensions
      const [height, width] = thresholded.shape;
      const step = Math.floor(height / 10); // Estimate digit size dynamically

      const boxes: tf.Tensor3D[] = [];
      for (let y = 0; y < height - step; y += step) {
        for (let x = 0; x < width - step; x += step) {
          let region = thresholded.slice([y, x, 1], [step, step]); // Extract region

          if (region.rank === 2) {
            region = region.expandDims(-1) as tf.Tensor3D; // Ensure Tensor3D format
          }

          // Convert scalar max to JavaScript number
          const maxVal = region.max();
          const maxValArray = maxVal.arraySync() as number; // Get max pixel value

          console.log(`Region at (${x}, ${y}) - Max Value:`, maxValArray); // Log max value

          if (maxValArray > 0) {
            boxes.push(region as tf.Tensor3D);
          } else {
            region.dispose(); // Dispose if not used
          }

          maxVal.dispose();
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
