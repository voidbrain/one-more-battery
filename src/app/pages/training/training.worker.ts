/// <reference lib="webworker" />

import * as tf from '@tensorflow/tfjs';

// tf.enableDebugMode();

const IMAGE_WIDTH = 28;
const IMAGE_HEIGHT = 28;
const NUM_CLASSES = 10;

async function loadRawData(): Promise<{ images: Float32Array, labels: Uint8Array }> {
  const response = await fetch('/one-more-battery/assets/data/mnist_images.png');
  const blob = await response.blob();
  const img = await createImageBitmap(blob);

  const labelsResponse = await fetch('/one-more-battery/assets/data/mnist_labels_uint8');
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
  try {
    // Dynamically import the backend
    const wasmBackend = await import('@tensorflow/tfjs-backend-wasm');

    // ✅ Tell tfjs where to load the wasm binaries
    wasmBackend.setWasmPaths({
      'tfjs-backend-wasm.wasm': '/one-more-battery/assets/wasm/tfjs-backend-wasm.wasm',
      'tfjs-backend-wasm-simd.wasm': '/one-more-battery/assets/wasm/tfjs-backend-wasm.wasm',
      'tfjs-backend-wasm-threaded-simd.wasm': '/one-more-battery/assets/wasm/tfjs-backend-wasm.wasm'
    });

    tf.env().set('WASM_HAS_SIMD_SUPPORT', false);

    const mt = await tf.env().getAsync('WASM_HAS_MULTITHREAD_SUPPORT') as boolean;
    const simd = await tf.env().getAsync('WASM_HAS_SIMD_SUPPORT') as boolean;
    postMessage({ type: 'log', message: `WASM multithreading support: ${mt}` });
    postMessage({ type: 'log', message: `WASM SIMD support: ${simd}` });


    // ✅ Set and initialize the backend
    await tf.setBackend('wasm');
    await tf.ready();

    postMessage({ type: 'log', message: `✅ Using backend: ${tf.getBackend()}` });
  } catch (err) {
    // Fallback
    postMessage({ type: 'log', message: `⚠️ WASM backend not available, falling back to CPU: ${err}` });
    await tf.setBackend('cpu');
    await tf.ready();
    postMessage({ type: 'log', message: '✅ Using CPU backend.' });
  }

  postMessage({ type: 'log', message: 'Backend set.' });
  postMessage({ type: 'log', message: 'Loading data...' });
  const startTime = performance.now();
  const { images, labels } = await loadRawData();
  const endTime = performance.now();
  postMessage({
    type: 'log',
    message: `Data loaded in ${(endTime - startTime).toFixed(2)} ms.`,
  });
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
  await model.save('downloads://model');
  postMessage({ type: 'done' });
});
