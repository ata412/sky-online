// Long-running local helper for free-tier quotas. It resumes the Thai audio
// batch after quota resets and exits only when every manifest clip is present.
require('dotenv').config();

const { spawn, execFileSync } = require('node:child_process');
const path = require('node:path');

const backendDirectory = path.resolve(__dirname, '../..');
const frontendDirectory = path.resolve(backendDirectory, '../frontend-next');
const retryMinutes = Math.max(5, Number(process.env.SPEECH_RESUME_MINUTES || 15));
const children = [];

function start(command, args, options) {
  const child = spawn(command, args, { stdio: 'inherit', ...options });
  children.push(child);
  return child;
}

function wait(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function waitForUrl(url, attempts = 60) {
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(3000) });
      if (response.ok) return;
    } catch {}
    await wait(1000);
  }
  throw new Error(`Timed out waiting for ${url}`);
}

function runGenerator(extraArgs = []) {
  return new Promise((resolve) => {
    const child = spawn(
      process.execPath,
      ['src/scripts/pregenerateSpeech.js', 'th', ...extraArgs],
      {
        cwd: backendDirectory,
        stdio: 'inherit',
        env: {
          ...process.env,
          SPEECH_API_ORIGIN: 'http://localhost:5001',
          SPEECH_SITE_ORIGIN: 'http://localhost:3000',
          SPEECH_GENERATION_PAUSE_MS: '0',
          SPEECH_GENERATION_CONCURRENCY: '8',
        },
      }
    );
    child.on('close', (code) => resolve(code));
  });
}

async function main() {
  const accessToken = execFileSync('gcloud', ['auth', 'print-access-token'], {
    encoding: 'utf8',
  }).trim();
  const googleCloudProject = process.env.GOOGLE_CLOUD_PROJECT || execFileSync(
    'gcloud',
    ['config', 'get-value', 'project'],
    { encoding: 'utf8' }
  ).trim();
  if (!accessToken || !googleCloudProject) {
    throw new Error('Google Cloud authentication or project is missing');
  }
  start(process.execPath, ['src/index.js'], {
    cwd: backendDirectory,
    env: {
      ...process.env,
      PORT: '5001',
      SPEECH_AUDIO_DIR: path.join(backendDirectory, 'audio-library'),
      SPEECH_GENERATION_ENABLED: 'true',
      TTS_MAX_REQUESTS_PER_HOUR: '10000',
      GOOGLE_CLOUD_TTS_ACCESS_TOKEN: accessToken,
      GOOGLE_CLOUD_PROJECT: googleCloudProject,
    },
  });
  start('npm', ['run', 'start', '--', '-p', '3000'], {
    cwd: frontendDirectory,
    env: { ...process.env, API_URL: 'http://localhost:5001' },
  });
  await Promise.all([
    waitForUrl('http://localhost:5001/api/health'),
    waitForUrl('http://localhost:3000/th/encyclopedia?speech_manifest=1'),
  ]);

  while (true) {
    const verification = await runGenerator(['--verify']);
    if (verification === 0) {
      console.log('Thai e-book speech generation is complete.');
      return;
    }
    const generation = await runGenerator();
    if (generation === 0 && await runGenerator(['--verify']) === 0) {
      console.log('Thai e-book speech generation is complete.');
      return;
    }
    console.log(`Quota unavailable; resuming in ${retryMinutes} minutes.`);
    await wait(retryMinutes * 60 * 1000);
  }
}

function stopChildren() {
  children.forEach((child) => {
    if (!child.killed) child.kill('SIGTERM');
  });
}

process.on('SIGINT', () => { stopChildren(); process.exit(130); });
process.on('SIGTERM', () => { stopChildren(); process.exit(143); });

main()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(stopChildren);
