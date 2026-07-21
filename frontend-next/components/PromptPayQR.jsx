'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import generatePayload from 'promptpay-qr';
import QRCode from 'qrcode';

const PROMPTPAY_ID = '0864944274';

export default function PromptPayQR({ amount }) {
  const t = useTranslations();
  const [qrDataUrl, setQrDataUrl] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const payload = generatePayload(PROMPTPAY_ID, { amount: Number(amount) });
    QRCode.toDataURL(payload, { width: 240, margin: 1 })
      .then((url) => {
        if (!cancelled) setQrDataUrl(url);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [amount]);

  if (!qrDataUrl) return null;

  return (
    <div className="bg-white dark:bg-navy-800 border border-gray-200 dark:border-navy-700 rounded-xl p-5 flex flex-col items-center gap-2">
      <p className="text-sm font-semibold text-navy-900 dark:text-white">{t('checkout.promptpayTitle')}</p>
      <img src={qrDataUrl} alt="PromptPay QR" className="w-48 h-48" />
      <p className="text-lg font-bold text-navy-900 dark:text-white">฿{Number(amount).toLocaleString()}</p>
      <p className="text-xs text-gray-400 text-center">{t('checkout.promptpayHint')}</p>
    </div>
  );
}
