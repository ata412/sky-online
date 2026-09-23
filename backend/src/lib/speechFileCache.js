const fs = require('node:fs/promises');
const path = require('node:path');

const AUDIO_DIRECTORY = process.env.SPEECH_AUDIO_DIR
  || (process.env.RAILWAY_VOLUME_MOUNT_PATH
    ? path.join(process.env.RAILWAY_VOLUME_MOUNT_PATH, 'speech-audio')
    : path.resolve(__dirname, '../../audio-cache'));
const BUNDLED_AUDIO_DIRECTORY = path.resolve(__dirname, '../../audio-library');

function audioFilePath(key, mimeType, directory = AUDIO_DIRECTORY) {
  if (!/^[a-f0-9]{64}$/.test(key)) throw new Error('Invalid speech cache key');
  return path.join(directory, `${key}.${mimeType === 'audio/wav' ? 'wav' : 'mp3'}`);
}

async function readAudioFile(key) {
  for (const directory of [BUNDLED_AUDIO_DIRECTORY, AUDIO_DIRECTORY]) {
    for (const mimeType of ['audio/mpeg', 'audio/wav']) {
      try {
        const audio = await fs.readFile(audioFilePath(key, mimeType, directory));
        if (audio.length > 0) return { audio, mimeType, provider: 'file' };
      } catch (error) {
        if (error.code !== 'ENOENT') throw error;
      }
    }
  }
  return null;
}

async function saveAudioFile(key, result) {
  await fs.mkdir(AUDIO_DIRECTORY, { recursive: true });
  const destination = audioFilePath(key, result.mimeType);
  const temporary = `${destination}.${process.pid}.${Date.now()}.tmp`;
  try {
    await fs.writeFile(temporary, result.audio, { flag: 'wx' });
    await fs.rename(temporary, destination);
  } catch (error) {
    await fs.rm(temporary, { force: true }).catch(() => {});
    throw error;
  }
  return destination;
}

module.exports = { AUDIO_DIRECTORY, BUNDLED_AUDIO_DIRECTORY, audioFilePath, readAudioFile, saveAudioFile };
