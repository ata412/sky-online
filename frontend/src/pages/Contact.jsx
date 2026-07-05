import { useState } from 'react';
import { Phone, Mail, MapPin, CheckCircle, AlertCircle, Send } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { submitContact } from '../services/api';

export default function Contact() {
  const { t } = useTranslation();
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setStatus({ type: 'error', msg: t('contact.errorName') });
      return;
    }
    setLoading(true);
    setStatus(null);
    try {
      const res = await submitContact(form);
      setStatus({ type: 'success', msg: res.data.message });
      setForm({ name: '', email: '', phone: '', message: '' });
    } catch (err) {
      setStatus({ type: 'error', msg: err.response?.data?.error || t('contact.errorDefault') });
    } finally {
      setLoading(false);
    }
  };

  const contactItems = [
    { icon: Phone, label: t('contact.labelPhone'), value: '02-690-1234', sub: t('contact.phoneHours') },
    { icon: Mail, label: t('contact.labelEmail'), value: 'info@skyonline.co.th', sub: t('contact.emailHours') },
    { icon: MapPin, label: t('contact.labelAddress'), value: '123 ถนนสุขุมวิท เขตคลองเตย กรุงเทพฯ 10110', sub: '' },
  ];

  const dealerPerks = [
    t('contact.dealer1'),
    t('contact.dealer2'),
    t('contact.dealer3'),
    t('contact.dealer4'),
  ];

  return (
    <div>
      <div className="bg-hero-gradient py-20 text-center px-4">
        <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">{t('contact.title')}</h1>
        <p className="text-gray-300 text-lg max-w-xl mx-auto">
          {t('contact.subtitle')}
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
          {/* Contact Info */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-navy-900 mb-6">{t('contact.channels')}</h2>
              {contactItems.map(({ icon: Icon, label, value, sub }) => (
                <div key={label} className="flex gap-4 p-4 bg-gray-50 rounded-xl mb-3">
                  <div className="w-12 h-12 bg-gold-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Icon size={20} className="text-gold-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">{label}</p>
                    <p className="font-semibold text-navy-900">{value}</p>
                    {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-navy-900 rounded-2xl p-6 text-white">
              <h3 className="font-bold text-gold-400 mb-3 text-lg">{t('contact.dealerTitle')}</h3>
              <p className="text-gray-300 text-sm leading-relaxed mb-4">
                {t('contact.dealerDesc')}
              </p>
              <ul className="space-y-2 text-sm text-gray-400">
                {dealerPerks.map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <CheckCircle size={14} className="text-gold-500 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-md p-8">
              <h2 className="text-2xl font-bold text-navy-900 mb-6">{t('contact.sendMessage')}</h2>

              {status && (
                <div className={`flex items-start gap-3 p-4 rounded-xl mb-6 ${
                  status.type === 'success'
                    ? 'bg-green-50 text-green-800 border border-green-200'
                    : 'bg-red-50 text-red-800 border border-red-200'
                }`}>
                  {status.type === 'success'
                    ? <CheckCircle size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
                    : <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />}
                  <p className="text-sm">{status.msg}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      {t('contact.fullName')} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder={t('contact.fullNamePlaceholder')}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500 text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      {t('contact.phone')}
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="08x-xxx-xxxx"
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('contact.email')}</label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="example@email.com"
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('contact.message')}</label>
                  <textarea
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    placeholder={t('contact.messagePlaceholder')}
                    rows={5}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500 text-sm resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-gold flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Send size={18} />
                  )}
                  {loading ? t('contact.sending') : t('contact.send')}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
