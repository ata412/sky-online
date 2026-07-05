import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, ShoppingBag, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { createOrder } from '../services/api';

const categoryEmojis = {
  'วิตามิน': '💊', 'โปรตีน': '💪', 'ความงาม': '✨',
  'ย่อยอาหาร': '🌱', 'กระดูก': '🦴', 'ไฟเบอร์': '🍍',
};

export default function Checkout() {
  const { t } = useTranslation();
  const { items, total, count, clearCart, removeFromCart, updateQuantity } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState('');

  if (items.length === 0 && !success) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-gray-400 px-4">
        <ShoppingBag size={64} strokeWidth={1} />
        <p className="mt-4 text-lg font-semibold">{t('checkout.emptyCart')}</p>
        <button onClick={() => navigate('/products')} className="mt-6 btn-gold px-8 py-2">
          {t('checkout.browseShopping')}
        </button>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
        <div className="bg-white rounded-2xl shadow-lg p-10 max-w-md w-full">
          <CheckCircle size={64} className="text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-navy-900 mb-2">{t('checkout.orderSuccess')}</h2>
          <p className="text-gray-500 mb-4">{t('checkout.orderNumber')}</p>
          <div className="bg-gold-50 border border-gold-200 rounded-xl py-4 px-6 mb-6">
            <p className="text-3xl font-bold text-gold-600 tracking-widest">{success.order_code}</p>
          </div>
          <p className="text-sm text-gray-500 mb-2">
            {t('checkout.totalAmount')} <span className="font-bold text-navy-900">฿{Number(success.total_amount).toLocaleString()}</span>
          </p>
          <p className="text-sm text-gray-400 mb-8">{t('checkout.teamWillContact')}</p>
          <button
            onClick={() => navigate('/products')}
            className="btn-gold w-full py-3"
          >
            {t('checkout.continueShopping')}
          </button>
        </div>
      </div>
    );
  }

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await createOrder({
        member_id: user?.id,
        member_code: user?.member_code,
        items,
        note,
      });
      clearCart();
      setSuccess(res.data.order);
    } catch (err) {
      setError(err.response?.data?.error || t('checkout.errorDefault'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-2xl font-bold text-navy-900 mb-8">{t('checkout.title')}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Item list */}
        <div className="lg:col-span-2 space-y-3">
          {items.map((item) => (
            <div key={item.id} className="bg-white rounded-xl shadow-sm p-4 flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl flex-shrink-0 overflow-hidden bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center">
                {item.image_url ? (
                  <img src={item.image_url} alt={item.name} className="w-full h-full object-contain p-1" />
                ) : (
                  <span className="text-2xl">{categoryEmojis[item.category] || '🌿'}</span>
                )}
              </div>

              <div className="flex-grow min-w-0">
                <p className="font-semibold text-navy-900 text-sm leading-snug">{item.name}</p>
                <p className="text-gold-600 font-bold text-sm">฿{Number(item.price).toLocaleString()}</p>
              </div>

              {/* quantity */}
              <div className="flex items-center gap-2 border border-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                <button
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  className="px-2 py-1 hover:bg-gray-100 text-gray-600 text-sm"
                >−</button>
                <span className="px-2 text-sm font-semibold min-w-[24px] text-center">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  className="px-2 py-1 hover:bg-gray-100 text-gray-600 text-sm"
                >+</button>
              </div>

              <p className="text-sm font-bold text-navy-900 w-20 text-right flex-shrink-0">
                ฿{(Number(item.price) * item.quantity).toLocaleString()}
              </p>

              <button onClick={() => removeFromCart(item.id)} className="text-gray-300 hover:text-red-400 flex-shrink-0">
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>

        {/* Summary + Confirm */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24 space-y-5">
            {/* Member info */}
            <div className="pb-4 border-b border-gray-100">
              <p className="text-xs text-gray-400 mb-1">{t('checkout.orderedBy')}</p>
              <p className="font-semibold text-navy-900">{user?.first_name} {user?.last_name}</p>
              <p className="text-xs text-gold-600">{user?.member_code}</p>
            </div>

            {/* Note */}
            <div>
              <label className="text-sm font-semibold text-navy-900 block mb-1">{t('checkout.note')}</label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={2}
                placeholder={t('checkout.notePlaceholder')}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gold-500 resize-none"
              />
            </div>

            {/* Total */}
            <div className="bg-gray-50 rounded-xl p-4 space-y-2">
              <div className="flex justify-between text-sm text-gray-500">
                <span>{t('checkout.items', { count })}</span>
              </div>
              <div className="flex justify-between font-bold text-navy-900 text-lg pt-2 border-t border-gray-200">
                <span>{t('checkout.grandTotal')}</span>
                <span className="text-gold-600">฿{total.toLocaleString()}</span>
              </div>
            </div>

            {error && (
              <p className="text-red-500 text-sm text-center">{error}</p>
            )}

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full btn-gold py-3 text-base disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? t('checkout.processing') : t('checkout.confirm')}
            </button>

            <button
              onClick={() => navigate(-1)}
              className="w-full text-sm text-gray-400 hover:text-gray-600 text-center"
            >
              {t('checkout.backToShopping')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
