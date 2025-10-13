/// <reference lib="webworker" />

import * as tf from '@tensorflow/tfjs';

const IMAGE_WIDTH = 28;
const IMAGE_HEIGHT = 28;
const NUM_CLASSES = 10;

async function loadRawData(): Promise<{ images: Float32Array, labels: Uint8Array }> {
  const img = new Image();
  img.src = '/1more/en/assets/data/mnist_images.png';
  await new Promise(resolve => (img.onload = resolve));

  const labelsResponse = await fetch('/1more/en/assets/data/mnist_labels_uint8');
  const labels = new Uint8Array(await labelsResponse.arrayBuffer());

  const numSamples = labels.length;
  const images = new Float32Array(numSamples * IMAGE_WIDTH * IMAGE_HEIGHT);

  const canvas = new OffscreenCanvas(IMAGE_WIDTH, IMAGE_HEIGHT);
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

function* dataGenerator(images: Float32Array, labels: Uint8Array) {
  const numSamples = labels.length;
  for (let i = 0; i < numSamples; i++) {
    const imageOffset = i * IMAGE_WIDTH * IMAGE_HEIGHT;
    const image = images.slice(
      imageOffset,
      imageOffset + IMAGE_WIDTH * IMAGE_HEIGHT
    );
    const xs = tf
      .tensor2d(image, [IMAGE_WIDTH, IMAGE_HEIGHT])
      .reshape([1, IMAGE_WIDTH, IMAGE_HEIGHT]);
    const ys = tf
      .oneHot(tf.tensor1d([labels[i]], 'int32'), NUM_CLASSES)
      .squeeze();
    yield { xs, ys };
  }
}

function createModel() {
  const model = tf.sequential();

  model.add(
    tf.layers.flatten({ inputShape: [IMAGE_WIDTH, IMAGE_HEIGHT] })
  );

  model.add(
    tf.layers.dense({
      units: 128,
      activation: 'relu',
      kernelInitializer: 'varianceScaling',
    })
  );

  model.add(
    tf.layers.dense({
      units: NUM_CLASSES,
      kernelInitializer: 'varianceScaling',
      activation: 'softmax',
    })
  );

  model.compile({
    optimizer: tf.train.adam(),
    loss: 'categoricalCrossentropy',
    metrics: ['accuracy']
  });

  return model;
}

addEventListener('message', async ({ data }) => {
  postMessage({ type: 'log', message: 'Setting backend to webgl...' });
  await tf.setBackend('webgl');
  postMessage({ type: 'log', message: 'Backend set.' });
  postMessage({ type: 'log', message: 'Loading data...' });
  const { images, labels } = await loadRawData();
  postMessage({ type: 'log', message: 'Data loaded.' });
  postMessage({ type: 'log', message: 'Creating model...' });
  const model = createModel();
  postMessage({ type: 'log', message: 'Model created.' });
  postMessage({ type: 'log', message: 'Starting training...' });

  const dataset = tf.data.generator(() => dataGenerator(images, labels)).shuffle(1000).batch(512);

  await model.fitDataset(dataset, {
    epochs: 20,
    callbacks: {
      onEpochEnd: (epoch, logs) => {
        if (epoch % 5 === 0) {
          postMessage({ type: 'log', message: `Epoch ${epoch + 1}: loss = ${logs!['loss'].toFixed(4)}, acc = ${logs!['acc'].toFixed(4)}` });
        }
      }
    }
  });

  postMessage({ type: 'log', message: 'Training complete.' });
  const saveResult = await model.save('indexeddb://model');
  postMessage({ type: 'done', saveResult });
});
