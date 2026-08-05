'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import {
  ArrowRight,
  BookMarked,
  BookOpen,
  Bookmark,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Info,
  PackageSearch,
  Search,
  Square,
  Volume2,
  X,
} from 'lucide-react';
import { Link } from '@/i18n/routing';
import { getIngredientKnowledge } from '@/data/ingredientKnowledgeTranslations';

const speechLocales = {
  th: 'th-TH',
  en: 'en-US',
  zh: 'zh-CN',
  lo: 'lo-LA',
  my: 'my-MM',
  vi: 'vi-VN',
};

function detectSpeechLanguage(text, fallbackLocale) {
  const scripts = [
    { lang: 'th-TH', count: (text.match(/[\u0E00-\u0E7F]/g) || []).length },
    { lang: 'lo-LA', count: (text.match(/[\u0E80-\u0EFF]/g) || []).length },
    { lang: 'my-MM', count: (text.match(/[\u1000-\u109F]/g) || []).length },
    { lang: 'zh-CN', count: (text.match(/[\u3400-\u9FFF]/g) || []).length },
    { lang: 'en-US', count: (text.match(/[A-Za-z]/g) || []).length },
  ].sort((a, b) => b.count - a.count);

  return scripts[0].count > 0 ? scripts[0].lang : speechLocales[fallbackLocale] || 'th-TH';
}

function selectVoice(language) {
  const voices = window.speechSynthesis.getVoices();
  const exact = voices.find((voice) => voice.lang.toLowerCase() === language.toLowerCase());
  if (exact) return exact;

  const languageCode = language.split('-')[0].toLowerCase();
  return voices.find((voice) => voice.lang.toLowerCase().startsWith(languageCode)) || null;
}

function createPhrasePattern(phrase) {
  const words = String(phrase || '').trim().split(/\s+/).filter(Boolean);
  if (!words.length) return null;
  const escapedWords = words.map((word) => word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  return new RegExp(escapedWords.join('\\s+'), 'giu');
}

function removeSpeechPhrase(text, phrase) {
  const pattern = createPhrasePattern(phrase);
  if (!pattern) return String(text || '');
  return String(text || '').replace(pattern, ' ').replace(/\s{2,}/g, ' ').trim();
}

function joinSpeechParts(parts, repeatedPhrase = '') {
  const phrasePattern = createPhrasePattern(repeatedPhrase);
  const seenParts = new Set();
  let phraseSpoken = false;

  return parts
    .filter(Boolean)
    .map((part) => {
      let value = String(part).trim();
      if (phrasePattern) {
        phrasePattern.lastIndex = 0;
        value = value.replace(phrasePattern, (match) => {
          if (phraseSpoken) return ' ';
          phraseSpoken = true;
          return match;
        });
      }
      return value.replace(/\s{2,}/g, ' ').trim();
    })
    .filter((part) => {
      if (!part) return false;
      const comparison = part
        .toLocaleLowerCase()
        .replace(/[^\p{L}\p{N}]+/gu, ' ')
        .trim();
      if (!comparison || seenParts.has(comparison)) return false;
      seenParts.add(comparison);
      return true;
    })
    .join('. ');
}

function createUtterance(text, language, voice) {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = language;
  utterance.voice = voice;
  utterance.rate = language.startsWith('th') ? 0.9 : 0.94;
  utterance.pitch = 1;
  utterance.volume = 1;
  return utterance;
}

function speakMultilingual(text, locale, isActive, onFinish) {
  // Select one dominant language and one voice for the whole reading session.
  // Product and brand names often contain another script; detecting every
  // sentence separately makes the browser alternate between unrelated voices.
  const readingLanguage = detectSpeechLanguage(text, locale);
  const readingVoice = selectVoice(readingLanguage);
  const chunks = text
    .split(/(?<=[.!?。！？])\s*|\n+/u)
    .map((chunk) => chunk.trim())
    .filter(Boolean);
  let index = 0;

  const speakNext = () => {
    if (!isActive()) return;
    if (index >= chunks.length) {
      onFinish();
      return;
    }
    const utterance = createUtterance(chunks[index], readingLanguage, readingVoice);
    index += 1;
    let advanced = false;
    const advanceOnce = () => {
      if (advanced) return;
      advanced = true;
      speakNext();
    };
    utterance.onend = advanceOnce;
    utterance.onerror = advanceOnce;
    window.speechSynthesis.speak(utterance);
  };

  speakNext();
}

const categoryThemes = {
  'วิตามิน': { color: '#1e7496', artPosition: '0% 50%' },
  'โปรตีน': { color: '#b95c32', artPosition: '33.333% 100%' },
  'ความงาม': { color: '#a44962', artPosition: '0% 0%' },
  'ย่อยอาหาร': { color: '#39765a', artPosition: '100% 0%' },
  'กระดูก': { color: '#725693', artPosition: '100% 50%' },
  'ไฟเบอร์': { color: '#7a7727', artPosition: '66.667% 0%' },
  'กาแฟ': { color: '#75482f', artPosition: '100% 100%' },
  'ช็อกโกแลต': { color: '#604238', artPosition: '100% 100%' },
};

const defaultTheme = { color: '#39765a', artPosition: '66.667% 0%' };
const ingredientArtPositions = {
  collagen: '0% 0%',
  inulin: '33.333% 0%',
  fiber: '66.667% 0%',
  probiotics: '100% 0%',
  'vitamin-c': '0% 50%',
  'omega-3': '33.333% 50%',
  lutein: '66.667% 50%',
  'calcium-vitamin-d': '100% 50%',
  magnesium: '0% 100%',
  protein: '33.333% 100%',
  biotin: '66.667% 100%',
  antioxidants: '100% 100%',
};

function IngredientArtwork({ position, className = '' }) {
  return (
    <span
      className={`block bg-no-repeat ${className}`}
      style={{
        backgroundImage: "url('/encyclopedia/ingredients/ingredient-atlas.png')",
        backgroundPosition: position,
        backgroundSize: '400% 300%',
      }}
      aria-hidden="true"
    />
  );
}

function cleanEncyclopediaText(value, { preserveLines = false } = {}) {
  if (!value) return '';
  const cleanedLines = String(value)
    .replace(/[\p{Extended_Pictographic}\uFE0F\u200D]/gu, '')
    .replace(/\r/g, '')
    .split('\n')
    .map((line) =>
      line
        .replace(/^\s*(?:[•●▪◦→\-–—]+\s*)+/, '')
        .replace(/\s+/g, ' ')
        .trim()
    )
    .filter(Boolean);

  return preserveLines ? cleanedLines.join('\n') : cleanedLines.join(' ');
}

function createSummaryLines(value) {
  const cleaned = cleanEncyclopediaText(value, { preserveLines: true });
  if (!cleaned) return [];

  const lines = cleaned
    .split('\n')
    .flatMap((line) => line.split(/(?<=[.!?。！？])\s+/u))
    .map((line) => line.trim())
    .filter(Boolean);

  return [...new Set(lines)];
}

function createProductSummaryLines(value, productName) {
  const lines = createSummaryLines(value);
  const normalizedName = cleanEncyclopediaText(productName)
    .toLocaleLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim();
  const nameTokens = new Set(normalizedName.split(/\s+/).filter((token) => token.length > 1));
  const detailCue =
    /(ช่วย|มีส่วน|บำรุง|เสริม|ลด|เพิ่ม|เหมาะ|ประกอบ|อุดม|ควร|รับประทาน|ชง|ผลิตภัณฑ์|อาหาร|เครื่องดื่ม|รสชาติ|ปริมาณ|คุณสมบัติ|ประโยชน์|help|support|promote|reduce|increase|contain|provide|benefit|formula|serving|product|drink|supplement)/iu;
  let reachedDescription = false;

  return lines.filter((line) => {
    const normalizedLine = line
      .toLocaleLowerCase()
      .replace(/[^\p{L}\p{N}]+/gu, ' ')
      .trim();
    if (!normalizedLine) return false;

    const lineTokens = normalizedLine.split(/\s+/).filter((token) => token.length > 1);
    const matchingNameTokens = lineTokens.filter((token) => nameTokens.has(token)).length;
    const repeatsProductName =
      normalizedLine === normalizedName ||
      (
        nameTokens.size >= 2 &&
        matchingNameTokens >= Math.min(2, nameTokens.size) &&
        lineTokens.length <= nameTokens.size + 5
      );
    if (repeatsProductName) return false;

    const looksLikeLeadingAlias =
      !reachedDescription &&
      line.length <= 140 &&
      lineTokens.length <= 12 &&
      !detailCue.test(line);
    if (looksLikeLeadingAlias) return false;

    reachedDescription = true;
    return true;
  });
}

function BookReader({ article, products, speakingId, onSpeak, onStopSpeech, onClose }) {
  const t = useTranslations('encyclopedia');
  const [page, setPage] = useState(0);
  const [opened, setOpened] = useState(false);
  const [turningPage, setTurningPage] = useState(null);
  const pageRef = useRef(0);
  const turningRef = useRef(false);
  const turnTimerRef = useRef(null);
  const linkedProducts = article.relatedProducts || products.filter((product) => {
    const haystack = [product.name, product.description, product.full_description]
      .filter(Boolean)
      .join(' ')
      .toLocaleLowerCase();
    return article.keywords.some((keyword) => haystack.includes(keyword.toLocaleLowerCase()));
  });
  const isSpeaking = speakingId === `knowledge-${article.id}-page-${page}`;
  const pageTitles = article.pageTitles || [
    t('bookIntroduction'),
    t('whatItHelps'),
    t('bookSourcesAndNotes'),
    t('bookRelatedAndReferences'),
  ];

  const changePage = useCallback((nextPage) => {
    const currentPage = pageRef.current;
    if (
      turningRef.current ||
      nextPage === currentPage ||
      nextPage < 0 ||
      nextPage > 3
    ) return;

    onStopSpeech();
    const direction = nextPage > currentPage ? 'next' : 'previous';
    turningRef.current = true;
    setTurningPage({ from: currentPage, to: nextPage, direction });
    pageRef.current = nextPage;
    setPage(nextPage);
    turnTimerRef.current = window.setTimeout(() => {
      turningRef.current = false;
      setTurningPage(null);
    }, 920);
  }, [onStopSpeech]);

  useEffect(() => {
    const openTimer = window.setTimeout(() => setOpened(true), 80);
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
      if (event.key === 'ArrowRight') changePage(pageRef.current + 1);
      if (event.key === 'ArrowLeft') changePage(pageRef.current - 1);
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.clearTimeout(openTimer);
      window.clearTimeout(turnTimerRef.current);
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [changePage, onClose]);

  const previewText = (pageNumber) => {
    if (pageNumber === 0) return article.summary;
    if (pageNumber === 1) return article.benefits[0];
    if (pageNumber === 2) return article.sources;
    return linkedProducts[0]?.name || article.sourceLabel;
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-[#17130e]/90 p-3 backdrop-blur-sm sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={article.title}
    >
      <button
        type="button"
        onClick={onClose}
        className="fixed right-4 top-4 z-[120] flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-black/30 text-white transition hover:bg-[#8d312c] sm:right-7 sm:top-7"
        aria-label={t('closeBook')}
      >
        <X size={20} />
      </button>

      <div className={`encyclopedia-book-stage w-full max-w-5xl ${opened ? 'is-open' : ''}`}>
        <div className="encyclopedia-book relative h-[calc(100dvh-4.5rem)] max-h-[650px] min-h-0 rounded-r-2xl border-y border-r border-[#b59a6c] bg-[#f8f0df] shadow-[24px_30px_70px_rgba(0,0,0,0.55)] sm:h-[calc(100dvh-6rem)] dark:bg-[#211e19]">
          <div className="pointer-events-none absolute inset-y-0 left-1/2 z-20 hidden w-8 -translate-x-1/2 bg-gradient-to-r from-black/10 via-white/30 to-black/10 lg:block dark:via-white/5" />
          <div className="grid h-full min-h-0 overflow-hidden rounded-r-2xl lg:grid-cols-2">
            <aside className="relative hidden flex-col justify-between overflow-hidden border-r border-[#d7c7a9] bg-[#eee2cb] p-7 lg:flex lg:min-h-0 dark:border-[#4c4337] dark:bg-[#2b261f]">
              <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(#d5c3a2_1px,transparent_1px)] [background-size:100%_31px] dark:opacity-10" />
              <div className="relative">
                <p className="font-serif text-sm italic text-[#8d312c]">{article.alias}</p>
                {article.heroImageUrl ? (
                  <div className="mt-4 flex aspect-square w-full max-w-[220px] items-center justify-center border border-[#cdbb99] bg-[#fffaf0] shadow-[0_12px_32px_-22px_rgba(65,45,20,0.7)] dark:bg-[#25211b]">
                    <img
                      src={article.heroImageUrl}
                      alt={article.title}
                      className="h-full w-full object-contain p-5"
                    />
                  </div>
                ) : (
                  <IngredientArtwork
                    position={article.artPosition || ingredientArtPositions[article.id]}
                    className="mt-4 aspect-square w-full max-w-[220px] border border-[#cdbb99] shadow-[0_12px_32px_-22px_rgba(65,45,20,0.7)]"
                  />
                )}
                <h2 className={`mt-4 font-bold leading-tight text-[#30271b] dark:text-[#f3ead7] ${
                  article.productMeta ? 'text-xl sm:text-2xl' : 'text-2xl sm:text-3xl'
                }`}>
                  {article.title}
                </h2>
              </div>
              <div className="relative mt-5">
                <div className="flex gap-1.5">
                  {pageTitles.map((title, index) => (
                    <button
                      key={title}
                      type="button"
                      onClick={() => changePage(index)}
                      className={`h-1.5 flex-1 rounded-full transition ${
                        index <= page ? 'bg-[#8d312c]' : 'bg-[#cbb996] dark:bg-[#544a3c]'
                      }`}
                      aria-label={title}
                    />
                  ))}
                </div>
                <p className="mt-3 text-xs font-semibold text-[#85755c] dark:text-[#ad9f89]">
                  {t('bookStep', { current: page + 1, total: pageTitles.length })}
                </p>
              </div>
            </aside>

            <section className="encyclopedia-book-page flex h-full min-h-0 flex-col overflow-y-auto p-6 sm:p-7">
              <div className="mb-6 flex items-center justify-between border-b border-[#d9caae] pb-4 dark:border-[#4b4337]">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#9a835d]">
                    {t('bookChapter', { number: page + 1 })}
                  </p>
                  <h3 className={`mt-1 font-bold text-[#30271b] dark:text-[#f3ead7] ${
                    page === 0 && article.productMeta ? 'text-lg sm:text-xl' : 'text-xl sm:text-2xl'
                  }`}>
                    {pageTitles[page]}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => onSpeak(article, page)}
                  className={`flex h-11 w-11 items-center justify-center rounded-full border transition ${
                    isSpeaking
                      ? 'border-[#8d312c] bg-[#8d312c] text-white'
                      : 'border-[#bca986] text-[#6e5c42] hover:bg-[#eee2cc] dark:border-[#5d5141] dark:text-[#d6c6aa]'
                  }`}
                  aria-label={isSpeaking ? t('stopReading') : t('listenArticle')}
                >
                  {isSpeaking ? <Square size={14} fill="currentColor" /> : <Volume2 size={18} />}
                </button>
              </div>

              <div className="flex-1">
                {page === 0 && (
                  <div>
                    <div className="mb-5 flex items-center gap-4 border-b border-[#ddd0b8] pb-5 lg:hidden dark:border-[#4b4337]">
                      {article.heroImageUrl ? (
                        <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center border border-[#cdbb99] bg-[#fffaf0] dark:bg-[#25211b]">
                          <img
                            src={article.heroImageUrl}
                            alt={article.title}
                            className="h-full w-full object-contain p-2"
                          />
                        </div>
                      ) : (
                        <IngredientArtwork
                          position={article.artPosition || ingredientArtPositions[article.id]}
                          className="h-20 w-20 flex-shrink-0 border border-[#cdbb99]"
                        />
                      )}
                      <div className="min-w-0">
                        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#9a835d]">
                          {article.alias}
                        </p>
                        <p className="mt-1 line-clamp-2 text-lg font-bold leading-snug text-[#30271b] dark:text-[#f3ead7]">
                          {article.title}
                        </p>
                      </div>
                    </div>
                    {article.productMeta ? (
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#9a835d]">
                          {t('productSummaryDescription')}
                        </p>
                        <div className="mt-3 space-y-2 border-l-2 border-[#c7b38e] pl-4 dark:border-[#5a4d3c]">
                          {(article.summaryLines?.length ? article.summaryLines : [article.summary]).map((line) => (
                            <p key={line} className="text-sm leading-7 text-[#514532] dark:text-[#d3c5ae]">
                              {line}
                            </p>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p className="font-serif text-lg leading-8 text-[#514532] dark:text-[#d3c5ae]">
                        {article.summary}
                      </p>
                    )}
                    <div className="mt-8 border-l-4 border-[#8d312c] bg-[#f2e8d5] p-5 dark:bg-[#2d2821]">
                      <p className="text-sm leading-7 text-[#685c48] dark:text-[#bdb19e]">
                        {article.introHint || t('bookIntroHint')}
                      </p>
                    </div>
                    {article.productMeta && (
                      <div className="mt-6">
                        <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[#9a835d]">
                          {t('productKeyInformation')}
                        </p>
                        <div className="grid grid-cols-3 gap-2">
                          {article.productMeta.map((item) => (
                            <div key={item.label} className="border border-[#d8c9aa] bg-[#fffaf0] p-3 dark:border-[#51483b] dark:bg-[#29251f]">
                              <p className="text-[10px] font-bold uppercase tracking-wider text-[#9a835d]">{item.label}</p>
                              <p className="mt-1 text-sm font-bold text-[#3e3324] dark:text-[#eadfcb]">{item.value}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {page === 1 && (
                  <ol className="space-y-5">
                    {article.benefits.map((benefit, index) => (
                      <li key={benefit} className="flex gap-4">
                        <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#8d312c] font-serif text-sm font-bold text-white">
                          {index + 1}
                        </span>
                        <p className="pt-1 text-sm leading-7 text-[#5f5340] dark:text-[#c6baa6]">{benefit}</p>
                      </li>
                    ))}
                  </ol>
                )}

                {page === 2 && (
                  <div className="space-y-5">
                    {article.fullDetails && (
                      <div className="max-h-52 overflow-y-auto border-l-4 border-[#8d312c] bg-[#f2e8d5] p-5 dark:bg-[#2d2821]">
                        <p className="text-sm font-bold text-[#8d312c]">{t('productOriginalDetails')}</p>
                        <p className="mt-2 whitespace-pre-line text-sm leading-7 text-[#665c49] dark:text-[#c2b6a2]">
                          {article.fullDetails}
                        </p>
                      </div>
                    )}
                    <div className="border-l-4 border-[#567565] bg-[#edf2ec] p-5 dark:bg-[#29312b]">
                      <p className="text-sm font-bold text-[#315c47] dark:text-[#a9cfb8]">{t('naturalSources')}</p>
                      <p className="mt-2 text-sm leading-7 text-[#665c49] dark:text-[#c2b6a2]">{article.sources}</p>
                    </div>
                    <div className="border-l-4 border-[#b17a37] bg-[#f6eddb] p-5 dark:bg-[#332d23]">
                      <p className="text-sm font-bold text-[#8e5d25] dark:text-[#e0b77e]">{t('importantNotes')}</p>
                      <p className="mt-2 text-sm leading-7 text-[#665c49] dark:text-[#c2b6a2]">{article.caution}</p>
                    </div>
                  </div>
                )}

                {page === 3 && (
                  <div>
                    <p className="text-sm font-bold text-[#635641] dark:text-[#c7baa4]">
                      {article.relatedLabel || t('foundInProducts')}
                    </p>
                    {linkedProducts.length ? (
                      <div className="mt-3 space-y-2">
                        {linkedProducts.slice(0, 6).map((product) => (
                          <div key={product.id} className="flex items-center justify-between border-b border-[#e2d5bd] py-2 text-sm dark:border-[#474035]">
                            <span className="text-[#5e513d] dark:text-[#c6baa6]">{product.name}</span>
                            <Bookmark size={14} className="text-[#8d312c]" />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="mt-3 text-sm text-[#8b7d67]">—</p>
                    )}
                    {article.sourceExternal === false ? (
                      <Link
                        href={article.sourceUrl}
                        className="mt-8 inline-flex items-center gap-2 border-b border-[#8d312c] pb-1 text-sm font-bold text-[#8d312c]"
                      >
                        {article.sourceLabel}
                        <ArrowRight size={14} />
                      </Link>
                    ) : (
                      <a
                        href={article.sourceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-8 inline-flex items-center gap-2 border-b border-[#8d312c] pb-1 text-sm font-bold text-[#8d312c]"
                      >
                        {article.sourceLabel}
                        <ExternalLink size={14} />
                      </a>
                    )}
                  </div>
                )}
              </div>

              <div className="mt-8 flex items-center justify-between border-t border-[#d9caae] pt-5 dark:border-[#4b4337]">
                <button
                  type="button"
                  onClick={() => changePage(page - 1)}
                  disabled={page === 0}
                  className="inline-flex items-center gap-2 text-sm font-bold text-[#6a5a43] disabled:invisible dark:text-[#c8bba5]"
                >
                  <ChevronLeft size={18} /> {t('previousPage')}
                </button>
                {page < 3 ? (
                  <button
                    type="button"
                    onClick={() => changePage(page + 1)}
                    className="inline-flex items-center gap-2 rounded-full bg-[#8d312c] px-5 py-2.5 text-sm font-bold text-white"
                  >
                    {t('nextPage')} <ChevronRight size={18} />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={onClose}
                    className="inline-flex items-center gap-2 rounded-full bg-[#2e4a3c] px-5 py-2.5 text-sm font-bold text-white"
                  >
                    {t('finishReading')} <BookOpen size={17} />
                  </button>
                )}
              </div>
            </section>
          </div>

          {turningPage && (
            <div
              key={`${turningPage.from}-${turningPage.to}`}
              className={`encyclopedia-turning-sheet ${turningPage.direction}`}
              aria-hidden="true"
            >
              <div className="encyclopedia-sheet-face encyclopedia-sheet-front">
                <div className="encyclopedia-sheet-content">
                  <p>{t('bookChapter', {
                    number: turningPage.direction === 'next' ? turningPage.from + 1 : turningPage.to + 1,
                  })}</p>
                  <h4>
                    {pageTitles[
                      turningPage.direction === 'next' ? turningPage.from : turningPage.to
                    ]}
                  </h4>
                  <span>
                    {previewText(
                      turningPage.direction === 'next' ? turningPage.from : turningPage.to
                    )}
                  </span>
                  <i>{turningPage.direction === 'next' ? turningPage.from + 1 : turningPage.to + 1}</i>
                </div>
              </div>
              <div className="encyclopedia-sheet-face encyclopedia-sheet-back">
                <div className="encyclopedia-sheet-content">
                  <p>{t('bookChapter', {
                    number: turningPage.direction === 'next' ? turningPage.to + 1 : turningPage.from + 1,
                  })}</p>
                  <h4>
                    {pageTitles[
                      turningPage.direction === 'next' ? turningPage.to : turningPage.from
                    ]}
                  </h4>
                  <span>
                    {previewText(
                      turningPage.direction === 'next' ? turningPage.to : turningPage.from
                    )}
                  </span>
                  <i>{turningPage.direction === 'next' ? turningPage.to + 1 : turningPage.from + 1}</i>
                </div>
              </div>
            </div>
          )}

          <div className="encyclopedia-book-cover pointer-events-none absolute inset-0 z-50 origin-left">
            <div className="encyclopedia-cover-face encyclopedia-cover-front flex items-center justify-center rounded-r-2xl border-l-[14px] border-[#6f2423] bg-[#8d312c] text-[#f6e6c5]">
              <div className="border-y border-[#e5c38a]/40 px-10 py-9 text-center">
                <BookOpen className="mx-auto mb-5 text-[#efd39e]" size={42} />
                <p className="text-xs font-bold uppercase tracking-[0.2em]">{t('knowledgeLabel')}</p>
                <p className="mt-3 text-3xl font-bold">{article.title}</p>
              </div>
            </div>
            <div className="encyclopedia-cover-face encyclopedia-cover-back flex items-center justify-center rounded-l-2xl border-r-[10px] border-[#6f2423] bg-[#eadcc2] dark:bg-[#29241d]">
              <div className="h-[82%] w-[84%] rounded-sm border border-[#baa47d] bg-[#f6eddb] shadow-inner dark:border-[#544a3c] dark:bg-[#332d25]">
                <div className="h-full w-full opacity-30 [background-image:linear-gradient(#d5c3a2_1px,transparent_1px)] [background-size:100%_30px] dark:opacity-10" />
              </div>
            </div>
          </div>
        </div>
        <div className="mx-6 h-3 rounded-b-lg bg-[#bba680] shadow-xl dark:bg-[#4b4134]" />
      </div>
    </div>
  );
}

function KnowledgeArticle({ article, products, speakingId, onSpeak, onOpen }) {
  const t = useTranslations('encyclopedia');
  const linkedProducts = products.filter((product) => {
    const haystack = [product.name, product.description, product.full_description]
      .filter(Boolean)
      .join(' ')
      .toLocaleLowerCase();
    return article.keywords.some((keyword) => haystack.includes(keyword.toLocaleLowerCase()));
  });
  const isSpeaking = speakingId === `knowledge-${article.id}`;

  return (
    <details className="group border border-[#cfbea0] bg-[#fffaf0] open:shadow-[0_18px_40px_-28px_rgba(65,45,20,0.75)] dark:border-[#4d4438] dark:bg-[#211e19]">
      <summary className="flex cursor-pointer list-none items-start gap-4 p-5 marker:content-none sm:p-6">
        <IngredientArtwork
          position={ingredientArtPositions[article.id]}
          className="h-14 w-14 flex-shrink-0 rounded-full border-2 border-[#d4c3a3] shadow-sm dark:border-[#5b5041]"
        />
        <span className="min-w-0 flex-1">
          <span className="block text-xs font-semibold uppercase tracking-[0.12em] text-[#9b7b43]">
            {article.alias}
          </span>
          <span className="mt-1 block text-xl font-bold text-[#30271b] dark:text-[#f3ead7]">
            {article.title}
          </span>
          <span className="mt-2 line-clamp-2 block text-sm font-light leading-6 text-[#756953] dark:text-[#b6aa96]">
            {article.summary}
          </span>
          {linkedProducts.length > 0 && (
            <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-[#e8efe9] px-2.5 py-1 text-[11px] font-semibold text-[#315c47] dark:bg-[#29382f] dark:text-[#a9cfb8]">
              <Bookmark size={12} />
              {t('relatedProducts', { count: linkedProducts.length })}
            </span>
          )}
        </span>
        <ChevronDown className="mt-2 flex-shrink-0 text-[#8d312c] transition group-open:rotate-180" size={20} />
      </summary>

      <div className="border-t border-[#e5d9c3] px-5 pb-6 pt-5 sm:px-6 dark:border-[#484035]">
        <h4 className="text-sm font-bold text-[#8d312c]">{t('whatItHelps')}</h4>
        <ul className="mt-3 space-y-3">
          {article.benefits.map((benefit) => (
            <li key={benefit} className="flex gap-3 text-sm leading-6 text-[#615642] dark:text-[#c6baa6]">
              <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#8d312c]" />
              {benefit}
            </li>
          ))}
        </ul>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="border-l-2 border-[#567565] bg-[#edf2ec] p-4 dark:bg-[#29312b]">
            <p className="text-xs font-bold text-[#315c47] dark:text-[#a9cfb8]">{t('naturalSources')}</p>
            <p className="mt-1 text-xs leading-6 text-[#665c49] dark:text-[#b8ad99]">{article.sources}</p>
          </div>
          <div className="border-l-2 border-[#b17a37] bg-[#f6eddb] p-4 dark:bg-[#332d23]">
            <p className="text-xs font-bold text-[#8e5d25] dark:text-[#e0b77e]">{t('importantNotes')}</p>
            <p className="mt-1 text-xs leading-6 text-[#665c49] dark:text-[#b8ad99]">{article.caution}</p>
          </div>
        </div>

        {linkedProducts.length > 0 && (
          <div className="mt-5">
            <p className="text-xs font-bold text-[#635641] dark:text-[#c7baa4]">{t('foundInProducts')}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {linkedProducts.slice(0, 5).map((product) => (
                <span key={product.id} className="border border-[#d8c9aa] bg-white px-3 py-1.5 text-xs text-[#665944] dark:border-[#51483b] dark:bg-[#29251f] dark:text-[#c6baa6]">
                  {product.name}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[#e5d9c3] pt-4 dark:border-[#484035]">
          <a
            href={article.sourceUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#796747] underline decoration-[#bca77e] underline-offset-4 dark:text-[#c7b692]"
          >
            {article.sourceLabel}
            <ExternalLink size={13} />
          </a>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onSpeak(article)}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition ${
                isSpeaking
                  ? 'bg-[#8d312c] text-white'
                  : 'border border-[#bca986] text-[#6e5c42] hover:bg-[#eee2cc] dark:border-[#5d5141] dark:text-[#d6c6aa] dark:hover:bg-[#332d25]'
              }`}
            >
              {isSpeaking ? <Square size={13} fill="currentColor" /> : <Volume2 size={16} />}
              {isSpeaking ? t('stopReading') : t('listenArticle')}
            </button>
            <button
              type="button"
              onClick={() => onOpen(article)}
              className="inline-flex items-center gap-2 rounded-full bg-[#8d312c] px-4 py-2 text-xs font-bold text-white transition hover:bg-[#6f2423]"
            >
              <BookOpen size={15} />
              {t('openBook')}
            </button>
          </div>
        </div>
      </div>
    </details>
  );
}

function EncyclopediaEntry({ product, index, speakingId, onSpeak, onOpen }) {
  const t = useTranslations('encyclopedia');
  const [imgError, setImgError] = useState(false);
  const theme = categoryThemes[product.category] || defaultTheme;
  const isSpeaking = speakingId === product.id;
  const hasImage = product.image_url && !imgError;
  const displayName = cleanEncyclopediaText(product.name);
  const displayDescription = cleanEncyclopediaText(product.description);

  return (
    <article className="group relative flex h-full flex-col overflow-hidden border border-[#d8c9aa] bg-[#fffdf6] shadow-[0_12px_32px_-22px_rgba(65,45,20,0.6)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_42px_-24px_rgba(65,45,20,0.65)] dark:border-[#544a3c] dark:bg-[#201d18]">
      <div className="absolute inset-y-0 left-0 w-2 border-r border-[#dfd1b5] bg-[#ede1ca] dark:border-[#4c4438] dark:bg-[#302a22]" />
      <div className="absolute right-5 top-0 h-12 w-8" style={{ backgroundColor: theme.color }}>
        <div className="absolute -bottom-1 left-0 h-3 w-3 rotate-45 bg-[#fffdf6] dark:bg-[#201d18]" />
        <div className="absolute -bottom-1 right-0 h-3 w-3 rotate-45 bg-[#fffdf6] dark:bg-[#201d18]" />
      </div>

      <div className="flex items-center justify-between border-b border-[#e8ddc7] px-7 py-4 pl-9 text-[10px] font-bold uppercase tracking-[0.18em] text-[#89785f] dark:border-[#484035] dark:text-[#a99b87]">
        <span>{product.brand}</span>
        <span className="pr-10">{String(index + 1).padStart(2, '0')}</span>
      </div>

      <div className="relative mx-7 mt-6 flex h-52 items-center justify-center overflow-hidden border border-[#eadfc9] bg-[#f5eddd] dark:border-[#494136] dark:bg-[#29251f]">
        <div className="absolute inset-0 opacity-35 [background-image:linear-gradient(#d8c9aa_1px,transparent_1px)] [background-size:100%_28px] dark:opacity-10" />
        {hasImage ? (
          <img
            src={product.image_url}
            alt={displayName}
            className="relative h-full w-full object-contain p-5 transition duration-500 group-hover:scale-105"
            onError={() => setImgError(true)}
          />
        ) : (
          <IngredientArtwork position={theme.artPosition} className="relative h-full w-full" />
        )}
      </div>

      <div className="flex flex-1 flex-col px-7 pb-6 pl-9 pt-5">
        <div className="mb-3 flex items-center gap-2">
          <span
            className="inline-flex items-center gap-1.5 rounded-sm px-2.5 py-1 text-xs font-semibold text-white"
            style={{ backgroundColor: theme.color }}
          >
            {product.category}
          </span>
          {product.pv > 0 && (
            <span className="text-xs font-semibold text-[#9b7a39] dark:text-[#d3b36d]">{product.pv} PV</span>
          )}
        </div>

        <h2 className="text-xl font-bold leading-snug text-[#2d251a] dark:text-[#f3ead7]">
          {displayName}
        </h2>
        <p className="mt-3 line-clamp-4 flex-1 text-sm font-light leading-7 text-[#716550] dark:text-[#b5aa98]">
          {displayDescription}
        </p>

        <div className="mt-5 flex items-center justify-between border-t border-[#e8ddc7] pt-4 dark:border-[#484035]">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#a0937d]">{t('price')}</p>
            <p className="font-bold text-[#3c3021] dark:text-[#f3ead7]">
              ฿{Number(product.price).toLocaleString()}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onSpeak(product)}
              className={`flex h-10 w-10 items-center justify-center rounded-full border transition ${
                isSpeaking
                  ? 'border-[#8d312c] bg-[#8d312c] text-white'
                  : 'border-[#cdbb99] text-[#6e5c42] hover:bg-[#eee2cc] dark:border-[#5d5141] dark:text-[#d6c6aa] dark:hover:bg-[#332d25]'
              }`}
              aria-label={isSpeaking ? t('stopReading') : t('readAloud')}
              title={isSpeaking ? t('stopReading') : t('readAloud')}
            >
              {isSpeaking ? <Square size={14} fill="currentColor" /> : <Volume2 size={18} />}
            </button>
            <button
              type="button"
              onClick={() => onOpen(product)}
              className="inline-flex h-10 items-center gap-2 rounded-full bg-[#2e4a3c] px-4 text-xs font-bold text-white transition hover:bg-[#8d312c]"
            >
              {t('viewDetails')}
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

export default function EncyclopediaClient({ products }) {
  const t = useTranslations('encyclopedia');
  const locale = useLocale();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeBrand, setActiveBrand] = useState('all');
  const [speakingId, setSpeakingId] = useState(null);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [knowledgeSearch, setKnowledgeSearch] = useState('');
  const [showAllKnowledge, setShowAllKnowledge] = useState(false);
  const [activeArticle, setActiveArticle] = useState(null);
  const speechSessionRef = useRef(0);
  const ingredientKnowledge = useMemo(() => getIngredientKnowledge(locale), [locale]);

  const stopSpeech = useCallback(() => {
    speechSessionRef.current += 1;
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setSpeakingId(null);
  }, []);

  const closeBook = useCallback(() => {
    stopSpeech();
    setActiveArticle(null);
  }, [stopSpeech]);

  const categories = useMemo(
    () => [...new Set(products.map((product) => product.category).filter(Boolean))],
    [products]
  );
  const brands = useMemo(
    () => [...new Set(products.map((product) => product.brand).filter(Boolean))],
    [products]
  );
  const filteredProducts = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    return products.filter((product) => {
      const matchesQuery =
        !query ||
        [product.name, product.description, product.category, product.brand]
          .filter(Boolean)
          .some((value) => value.toLocaleLowerCase().includes(query));
      return (
        matchesQuery &&
        (activeCategory === 'all' || product.category === activeCategory) &&
        (activeBrand === 'all' || product.brand === activeBrand)
      );
    });
  }, [activeBrand, activeCategory, products, search]);
  const filteredKnowledge = useMemo(() => {
    const query = knowledgeSearch.trim().toLocaleLowerCase();
    if (!query) return ingredientKnowledge;
    return ingredientKnowledge.filter((article) =>
      [
        article.title,
        article.alias,
        article.summary,
        article.sources,
        article.caution,
        ...article.benefits,
        ...article.keywords,
      ].some((value) => value.toLocaleLowerCase().includes(query))
    );
  }, [ingredientKnowledge, knowledgeSearch]);

  useEffect(() => {
    setSpeechSupported(
      typeof window !== 'undefined' &&
        'speechSynthesis' in window &&
        'SpeechSynthesisUtterance' in window
    );
    return () => {
      speechSessionRef.current += 1;
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const speak = (product) => {
    if (!speechSupported) return;
    if (speakingId === product.id) {
      speechSessionRef.current += 1;
      window.speechSynthesis.cancel();
      setSpeakingId(null);
      return;
    }

    const speechSession = speechSessionRef.current + 1;
    speechSessionRef.current = speechSession;
    window.speechSynthesis.cancel();
    const speechText = t('speechText', {
      name: product.name,
      category: product.category || '',
      description: removeSpeechPhrase(product.description, product.name),
      price: Number(product.price).toLocaleString(),
    });
    setSpeakingId(product.id);
    speakMultilingual(
      speechText,
      locale,
      () => speechSessionRef.current === speechSession,
      () => setSpeakingId(null)
    );
  };

  const speakKnowledge = (article, page = null) => {
    if (!speechSupported) return;
    const speechId = page === null
      ? `knowledge-${article.id}`
      : `knowledge-${article.id}-page-${page}`;
    if (speakingId === speechId) {
      stopSpeech();
      return;
    }

    const speechSession = speechSessionRef.current + 1;
    speechSessionRef.current = speechSession;
    window.speechSynthesis.cancel();
    const pageTitles = article.pageTitles || [
      t('bookIntroduction'),
      t('whatItHelps'),
      t('bookSourcesAndNotes'),
      t('bookRelatedAndReferences'),
    ];
    const linkedProducts = article.relatedProducts || products.filter((product) => {
      const haystack = [product.name, product.description, product.full_description]
        .filter(Boolean)
        .join(' ')
        .toLocaleLowerCase();
      return article.keywords.some((keyword) =>
        haystack.includes(keyword.toLocaleLowerCase())
      );
    });
    const fullArticleText = [
      article.title,
      article.summary,
      locale === 'th' ? t('whatItHelps') : '',
      ...article.benefits,
      locale === 'th' ? t('naturalSources') : '',
      article.sources,
      locale === 'th' ? t('importantNotes') : '',
      article.caution,
    ];
    const pageSpeechText = [
      [
        pageTitles[0],
        article.title,
        ...(article.summaryLines?.length ? article.summaryLines : [article.summary]),
        ...(article.productMeta || []).flatMap((item) => [item.label, item.value]),
      ],
      [pageTitles[1], ...article.benefits],
      [
        pageTitles[2],
        article.fullDetails,
        t('naturalSources'),
        article.sources,
        t('importantNotes'),
        article.caution,
      ],
      [
        pageTitles[3],
        article.relatedLabel || t('foundInProducts'),
        ...linkedProducts.slice(0, 6).map((product) => product.name),
        article.sourceLabel,
      ],
    ];
    const speechParts = page === null ? fullArticleText : pageSpeechText[page];
    const repeatedProductName = article.productMeta && page !== 3 ? article.title : '';
    const speechText = joinSpeechParts(speechParts, repeatedProductName);
    setSpeakingId(speechId);
    speakMultilingual(
      speechText,
      locale,
      () => speechSessionRef.current === speechSession,
      () => setSpeakingId(null)
    );
  };

  const openProductBook = (product) => {
    const productText = [product.name, product.description, product.full_description]
      .filter(Boolean)
      .join(' ')
      .toLocaleLowerCase();
    const matchedKnowledge = ingredientKnowledge.filter((article) =>
      article.keywords.some((keyword) => productText.includes(keyword.toLocaleLowerCase()))
    );
    const fallbackArticle = ingredientKnowledge.find((article) => {
      const categoryMap = {
        'วิตามิน': 'vitamin-c',
        'โปรตีน': 'protein',
        'ความงาม': 'collagen',
        'ย่อยอาหาร': 'probiotics',
        'กระดูก': 'calcium-vitamin-d',
        'ไฟเบอร์': 'fiber',
        'กาแฟ': 'antioxidants',
        'ช็อกโกแลต': 'antioxidants',
      };
      return article.id === categoryMap[product.category];
    });
    const knowledge = matchedKnowledge.length
      ? matchedKnowledge
      : fallbackArticle
        ? [fallbackArticle]
        : [];
    const benefits = [...new Set(knowledge.flatMap((article) => article.benefits))].slice(0, 6);
    const relatedProducts = products
      .filter((item) => item.id !== product.id && item.category === product.category)
      .slice(0, 6);
    const theme = categoryThemes[product.category] || defaultTheme;
    const productSummaryLines = createProductSummaryLines(product.description, product.name);
    const productSummary = productSummaryLines.join(' ') || t('productNoDescription');

    setActiveArticle({
      id: `product-${product.id}`,
      title: cleanEncyclopediaText(product.name),
      alias: cleanEncyclopediaText([product.brand, product.category].filter(Boolean).join(' · ')),
      summary: productSummary,
      summaryLines: productSummaryLines.length
        ? productSummaryLines
        : [t('productNoDescription')],
      benefits: benefits.length ? benefits : [t('productBenefitFallback')],
      sources: knowledge.length
        ? knowledge.map((article) => `${article.title}: ${article.sources}`).join('\n\n')
        : t('productSourceFallback'),
      caution: [
        ...new Set(knowledge.map((article) => article.caution)),
        t('healthDisclaimer'),
      ].filter(Boolean).join('\n\n'),
      keywords: [product.name, product.category, product.brand].filter(Boolean),
      heroImageUrl: product.image_url,
      artPosition: theme.artPosition,
      fullDetails: cleanEncyclopediaText(product.full_description, { preserveLines: true }),
      introHint: t('productBookIntroHint'),
      productMeta: [
        { label: t('price'), value: `฿${Number(product.price).toLocaleString()}` },
        { label: 'PV', value: product.pv > 0 ? `${product.pv} PV` : '—' },
        { label: t('productStock'), value: Number(product.stock).toLocaleString() },
      ],
      pageTitles: [
        t('productBookOverview'),
        t('productBookBenefits'),
        t('productBookDetails'),
        t('productBookRelated'),
      ],
      relatedProducts: relatedProducts.map((item) => ({
        ...item,
        name: cleanEncyclopediaText(item.name),
      })),
      relatedLabel: t('relatedProductsTitle'),
      sourceUrl: `/products/${product.id}`,
      sourceLabel: t('viewOriginalProduct'),
      sourceExternal: false,
    });
  };

  const clearFilters = () => {
    setSearch('');
    setActiveCategory('all');
    setActiveBrand('all');
  };

  return (
    <div className="min-h-screen bg-[#e9dfca] text-[#2d251a] dark:bg-[#15130f]">
      <section className="relative overflow-hidden border-b border-[#c8b796] bg-[#233c32] px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <div className="absolute inset-0 opacity-10 [background-image:repeating-linear-gradient(90deg,transparent,transparent_3px,#fff_4px)]" />
        <div className="relative mx-auto w-full max-w-[900px] [perspective:1200px] md:w-[min(100%,calc((100dvh-7rem)*1.422))]">
          <div className="relative grid overflow-hidden rounded-xl border border-[#9c8051] bg-[#f8f0df] shadow-[18px_24px_45px_rgba(0,0,0,0.35)] md:grid-cols-2 md:rounded-l-lg md:rounded-r-3xl dark:bg-[#201d18]">
            <div className="relative overflow-hidden border-l-[6px] border-[#263b46] bg-[#dce7ea]">
              <Image
                src="/encyclopedia/product-encyclopedia-cover.jpg"
                alt={t('heroTitle')}
                width={532}
                height={748}
                priority
                className="h-auto w-full object-cover"
              />
              <div className="pointer-events-none absolute inset-y-0 right-0 w-3 bg-black/10 shadow-[-8px_0_18px_rgba(0,0,0,0.2)]" />
            </div>

            <div className="relative flex min-h-[430px] flex-col justify-between p-7 sm:p-8 md:min-h-0 lg:p-9">
              <div className="absolute inset-0 opacity-40 [background-image:linear-gradient(#d8c9aa_1px,transparent_1px)] [background-size:100%_32px] dark:opacity-10" />
              <Bookmark className="absolute right-7 top-0 text-[#8d312c] lg:right-9" size={42} fill="currentColor" />
              <div className="relative">
                <p className="font-serif text-sm italic text-[#8e7d63] dark:text-[#b2a48d]">{t('collectionLabel')}</p>
                <h2 className="mt-3 text-2xl font-bold leading-tight text-[#30271b] dark:text-[#f3ead7] lg:text-3xl">{t('collectionTitle')}</h2>
                <div className="mt-7 space-y-4 lg:mt-9">
                  {[
                    [products.length, t('productsCount')],
                    [categories.length, t('categoriesCount')],
                    [brands.length, t('brandsCount')],
                  ].map(([value, label], index) => (
                    <div key={label} className="flex items-end gap-4 border-b border-[#d7c9ae] pb-3 dark:border-[#4b4337]">
                      <span className="font-serif text-sm italic text-[#9c8b70]">0{index + 1}</span>
                      <span className="flex-1 text-sm text-[#665b49] dark:text-[#b8ad99]">{label}</span>
                      <span className="text-2xl font-bold text-[#8d312c]">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
              <a
                href="#book-index"
                className="relative mt-8 inline-flex w-fit items-center gap-2 border-b-2 border-[#8d312c] pb-1 text-sm font-bold text-[#8d312c]"
              >
                {t('explore')} <ArrowRight size={16} />
              </a>
            </div>
            <div className="pointer-events-none absolute inset-y-0 left-1/2 z-20 hidden w-7 -translate-x-1/2 bg-gradient-to-r from-black/20 via-white/30 to-black/15 opacity-70 mix-blend-multiply md:block dark:via-white/5" />
          </div>
          <div className="mx-5 h-3 rounded-b-lg bg-[#d3c3a4] shadow-lg md:mx-8 dark:bg-[#41392e]" />
        </div>
      </section>

      <section className="border-b border-[#c8b796] bg-[#f1e8d6] px-4 py-14 sm:px-6 lg:px-8 dark:border-[#443c31] dark:bg-[#191712]">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:items-end">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-[#8d312c]">
                <Info size={16} />
                {t('knowledgeLabel')}
              </div>
              <h2 className="mt-3 text-3xl font-bold leading-tight text-[#30271b] dark:text-[#f3ead7] sm:text-4xl">
                {t('knowledgeTitle')}
              </h2>
              <p className="mt-4 max-w-xl text-sm font-light leading-7 text-[#716550] dark:text-[#b5aa98]">
                {t('knowledgeDescription')}
              </p>
            </div>
            <div className="border-l-4 border-[#b17a37] bg-[#fff7e8] p-5 dark:bg-[#2a251e]">
              <p className="flex items-start gap-3 text-xs leading-6 text-[#6d604a] dark:text-[#c4b7a1]">
                <Info className="mt-1 flex-shrink-0 text-[#9b672d]" size={17} />
                {t('healthDisclaimer')}
              </p>
            </div>
          </div>

          <label className="relative mt-8 block">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9b8b71]" size={18} />
            <input
              type="search"
              value={knowledgeSearch}
              onChange={(event) => {
                setKnowledgeSearch(event.target.value);
                setShowAllKnowledge(true);
              }}
              placeholder={t('knowledgeSearchPlaceholder')}
              className="h-12 w-full border border-[#cdbd9f] bg-[#fffaf0] pl-11 pr-10 text-sm outline-none transition focus:border-[#8d312c] dark:border-[#4d4438] dark:bg-[#25211b] dark:text-[#f3ead7]"
            />
            {knowledgeSearch && (
              <button
                type="button"
                onClick={() => setKnowledgeSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#8d7d64]"
                aria-label={t('clearSearch')}
              >
                <X size={16} />
              </button>
            )}
          </label>

          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            {(showAllKnowledge ? filteredKnowledge : filteredKnowledge.slice(0, 6)).map((article) => (
              <KnowledgeArticle
                key={article.id}
                article={article}
                products={products}
                speakingId={speakingId}
                onSpeak={speakKnowledge}
                onOpen={setActiveArticle}
              />
            ))}
          </div>

          {filteredKnowledge.length === 0 && (
            <div className="mt-5 border border-dashed border-[#bca986] bg-[#f8f0df] p-10 text-center text-sm text-[#776a55] dark:border-[#4c4337] dark:bg-[#201d18] dark:text-[#a99c87]">
              {t('noKnowledgeResults')}
            </div>
          )}

          {!knowledgeSearch && filteredKnowledge.length > 6 && (
            <div className="mt-7 text-center">
              <button
                type="button"
                onClick={() => setShowAllKnowledge((value) => !value)}
                className="inline-flex items-center gap-2 border-b-2 border-[#8d312c] pb-1 text-sm font-bold text-[#8d312c]"
              >
                {showAllKnowledge ? t('showLessKnowledge') : t('showAllKnowledge', { count: filteredKnowledge.length })}
                <ChevronDown size={16} className={`transition ${showAllKnowledge ? 'rotate-180' : ''}`} />
              </button>
            </div>
          )}
        </div>
      </section>

      {activeArticle && (
        <BookReader
          article={activeArticle}
          products={products}
          speakingId={speakingId}
          onSpeak={speakKnowledge}
          onStopSpeech={stopSpeech}
          onClose={closeBook}
        />
      )}

      <section id="book-index" className="scroll-mt-20">
        <div className="sticky top-[var(--navbar-offset,4rem)] z-30 border-b border-[#c8b796] bg-[#eee5d3]/95 shadow-sm backdrop-blur transition-[top] duration-300 dark:border-[#443c31] dark:bg-[#191712]/95">
          <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
            <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-[#8d312c]">
              <BookMarked size={16} />
              {t('collectionLabel')}
            </div>
            <div className="grid gap-3 lg:grid-cols-[1fr_240px]">
              <label className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9b8b71]" size={18} />
                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder={t('searchPlaceholder')}
                  className="h-12 w-full border border-[#cdbd9f] bg-[#fffaf0] pl-11 pr-10 text-sm outline-none transition focus:border-[#8d312c] dark:border-[#4d4438] dark:bg-[#25211b] dark:text-[#f3ead7]"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#8d7d64]"
                    aria-label={t('clearSearch')}
                  >
                    <X size={16} />
                  </button>
                )}
              </label>
              <select
                value={activeBrand}
                onChange={(event) => setActiveBrand(event.target.value)}
                className="h-12 border border-[#cdbd9f] bg-[#fffaf0] px-4 text-sm outline-none focus:border-[#8d312c] dark:border-[#4d4438] dark:bg-[#25211b] dark:text-[#f3ead7]"
              >
                <option value="all">{t('allBrands')}</option>
                {brands.map((brand) => <option key={brand} value={brand}>{brand}</option>)}
              </select>
            </div>
            <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
              <button
                type="button"
                onClick={() => setActiveCategory('all')}
                className={`whitespace-nowrap rounded-full border px-4 py-2 text-xs font-bold transition ${
                  activeCategory === 'all'
                    ? 'border-[#8d312c] bg-[#8d312c] text-white'
                    : 'border-[#cdbd9f] bg-[#fffaf0] text-[#645843] dark:border-[#4d4438] dark:bg-[#25211b] dark:text-[#c8bda9]'
                }`}
              >
                {t('allCategories')}
              </button>
              {categories.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => setActiveCategory(category)}
                  className={`whitespace-nowrap rounded-full border px-4 py-2 text-xs font-bold transition ${
                    activeCategory === category
                      ? 'border-[#8d312c] bg-[#8d312c] text-white'
                      : 'border-[#cdbd9f] bg-[#fffaf0] text-[#645843] dark:border-[#4d4438] dark:bg-[#25211b] dark:text-[#c8bda9]'
                  }`}
                >
                  <span
                    className="mr-1 inline-block h-2 w-2 rounded-full"
                    style={{ backgroundColor: (categoryThemes[category] || defaultTheme).color }}
                  />
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-end justify-between border-b border-[#bdaa86] pb-4 dark:border-[#443c31]">
            <div>
              <p className="font-serif text-sm italic text-[#8d312c]">{t('collectionLabel')}</p>
              <h2 className="mt-1 text-3xl font-bold dark:text-[#f3ead7]">{t('collectionTitle')}</h2>
            </div>
            <p className="text-sm text-[#776a55] dark:text-[#a99c87]">{t('showing', { count: filteredProducts.length })}</p>
          </div>

          {filteredProducts.length ? (
            <div className="grid grid-cols-1 gap-7 md:grid-cols-2 xl:grid-cols-3">
              {filteredProducts.map((product, index) => (
                <EncyclopediaEntry
                  key={product.id}
                  product={product}
                  index={index}
                  speakingId={speakingId}
                  onSpeak={speak}
                  onOpen={openProductBook}
                />
              ))}
            </div>
          ) : (
            <div className="border border-dashed border-[#bca986] bg-[#f8f0df] px-6 py-20 text-center dark:border-[#4c4337] dark:bg-[#201d18]">
              <PackageSearch className="mx-auto text-[#8d312c]" size={42} />
              <h3 className="mt-5 text-xl font-bold dark:text-[#f3ead7]">{t('noResults')}</h3>
              <p className="mt-2 text-sm text-[#776a55] dark:text-[#a99c87]">{t('noResultsHint')}</p>
              <button
                type="button"
                onClick={clearFilters}
                className="mt-6 bg-[#8d312c] px-6 py-2.5 text-sm font-bold text-white"
              >
                {t('clearFilters')}
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
