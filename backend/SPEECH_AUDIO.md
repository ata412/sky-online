# E-book audio files

Thai e-book narration is generated ahead of time with Google Cloud Text-to-Speech
using `th-TH-Chirp3-HD-Sulafat`. Other languages retain the Gemini TTS setup. The
generated MP3 files live in `backend/audio-library/` and can be committed with
the application. This makes existing narration survive redeploys without a
Railway Volume or another Gemini request. New or edited text needs a fresh
pre-generation run; automatic creation is disabled by default.

For Thai, sign in with the Google Cloud CLI, select a billing-enabled project,
and enable `texttospeech.googleapis.com`. Then run the automatic helper from
`backend/`:

```sh
npm run speech:complete-th
```

The helper obtains a short-lived Google Cloud access token locally, starts both
services, and stores the finished MP3 files in `backend/audio-library/`.

For other languages, start the backend with `GEMINI_API_KEY` configured and
`SPEECH_AUDIO_DIR` pointing to `backend/audio-library` and
`SPEECH_GENERATION_ENABLED=true`. Start the Next.js site
with `API_URL` pointing to that backend. Set `TTS_MAX_REQUESTS_PER_HOUR`
high enough for the one-time local batch, then restore the normal production
limit. Example (in three terminals):

```sh
# From backend/
PORT=5001 SPEECH_AUDIO_DIR="$PWD/audio-library" SPEECH_GENERATION_ENABLED=true TTS_MAX_REQUESTS_PER_HOUR=10000 node src/index.js
# From frontend-next/
API_URL=http://localhost:5001 npm run start -- -p 3000
# From backend/
npm run speech:pregenerate -- th
```

The command reads the exact speech chunks used by the e-book page at
`/th/encyclopedia?speech_manifest=1`, calls the local speech endpoint, converts
WAV to MP3 with `ffmpeg`, and skips existing files on subsequent runs. Set
`SPEECH_SITE_ORIGIN` and `SPEECH_API_ORIGIN` if the servers are not at
`http://localhost:3000` and `http://localhost:5001`. For other languages,
replace `th` with `en`, `zh`, `lo`, `my`, or `vi`. Review translation content
before generating non-Thai product books: their full descriptions are fetched
separately when a reader opens a product.
Speech generation may consume billable quota. If the command stops on a
rate limit, rerun it later; existing MP3s are skipped.
Commit the completed `audio-library` files and deploy the backend to make them
available permanently on the live site.

File names are SHA-256 hashes of the text, language, provider and voice settings.
Changing the content or voice creates a new file without overwriting old audio.

The backend reads committed files in `backend/audio-library/` first and does
not create new audio in production by default. Missing clips fall back to the
device voice until the batch is rerun and deployed. To allow automatic creation
for new or edited content, set `SPEECH_GENERATION_ENABLED=true` and attach a
persistent Volume to the **backend** service. Its mount path is automatically
available as `RAILWAY_VOLUME_MOUNT_PATH`; new audio is saved under
`<mount path>/speech-audio`. Alternatively set `SPEECH_AUDIO_DIR` to an absolute
directory on a persistent volume. Without a volume, only the committed MP3s
are guaranteed to persist across deployments.

Audio is addressed by text, language, model, and voice. If any of those change,
a different file is needed. The browser can fall back to device speech if the
configured service is unavailable.
