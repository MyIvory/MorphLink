import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const modelsDir = path.join(__dirname, '../public/models');

// Створюємо папку models якщо її немає
if (!fs.existsSync(modelsDir)) {
  fs.mkdirSync(modelsDir, { recursive: true });
}

const models = [
  'tiny_face_detector_model-weights_manifest.json',
  'tiny_face_detector_model-shard1.bin',
  'face_landmark_68_model-weights_manifest.json',
  'face_landmark_68_model-shard1.bin',
  'face_expression_model-weights_manifest.json',
  'face_expression_model-shard1.bin'
];

const downloadFile = (filename) => {
  // Видаляємо .bin для URL, але зберігаємо для локального файлу
  const urlFilename = filename.replace('.bin', '');
  const url = `https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/${urlFilename}`;
  const filePath = path.join(modelsDir, filename);

  console.log(`Downloading ${filename}...`);

  https.get(url, (response) => {
    const file = fs.createWriteStream(filePath);
    response.pipe(file);

    file.on('finish', () => {
      file.close();
      console.log(`Downloaded ${filename}`);
    });
  }).on('error', (err) => {
    console.error(`Error downloading ${filename}:`, err);
    fs.unlink(filePath, () => {}); // Clean up failed download
  });
};

models.forEach(downloadFile);
