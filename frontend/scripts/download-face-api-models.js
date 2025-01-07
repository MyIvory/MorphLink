import fs from 'fs';
import https from 'https';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MODELS_URL = 'https://raw.githubusercontent.com/vladmandic/face-api/master/model';
const MODELS_DIR = path.join(__dirname, '../public/models');

const models = [
  'tiny_face_detector_model-weights_manifest.json',
  'tiny_face_detector_model-shard1',
  'face_landmark_68_model-weights_manifest.json',
  'face_landmark_68_model-shard1',
  'face_expression_model-weights_manifest.json',
  'face_expression_model-shard1'
];

if (!fs.existsSync(MODELS_DIR)) {
  fs.mkdirSync(MODELS_DIR, { recursive: true });
}

const downloadModel = (model) => {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(path.join(MODELS_DIR, model));
    https.get(`${MODELS_URL}/${model}`, response => {
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        console.log(`Downloaded ${model}`);
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(path.join(MODELS_DIR, model), () => {});
      reject(err);
    });
  });
};

async function downloadModels() {
  try {
    await Promise.all(models.map(model => downloadModel(model)));
    console.log('All models downloaded successfully');
  } catch (error) {
    console.error('Error downloading models:', error);
  }
}

downloadModels();
