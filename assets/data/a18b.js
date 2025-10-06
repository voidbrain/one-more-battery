const fs = require('fs');
const { PNG } = require('pngjs');

async function loadImages(filePath) {
  return new Promise((resolve, reject) => {
    const stream = fs.createReadStream(filePath).pipe(new PNG());
    stream.on('parsed', () => {
      const

image = new Float32Array(stream.width * stream.height);
      for (let y = 0; y < stream.height; y++) {
        for (let x = 0; x < stream.width; x++) {
          const idx = (stream.width * y + x) << 2;
          image[y * stream.width + x] = stream.data[idx] / 255;
        }
      }
      resolve(image);
    });
    stream.on('error', reject);
  });
}

async function loadLabels(filePath) {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, (err, data) => {
      if (err) {
        return reject(err);
      }
      resolve(new Uint8Array(data));
    });
  });
}

module.exports = { loadImages, loadLabels };
