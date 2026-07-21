'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Bot, RotateCcw, Send, Sparkles, User } from 'lucide-react';
import { sendChatMessage } from '@/services/api';

export default function ChatbotClient() {
  const t = useTranslations('chatbot');
  const [messages, setMessages] = useState(() => [
    { role: 'assistant', text: t('greeting') },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const messagesElement = messagesRef.current;
    if (!messagesElement) return;

    messagesElement.scrollTo({
      top: messagesElement.scrollHeight,
      behavior: 'smooth',
    });
  }, [messages, loading]);

  const resetConversation = () => {
    setMessages([{ role: 'assistant', text: t('greeting') }]);
    setInput('');
    inputRef.current?.focus({ preventScroll: true });
  };

  const handleSend = async (event) => {
    event?.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    const history = messages;
    setMessages((current) => [...current, { role: 'user', text }]);
    setInput('');
    setLoading(true);

    try {
      const response = await sendChatMessage({ message: text, history });
      setMessages((current) => [
        ...current,
        { role: 'assistant', text: response.data.reply },
      ]);
    } catch (error) {
      setMessages((current) => [
        ...current,
        {
          role: 'assistant',
          text: error.response?.data?.error || t('errorDefault'),
        },
      ]);
    } finally {
      setLoading(false);
      inputRef.current?.focus({ preventScroll: true });
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  return (
    <section className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-navy-950 via-navy-900 to-navy-950 px-4 py-8 sm:py-12">
      <div className="mx-auto flex max-w-5xl flex-col">
        <div className="mb-6 text-center text-white">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gold-500 shadow-lg shadow-gold-500/20">
            <Bot className="text-navy-950" size={30} />
          </div>
          <h1 className="text-3xl font-bold sm:text-4xl">{t('title')}</h1>
          <p className="mx-auto mt-2 max-w-2xl text-gray-300">{t('pageDescription')}</p>
        </div>

        <div className="flex min-h-[620px] flex-1 flex-col overflow-hidden rounded-3xl border border-white/10 bg-white shadow-2xl dark:bg-navy-900">
          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 dark:border-navy-800 sm:px-6">
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <Sparkles size={16} className="text-gold-500" />
              <span>{t('subtitle')}</span>
            </div>
            <button
              type="button"
              onClick={resetConversation}
              className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-500 transition-colors hover:bg-gray-100 hover:text-navy-900 dark:text-gray-400 dark:hover:bg-navy-800 dark:hover:text-white"
            >
              <RotateCcw size={15} />
              <span className="hidden sm:inline">{t('newConversation')}</span>
            </button>
          </div>

          <div
            ref={messagesRef}
            className="flex-1 space-y-5 overflow-y-auto bg-gray-50/70 px-4 py-6 dark:bg-navy-950/50 sm:px-8"
            aria-live="polite"
          >
            {messages.map((message, index) => {
              const isUser = message.role === 'user';
              return (
                <div
                  key={`${message.role}-${index}`}
                  className={`flex items-end gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  {!isUser && (
                    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gold-500 text-navy-950">
                      <Bot size={18} />
                    </div>
                  )}
                  <div
                    className={`max-w-[82%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-6 shadow-sm sm:max-w-[72%] sm:text-base ${
                      isUser
                        ? 'rounded-br-md bg-gold-600 text-white'
                        : 'rounded-bl-md border border-gray-100 bg-white text-navy-900 dark:border-navy-700 dark:bg-navy-800 dark:text-white'
                    }`}
                  >
                    {message.text}
                  </div>
                  {isUser && (
                    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-navy-800 text-white dark:bg-navy-700">
                      <User size={17} />
                    </div>
                  )}
                </div>
              );
            })}

            {loading && (
              <div className="flex items-end gap-3">
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gold-500 text-navy-950">
                  <Bot size={18} />
                </div>
                <div className="rounded-2xl rounded-bl-md border border-gray-100 bg-white px-4 py-3 text-sm text-gray-400 shadow-sm dark:border-navy-700 dark:bg-navy-800">
                  {t('thinking')}
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-gray-100 bg-white p-4 dark:border-navy-800 dark:bg-navy-900 sm:p-6">
            <form onSubmit={handleSend} className="flex items-end gap-3">
              <textarea
                ref={inputRef}
                rows={1}
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t('placeholder')}
                className="max-h-32 min-h-12 flex-1 resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-navy-900 outline-none transition focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20 dark:border-navy-700 dark:bg-navy-800 dark:text-white sm:text-base"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gold-600 text-white transition-colors hover:bg-gold-700 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label={t('send')}
              >
                <Send size={20} />
              </button>
            </form>
            <p className="mt-3 text-center text-xs text-gray-400">{t('disclaimer')}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
