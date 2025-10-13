import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import * as tf from '@tensorflow/tfjs';

const IMAGE_WIDTH = 28;
const IMAGE_HEIGHT = 28;
const IMAGE_CHANNELS = 1;
const NUM_CLASSES = 10;

@Component({
  selector: 'app-training',
  templateUrl: './training.component.html',
  styleUrls: ['./training.component.scss'],
  standalone: true,
  imports: [CommonModule],
})
export class TrainingComponent {
  public trainingLog: string[] = [];
  public model: tf.LayersModel | null = null;

  constructor() {}

  async loadRawData(): Promise<{images: Float32Array, labels: Uint8Array}> {
    const img = new Image();
    // img.src = '/assets/data/mnist_images.png';
    img.src = '/1more/en/assets/data/mnist_images.png';
    await new Promise(resolve => (img.onload = resolve));

    const labelsResponse = await fetch('/1more/en/assets/data/mnist_labels_uint8');
    const labels = new Uint8Array(await labelsResponse.arrayBuffer());

    const numSamples = labels.length;
    const images = new Float32Array(numSamples * IMAGE_WIDTH * IMAGE_HEIGHT);

    const canvas = document.createElement('canvas');
    canvas.width = IMAGE_WIDTH;
    canvas.height = IMAGE_HEIGHT;
    const ctx = canvas.getContext('2d')!;

    const imagesPerRow = Math.floor(img.width / IMAGE_WIDTH);

    for (let i = 0; i < numSamples; i++) {
      const imageOffset = i * IMAGE_WIDTH * IMAGE_HEIGHT;

      const row = Math.floor(i / imagesPerRow);
      const col = i % imagesPerRow;
      const sx = col * IMAGE_WIDTH;
      const sy = row * IMAGE_HEIGHT;

      ctx.drawImage(img, sx, sy, IMAGE_WIDTH, IMAGE_HEIGHT, 0, 0, IMAGE_WIDTH, IMAGE_HEIGHT);
      const imageData = ctx.getImageData(0, 0, IMAGE_WIDTH, IMAGE_HEIGHT);

      for (let j = 0; j < imageData.data.length / 4; j++) {
        images[imageOffset + j] = imageData.data[j * 4] / 255;
      }
    }
    return { images, labels };
  }

  * dataGenerator(images: Float32Array, labels: Uint8Array) {
    const numSamples = labels.length;
    for (let i = 0; i < numSamples; i++) {
      const imageOffset = i * IMAGE_WIDTH * IMAGE_HEIGHT;
      const image = images.slice(imageOffset, imageOffset + IMAGE_WIDTH * IMAGE_HEIGHT);
      const xs = tf.tensor2d(image, [IMAGE_WIDTH, IMAGE_HEIGHT]).reshape([IMAGE_WIDTH, IMAGE_HEIGHT, 1]);
      const ys = tf.oneHot(tf.tensor1d([labels[i]], 'int32'), NUM_CLASSES).squeeze();
      yield { xs, ys };
    }
  }

  createModel() {
    const model = tf.sequential();

    model.add(tf.layers.conv2d({
      inputShape: [IMAGE_WIDTH, IMAGE_HEIGHT, IMAGE_CHANNELS],
      kernelSize: 5,
      filters: 8,
      strides: 1,
      activation: 'relu',
      kernelInitializer: 'varianceScaling'
    }));

    model.add(tf.layers.maxPooling2d({ poolSize: [2, 2], strides: [2, 2] }));

    model.add(tf.layers.conv2d({
      kernelSize: 5,
      filters: 16,
      strides: 1,
      activation: 'relu',
      kernelInitializer: 'varianceScaling'
    }));

    model.add(tf.layers.maxPooling2d({ poolSize: [2, 2], strides: [2, 2] }));

    model.add(tf.layers.flatten());

    model.add(tf.layers.dense({
      units: NUM_CLASSES,
      kernelInitializer: 'varianceScaling',
      activation: 'softmax'
    }));

    model.compile({
      optimizer: tf.train.adam(),
      loss: 'categoricalCrossentropy',
      metrics: ['accuracy']
    });

    this.model = model;
    return model;
  }

  async train() {
    this.trainingLog = ['Setting backend to webgl...'];
    await tf.setBackend('webgl');
    this.trainingLog.push('Backend set.');
    this.trainingLog.push('Loading data...');
    const { images, labels } = await this.loadRawData();
    this.trainingLog.push('Data loaded.');
    this.trainingLog.push('Creating model...');
    const model = this.createModel();
    this.trainingLog.push('Model created.');
    this.trainingLog.push('Starting training...');

    const dataset = tf.data.generator(() => this.dataGenerator(images, labels)).shuffle(1000).batch(512);

    await model.fitDataset(dataset, {
      epochs: 20,
      callbacks: {
        onEpochEnd: (epoch, logs) => {
          if (epoch % 5 === 0) {
            this.trainingLog.push(`Epoch ${epoch + 1}: loss = ${logs!['loss'].toFixed(4)}, acc = ${logs!['acc'].toFixed(4)}`);
          }
        }
      }
    });

    this.trainingLog.push('Training complete.');
  }

  async saveModel() {
    if (this.model) {
      await this.model.save('downloads://model');
    }
  }
}
