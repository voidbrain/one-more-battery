import { Injectable } from '@angular/core';
import * as tf from '@tensorflow/tfjs';
import * as mobilenet from '@tensorflow-models/mobilenet';
import * as canvas from 'canvas';

@Injectable({
  providedIn: 'root',
})
export class IdentifyBatteryService {
  constructor() {}


  async processPhoto(imageElement: HTMLImageElement) {
    // Step 1: Load and preprocess the image
    console.log("process");

    const tensor = tf.browser.fromPixels(imageElement).resizeBilinear([224, 224]).toFloat().div(255).expandDims();
    console.log("process1");
    // Step 2: Detect the colored band
    const colorBand = this.detectColorBand(tensor); // Custom function to process the tensor for color segmentation

    // Step 3: Recognize the handwritten number
    const number = await this.recognizeHandwrittenNumber(tensor); // Custom function for digit recognition

    console.log('Detected Colored Band:', colorBand);
    console.log('Handwritten Number:', number);
    return
  }

  // Function to detect a colored band
  detectColorBand(tensor: tf.Tensor): string {
    const meanColors = tensor.mean([0, 1]).dataSync(); // Calculate mean RGB values
    const [r, g, b] = meanColors;
    if (r > g && r > b) return 'Red';
    if (g > r && g > b) return 'Green';
    if (b > r && b > g) return 'Blue';
    return 'Unknown';
  }

  // Function to recognize a handwritten number
  async recognizeHandwrittenNumber(tensor: tf.Tensor) {
    const mnist = await tf.loadLayersModel('https://storage.googleapis.com/tfjs-models/tfjs/mnist_model/model.json');
    const grayscaleTensor = tensor.mean(2).expandDims(-1); // Convert RGB to grayscale
    const prediction = mnist.predict(grayscaleTensor) as tf.Tensor;
    const number = prediction.argMax(1).dataSync()[0]; // Get the most probable digit
    return number;
  }


}
