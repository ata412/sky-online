import { Link } from 'react-router-dom';
import { X, Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useCart } from '../context/CartContext';

const categoryEmojis = {
  'วิตามิน': '💊', 'โปรตีน': '💪', 'ความงาม': '✨',
  'ย่อยอาหาร': '🌱', 'กระดูก': '🦴',
};

function CartItem({ item }) {
  const { removeFromCart, updateQuantity } = useCart();
  return (
    <div className="flex items-center gap-4 py-4 border-b border-gray-100">
      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center flex-shrink-0 text-2xl">
        {categoryEmojis[item.category] || '🌿'}
      </div>
      <div className="flex-grow min-w-0">
        <p className="font-semibold text-navy-900 text-sm leading-snug line-clamp-2">{item.name}</p>
        <p className="text-gold-600 font-bold text-sm mt-0.5">฿{Number(item.price).toLocaleString()}</p>
      </div>
      <div className="flex flex-col items-end gap-2 flex-shrink-0">
        <button
          onClick={() => removeFromCart(item.id)}
          className="text-gray-300 hover:text-red-400 transition-colors"
        >
          <Trash2 size={14} />
        </button>
        <div className="flex items-center gap-1 border border-gray-200 rounded-lg overflow-hidden">
          <button
            onClick={() => updateQuantity(item.id, item.quantity - 1)}
            className="px-2 py-1 hover:bg-gray-100 transition-colors text-gray-600"
          >
            <Minus size={12} />
          </button>
          <span className="px-2 py-1 text-sm font-semibold min-w-[28px] text-center">
            {item.quantity}
          </span>
          <button
            onClick={() => updateQuantity(item.id, item.quantity + 1)}
            className="px-2 py-1 hover:bg-gray-100 transition-colors text-gray-600"
          >
            <Plus size={12} />
          </button>
        </div>
        <p className="text-xs text-gray-400">
          ฿{(Number(item.price) * item.quantity).toLocaleString()}
        </p>
      </div>
    </div>
  );
}

export default function CartDrawer() {
  const { t } = useTranslation();
  const { items, isOpen, setIsOpen, total, count, clearCart } = useCart();

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsOpen(false)}
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-white z-50 shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
        aria-hidden={!isOpen}
      >
        {isOpen && (
          <>
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-navy-900">
              <div className="flex items-center gap-2">
                <ShoppingBag size={20} className="text-gold-400" />
                <h2 className="text-lg font-bold text-white">{t('cart.title')}</h2>
                {count > 0 && (
                  <span className="bg-gold-500 text-navy-900 text-xs font-bold px-2 py-0.5 rounded-full">
                    {count}
                  </span>
                )}
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
              >
                <X size={22} />
              </button>
            </div>

            {/* Items */}
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center flex-grow text-gray-300">
                <ShoppingBag size={64} strokeWidth={1} />
                <p className="mt-4 text-lg font-semibold text-gray-400">{t('cart.empty')}</p>
                <p className="text-sm text-gray-400 mt-1">{t('cart.emptyHint')}</p>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="mt-6 btn-gold text-sm py-2 px-6"
                >
                  {t('cart.browse')}
                </button>
              </div>
            ) : (
              <>
                <div className="flex-grow overflow-y-auto px-5">
                  {items.map((item) => (
                    <CartItem key={item.id} item={item} />
                  ))}
                </div>

                {/* Footer */}
                <div className="border-t border-gray-100 bg-gray-50 px-5 py-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 text-sm">{t('cart.items', { count })}</span>
                    <button
                      type="button"
                      onClick={clearCart}
                      className="text-xs text-red-400 hover:text-red-600 transition-colors"
                    >
                      {t('cart.clearCart')}
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-navy-900">{t('cart.total')}</span>
                    <span className="text-2xl font-bold text-navy-900">
                      ฿{total.toLocaleString()}
                    </span>
                  </div>
                  <Link
                    to="/checkout"
                    onClick={() => setIsOpen(false)}
                    className="btn-gold w-full text-center block py-3 text-base"
                  >
                    {t('cart.checkout')}
                  </Link>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </>
  );
}
