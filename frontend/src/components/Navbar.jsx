import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, UserPlus, LogIn, LogOut, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import i18n from '../i18n';

function CartIcon() {
  const { count, setIsOpen } = useCart();
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleClick = () => {
    if (!isLoggedIn) {
      navigate('/login', { state: { redirect: location.pathname } });
      return;
    }
    setIsOpen(true);
  };

  return (
    <button
      onClick={handleClick}
      className="relative flex items-center justify-center w-10 h-10 rounded-lg text-gray-300 hover:text-gold-400 hover:bg-navy-800 transition-colors"
      aria-label="ตะกร้าสินค้า"
    >
      <svg viewBox="0 0 20 20" fill="none" className="w-6 h-6" xmlns="http://www.w3.org/2000/svg">
        <path d="M16.3804 16.25H3.61947C3.46585 16.25 3.31752 16.1939 3.20241 16.0922C3.0873 15.9904 3.01334 15.8501 2.99447 15.6977L1.88119 6.32267C1.87089 6.2347 1.87941 6.14556 1.90617 6.06113C1.93294 5.9767 1.97734 5.89893 2.03644 5.83296C2.09553 5.767 2.16797 5.71434 2.24896 5.67849C2.32995 5.64264 2.41763 5.62441 2.50619 5.62501H17.4937C17.5823 5.62441 17.6699 5.64264 17.7509 5.67849C17.8319 5.71434 17.9044 5.767 17.9634 5.83296C18.0225 5.89893 18.0669 5.9767 18.0937 6.06113C18.1205 6.14556 18.129 6.2347 18.1187 6.32267L17.0054 15.6977C16.9865 15.8501 16.9126 15.9904 16.7975 16.0922C16.6824 16.1939 16.534 16.25 16.3804 16.25Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M6.875 5.625V5C6.875 4.1712 7.20424 3.37634 7.79029 2.79029C8.37634 2.20424 9.1712 1.875 10 1.875C10.8288 1.875 11.6237 2.20424 12.2097 2.79029C12.7958 3.37634 13.125 4.1712 13.125 5V5.625" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      {isLoggedIn && count > 0 && (
        <span className="absolute -top-1 -right-1 bg-gold-500 text-navy-900 text-[10px] font-bold min-w-[18px] h-[18px] rounded-full flex items-center justify-center px-1 leading-none">
          {count > 99 ? '99+' : count}
        </span>
      )}
    </button>
  );
}

function LangToggle() {
  const { i18n: i18nInstance } = useTranslation();
  const handleToggle = () => {
    const next = i18nInstance.language === 'th' ? 'en' : 'th';
    i18nInstance.changeLanguage(next);
    localStorage.setItem('lang', next);
  };
  return (
    <button
      onClick={handleToggle}
      className="px-2.5 py-1 rounded-md text-xs font-bold border border-gray-600 text-gray-300 hover:border-gold-400 hover:text-gold-400 transition-colors"
    >
      {i18nInstance.language === 'th' ? 'EN' : 'TH'}
    </button>
  );
}

export default function Navbar() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isLoggedIn, logout } = useAuth();
  const { clearCart } = useCart();

  const navLinks = [
    { to: '/', label: t('nav.home') },
    { to: '/products', label: t('nav.products') },
    { to: '/promotions', label: t('nav.promotions') },
    { to: '/vision', label: t('nav.vision') },
    { to: '/activities', label: t('nav.activities') },
    { to: '/hall-of-fame', label: t('nav.hallOfFame') },
    { to: '/contact', label: t('nav.contact') },
  ];

  const handleLogout = () => {
    logout();
    clearCart();
    navigate('/');
    setOpen(false);
  };

  useEffect(() => {
    let lastY = window.scrollY;
    const handleScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 10);
      setHidden(y > lastY && y > 180);
      lastY = y;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => setOpen(false), [location]);

  return (
    <nav
      className={`sticky top-0 z-50 bg-navy-900 transition-all duration-300 ${
        scrolled ? 'shadow-xl' : 'shadow-md'
      } ${hidden ? '-translate-y-full' : 'translate-y-0'}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center flex-shrink-0 ml-20">
            <img src="/sky_online.png" alt="Sky Online" className="h-10 w-auto object-contain" />
          </Link>

          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 ${
                  location.pathname === link.to
                    ? 'text-gold-400 bg-navy-800'
                    : 'text-gray-300 hover:text-gold-400 hover:bg-navy-800'
                }`}
              >
                {link.label}
              </Link>
            ))}
            {isLoggedIn ? (
              <div className="ml-2 flex items-center gap-2">
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-navy-800 text-gray-300 text-sm">
                  <User size={15} className="text-gold-400" />
                  <span className="text-gold-400 font-semibold">{user.first_name}</span>
                  <span className="text-gray-500 text-xs">{user.member_code}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 text-gray-300 hover:text-red-400 text-sm font-medium px-3 py-2 rounded-lg hover:bg-navy-800 transition-colors"
                >
                  <LogOut size={15} />
                  {t('nav.logout')}
                </button>
              </div>
            ) : (
              <div className="ml-2 flex items-center gap-2">
                <Link
                  to="/login"
                  className="flex items-center gap-1.5 text-gray-300 hover:text-gold-400 text-sm font-medium px-3 py-2 rounded-lg hover:bg-navy-800 transition-colors"
                >
                  <LogIn size={15} />
                  {t('nav.login')}
                </Link>
                <Link
                  to="/register"
                  className="flex items-center gap-1.5 bg-gold-600 hover:bg-gold-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
                >
                  <UserPlus size={15} />
                  {t('nav.register')}
                </Link>
              </div>
            )}
            <CartIcon />
            <LangToggle />
          </div>

          <div className="flex items-center gap-2 lg:hidden">
            <LangToggle />
            <CartIcon />
            <button
              className="text-gray-300 hover:text-gold-400 p-2 rounded-md"
              onClick={() => setOpen(!open)}
              aria-label="Toggle menu"
            >
              {open ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {open && (
        <div className="lg:hidden bg-navy-800 border-t border-navy-700">
          <div className="px-4 py-2 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`block px-4 py-3 rounded-md text-sm font-medium transition-colors ${
                  location.pathname === link.to
                    ? 'text-gold-400 bg-navy-900'
                    : 'text-gray-300 hover:text-gold-400 hover:bg-navy-900'
                }`}
              >
                {link.label}
              </Link>
            ))}
            {isLoggedIn ? (
              <div className="mt-2 space-y-1">
                <div className="flex items-center gap-2 px-4 py-3 bg-navy-900 rounded-lg">
                  <User size={16} className="text-gold-400" />
                  <div>
                    <p className="text-gold-400 font-semibold text-sm">{user.first_name} {user.last_name}</p>
                    <p className="text-gray-500 text-xs">{user.member_code}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 w-full px-4 py-3 text-red-400 hover:text-red-300 text-sm font-medium rounded-lg hover:bg-navy-900 transition-colors"
                >
                  <LogOut size={16} />
                  {t('nav.logout')}
                </button>
              </div>
            ) : (
              <div className="mt-2 space-y-1">
                <Link
                  to="/login"
                  className="flex items-center gap-2 px-4 py-3 text-gray-300 hover:text-gold-400 text-sm font-medium rounded-lg hover:bg-navy-900 transition-colors"
                >
                  <LogIn size={16} />
                  {t('nav.login')}
                </Link>
                <Link
                  to="/register"
                  className="flex items-center gap-2 px-4 py-3 bg-gold-600 hover:bg-gold-700 text-white text-sm font-semibold rounded-lg transition-colors"
                >
                  <UserPlus size={16} />
                  {t('nav.register')}
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
