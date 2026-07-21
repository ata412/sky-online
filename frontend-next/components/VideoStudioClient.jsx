'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  CheckCircle2,
  Download,
  Film,
  ImagePlus,
  LoaderCircle,
  Package,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  UserRound,
  X,
} from 'lucide-react';
import { createVideoJob, getVideoDownloadUrl, getVideoJob, getVideoUrl } from '@/services/api';

const MAX_FILE_SIZE = 6 * 1024 * 1024;
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png']);

function readAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Unable to read image'));
    reader.readAsDataURL(file);
  });
}

function UploadCard({ icon: Icon, title, description, file, preview, onSelect, onClear, inputRef }) {
  const t = useTranslations('videoStudio');

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-navy-700 dark:bg-navy-900">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold-100 text-gold-700 dark:bg-gold-500/10 dark:text-gold-400">
          <Icon size={21} />
        </div>
        <div>
          <h2 className="font-bold text-navy-900 dark:text-white">{title}</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png"
        onChange={(event) => onSelect(event.target.files?.[0])}
        className="sr-only"
      />

      {preview ? (
        <div className="relative overflow-hidden rounded-xl bg-gray-100 dark:bg-navy-800">
          <img src={preview} alt="" className="aspect-[4/3] w-full object-contain" />
          <button
            type="button"
            onClick={onClear}
            className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-navy-950/80 text-white transition hover:bg-red-600"
            aria-label={t('removeImage')}
          >
            <X size={16} />
          </button>
          <div className="truncate border-t border-gray-200 bg-white px-3 py-2 text-xs text-gray-500 dark:border-navy-700 dark:bg-navy-900 dark:text-gray-400">
            {file?.name}
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex aspect-[4/3] w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 px-6 text-center transition hover:border-gold-500 hover:bg-gold-50 dark:border-navy-700 dark:bg-navy-950/50 dark:hover:border-gold-500 dark:hover:bg-gold-500/5"
        >
          <ImagePlus size={34} className="mb-3 text-gold-600 dark:text-gold-400" />
          <span className="text-sm font-semibold text-navy-900 dark:text-white">{t('chooseImage')}</span>
          <span className="mt-1 text-xs text-gray-400">{t('fileHint')}</span>
        </button>
      )}
    </div>
  );
}

export default function VideoStudioClient() {
  const t = useTranslations('videoStudio');
  const personInputRef = useRef(null);
  const productInputRef = useRef(null);
  const [personFile, setPersonFile] = useState(null);
  const [productFile, setProductFile] = useState(null);
  const [personPreview, setPersonPreview] = useState('');
  const [productPreview, setProductPreview] = useState('');
  const [consent, setConsent] = useState(false);
  const [job, setJob] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [pollWarning, setPollWarning] = useState('');

  useEffect(() => () => {
    if (personPreview) URL.revokeObjectURL(personPreview);
  }, [personPreview]);

  useEffect(() => () => {
    if (productPreview) URL.revokeObjectURL(productPreview);
  }, [productPreview]);

  useEffect(() => {
    if (!job?.id || !['submitting', 'processing'].includes(job.status)) return undefined;

    let cancelled = false;
    let timer;

    const poll = async () => {
      try {
        const response = await getVideoJob(job.id);
        if (cancelled) return;
        setJob(response.data.job);
        setPollWarning('');
        if (['submitting', 'processing'].includes(response.data.job.status)) {
          timer = window.setTimeout(poll, 8000);
        }
      } catch {
        if (cancelled) return;
        setPollWarning(t('statusRetry'));
        timer = window.setTimeout(poll, 12000);
      }
    };

    timer = window.setTimeout(poll, 5000);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [job?.id, job?.status, t]);

  const selectFile = (file, kind) => {
    setError('');
    if (!file) return;
    if (!ALLOWED_TYPES.has(file.type)) {
      setError(t('invalidType'));
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setError(t('fileTooLarge'));
      return;
    }

    const preview = URL.createObjectURL(file);
    if (kind === 'person') {
      setPersonFile(file);
      setPersonPreview(preview);
    } else {
      setProductFile(file);
      setProductPreview(preview);
    }
  };

  const clearFile = (kind) => {
    if (kind === 'person') {
      setPersonFile(null);
      setPersonPreview('');
      if (personInputRef.current) personInputRef.current.value = '';
    } else {
      setProductFile(null);
      setProductPreview('');
      if (productInputRef.current) productInputRef.current.value = '';
    }
  };

  const reset = () => {
    clearFile('person');
    clearFile('product');
    setConsent(false);
    setJob(null);
    setError('');
    setPollWarning('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!personFile || !productFile) {
      setError(t('imagesRequired'));
      return;
    }
    if (!consent) {
      setError(t('consentRequired'));
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      const [personImage, productImage] = await Promise.all([
        readAsDataUrl(personFile),
        readAsDataUrl(productFile),
      ]);
      const response = await createVideoJob({
        person_image: personImage,
        product_image: productImage,
        consent: true,
      });
      setJob(response.data.job);
    } catch (requestError) {
      setError(requestError.response?.data?.error || t('createError'));
    } finally {
      setSubmitting(false);
    }
  };

  const isWorking = submitting || ['submitting', 'processing'].includes(job?.status);
  const videoUrl = job?.status === 'completed' ? getVideoUrl(job.id) : '';
  const videoDownloadUrl = job?.status === 'completed' ? getVideoDownloadUrl(job.id) : '';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-navy-950">
      <section className="relative overflow-hidden bg-hero-gradient px-4 py-16 text-center text-white">
        <div className="absolute inset-0 opacity-20 [background-image:radial-gradient(circle_at_20%_20%,#d4a017_0,transparent_30%),radial-gradient(circle_at_80%_70%,#2563eb_0,transparent_35%)]" />
        <div className="relative mx-auto max-w-3xl">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gold-500 text-navy-950 shadow-xl">
            <Film size={29} />
          </div>
          <h1 className="text-3xl font-bold sm:text-5xl">{t('title')}</h1>
          <p className="mx-auto mt-4 max-w-2xl text-gray-300 sm:text-lg">{t('subtitle')}</p>
          <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-gray-300">
            <Sparkles size={14} className="text-gold-400" />
            {t('format')}
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
        {job?.status === 'completed' ? (
          <section className="mx-auto max-w-xl rounded-3xl border border-gray-200 bg-white p-6 shadow-xl dark:border-navy-700 dark:bg-navy-900 sm:p-8">
            <div className="mb-6 text-center">
              <CheckCircle2 size={48} className="mx-auto mb-3 text-green-500" />
              <h2 className="text-2xl font-bold text-navy-900 dark:text-white">{t('completedTitle')}</h2>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{t('completedDescription')}</p>
            </div>
            <video
              src={videoUrl}
              controls
              playsInline
              className="mx-auto aspect-[9/16] max-h-[640px] w-full rounded-2xl bg-black object-contain"
            />
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <a href={videoDownloadUrl} className="btn-gold inline-flex items-center justify-center gap-2">
                <Download size={18} /> {t('download')}
              </a>
              <button type="button" onClick={reset} className="btn-outline-gold inline-flex items-center justify-center gap-2">
                <RotateCcw size={18} /> {t('createAnother')}
              </button>
            </div>
            <p className="mt-4 text-center text-xs text-gray-400">{t('retentionNotice')}</p>
          </section>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="grid gap-6 md:grid-cols-2">
              <UploadCard
                icon={UserRound}
                title={t('personTitle')}
                description={t('personDescription')}
                file={personFile}
                preview={personPreview}
                onSelect={(file) => selectFile(file, 'person')}
                onClear={() => clearFile('person')}
                inputRef={personInputRef}
              />
              <UploadCard
                icon={Package}
                title={t('productTitle')}
                description={t('productDescription')}
                file={productFile}
                preview={productPreview}
                onSelect={(file) => selectFile(file, 'product')}
                onClear={() => clearFile('product')}
                inputRef={productInputRef}
              />
            </div>

            <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5 dark:border-navy-700 dark:bg-navy-900">
              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(event) => setConsent(event.target.checked)}
                  disabled={isWorking}
                  className="mt-1 h-4 w-4 rounded border-gray-300 text-gold-600 focus:ring-gold-500"
                />
                <span>
                  <span className="flex items-center gap-2 font-semibold text-navy-900 dark:text-white">
                    <ShieldCheck size={18} className="text-green-500" /> {t('consentTitle')}
                  </span>
                  <span className="mt-1 block text-sm leading-relaxed text-gray-500 dark:text-gray-400">
                    {t('consentDescription')}
                  </span>
                </span>
              </label>
            </div>

            {(error || job?.status === 'failed') && (
              <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-300">
                {job?.error || error}
              </div>
            )}

            {isWorking && (
              <div className="mt-6 rounded-2xl border border-gold-200 bg-gold-50 p-6 text-center dark:border-gold-500/20 dark:bg-gold-500/5">
                <LoaderCircle size={36} className="mx-auto animate-spin text-gold-600 dark:text-gold-400" />
                <h2 className="mt-3 font-bold text-navy-900 dark:text-white">{t('processingTitle')}</h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{t('processingDescription')}</p>
                {pollWarning && <p className="mt-2 text-xs text-amber-600">{pollWarning}</p>}
              </div>
            )}

            <button
              type="submit"
              disabled={isWorking || !personFile || !productFile || !consent}
              className="btn-gold mt-6 flex w-full items-center justify-center gap-2 py-4 text-base disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isWorking ? (
                <><LoaderCircle size={20} className="animate-spin" /> {t('creating')}</>
              ) : (
                <><Sparkles size={20} /> {t('createButton')}</>
              )}
            </button>
            <p className="mt-3 text-center text-xs text-gray-400">{t('safetyNotice')}</p>
          </form>
        )}
      </main>
    </div>
  );
}
