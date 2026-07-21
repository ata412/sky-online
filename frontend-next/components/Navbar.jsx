'use client';

import { useState, useEffect, useRef } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Link, usePathname, useRouter } from '@/i18n/routing';
import { Menu, X, UserPlus, LogIn, LogOut, User, Sun, Moon, ChevronDown } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';

function CartIcon({ light }) {
  const { count, setIsOpen } = useCart();

  const handleClick = () => {
    setIsOpen(true);
  };

  return (
    <button
      onClick={handleClick}
      className={`relative flex items-center justify-center w-10 h-10 rounded-lg transition-colors ${
        light ? 'text-gray-700 hover:text-gold-600 hover:bg-gray-100' : 'text-gray-300 hover:text-gold-400 hover:bg-navy-800'
      }`}
      aria-label="ตะกร้าสินค้า"
    >
      <svg viewBox="0 0 20 20" fill="none" className="w-6 h-6" xmlns="http://www.w3.org/2000/svg">
        <path d="M16.3804 16.25H3.61947C3.46585 16.25 3.31752 16.1939 3.20241 16.0922C3.0873 15.9904 3.01334 15.8501 2.99447 15.6977L1.88119 6.32267C1.87089 6.2347 1.87941 6.14556 1.90617 6.06113C1.93294 5.9767 1.97734 5.89893 2.03644 5.83296C2.09553 5.767 2.16797 5.71434 2.24896 5.67849C2.32995 5.64264 2.41763 5.62441 2.50619 5.62501H17.4937C17.5823 5.62441 17.6699 5.64264 17.7509 5.67849C17.8319 5.71434 17.9044 5.767 17.9634 5.83296C18.0225 5.89893 18.0669 5.9767 18.0937 6.06113C18.1205 6.14556 18.129 6.2347 18.1187 6.32267L17.0054 15.6977C16.9865 15.8501 16.9126 15.9904 16.7975 16.0922C16.6824 16.1939 16.534 16.25 16.3804 16.25Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M6.875 5.625V5C6.875 4.1712 7.20424 3.37634 7.79029 2.79029C8.37634 2.20424 9.1712 1.875 10 1.875C10.8288 1.875 11.6237 2.20424 12.2097 2.79029C12.7958 3.37634 13.125 4.1712 13.125 5V5.625" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      {count > 0 && (
        <span className="absolute -top-1 -right-1 bg-gold-500 text-navy-900 text-[10px] font-bold min-w-[18px] h-[18px] rounded-full flex items-center justify-center px-1 leading-none">
          {count > 99 ? '99+' : count}
        </span>
      )}
    </button>
  );
}

function ThemeToggle({ light }) {
  const { theme, toggleTheme, hydrated } = useTheme();
  if (!hydrated) return <div className="w-9 h-9" />;

  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className={`flex items-center justify-center w-9 h-9 rounded-lg transition-colors ${
        light ? 'text-gray-700 hover:text-gold-600 hover:bg-gray-100' : 'text-gray-300 hover:text-gold-400 hover:bg-navy-800'
      }`}
    >
      {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}

const LANGUAGES = [
  { code: 'th', short: 'TH', label: 'ไทย' },
  { code: 'en', short: 'EN', label: 'English' },
  { code: 'zh', short: '中文', label: '中文' },
  { code: 'lo', short: 'ລາວ', label: 'ລາວ' },
  { code: 'my', short: 'MM', label: 'မြန်မာ' },
];

const MEMBER_LOGIN_URL = 'https://member.skyonline99.com/login.asp';
const MEMBER_REGISTER_URL = 'https://member.skyonline99.com/RegisMemQR/RegMemQR.asp?id=0000001';

function LangToggle({ light }) {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const current = LANGUAGES.find((l) => l.code === locale) ?? LANGUAGES[0];

  const handleSelect = (code) => {
    setOpen(false);
    if (code !== locale) router.replace(pathname, { locale: code });
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold border transition-colors whitespace-nowrap ${
          light
            ? 'border-gray-300 text-gray-700 hover:border-gold-500 hover:text-gold-600'
            : 'border-gray-600 text-gray-300 hover:border-gold-400 hover:text-gold-400'
        }`}
      >
        {current.short}
        <ChevronDown size={12} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div
          className={`absolute right-0 mt-2 w-32 rounded-lg shadow-lg border overflow-hidden z-50 ${
            light ? 'bg-white border-gray-200' : 'bg-navy-900 border-navy-700'
          }`}
        >
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleSelect(lang.code)}
              className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                lang.code === locale
                  ? 'text-gold-500 font-semibold'
                  : light
                    ? 'text-gray-700 hover:bg-gray-100'
                    : 'text-gray-300 hover:bg-navy-800'
              }`}
            >
              {lang.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Navbar() {
  const t = useTranslations();
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [pastHero, setPastHero] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef(null);
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoggedIn, logout } = useAuth();
  const { clearCart } = useCart();

  const navLinks = [
    { to: '/', label: t('nav.home') },
    { to: '/products', label: t('nav.products') },
    { to: '/promotions', label: t('nav.promotions') },
    { to: '/vision', label: t('nav.vision') },
    { to: '/activities', label: t('nav.activities') },
    { to: '/hall-of-fame', label: t('nav.hallOfFame') },
    { to: '/chatbot', label: t('nav.chatbot') },
    { to: '/video-studio', label: t('nav.videoStudio') },
    { to: '/contact', label: t('nav.contact') },
  ];
  const primaryLinks = navLinks.filter((link) =>
    ['/', '/products', '/promotions', '/chatbot', '/video-studio'].includes(link.to)
  );
  const moreLinks = navLinks.filter((link) =>
    ['/vision', '/activities', '/hall-of-fame', '/contact'].includes(link.to)
  );

  const handleLogout = () => {
    logout();
    clearCart();
    router.push('/');
    setOpen(false);
  };

  useEffect(() => {
    let lastY = window.scrollY;
    const handleScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 10);
      setHidden(y > lastY && y > 180);
      // Hero is min-h-[88vh]; treat "past the hero" once scrolled most of the way through it.
      setPastHero(y > window.innerHeight * 0.75);
      lastY = y;
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
    setMoreOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (moreRef.current && !moreRef.current.contains(event.target)) {
        setMoreOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // White navbar only while parked over the home page's hero section.
  const isOverHero = pathname === '/' && !pastHero;

  return (
    <nav
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isOverHero ? 'bg-white' : 'bg-navy-900'
      } ${scrolled ? 'shadow-xl' : 'shadow-md'} ${hidden ? '-translate-y-full' : 'translate-y-0'}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative flex items-center justify-between h-16">
          <Link href="/" className="flex items-center flex-shrink-0">
            <img
              src={isOverHero ? '/sky_online_logo.png' : '/sky_online.png'}
              alt="Sky Online"
              className={`w-auto object-contain ${isOverHero ? 'h-7' : 'h-10'}`}
            />
          </Link>

          <div className="absolute left-1/2 -ml-10 hidden -translate-x-1/2 items-center gap-0.5 xl:flex">
            {primaryLinks.map((link) => (
              <Link
                key={link.to}
                href={link.to}
                className={`px-3 py-2 text-sm rounded-md font-medium whitespace-nowrap transition-colors duration-150 ${
                  pathname === link.to
                    ? isOverHero ? 'text-gold-600 bg-gray-100' : 'text-gold-400 bg-navy-800'
                    : isOverHero ? 'text-gray-700 hover:text-gold-600 hover:bg-gray-100' : 'text-gray-300 hover:text-gold-400 hover:bg-navy-800'
                }`}
              >
                {link.label}
              </Link>
            ))}

            <div className="relative" ref={moreRef}>
              <button
                type="button"
                onClick={() => setMoreOpen((value) => !value)}
                className={`flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors duration-150 ${
                  moreLinks.some((link) => pathname === link.to)
                    ? isOverHero ? 'text-gold-600 bg-gray-100' : 'text-gold-400 bg-navy-800'
                    : isOverHero ? 'text-gray-700 hover:text-gold-600 hover:bg-gray-100' : 'text-gray-300 hover:text-gold-400 hover:bg-navy-800'
                }`}
                aria-expanded={moreOpen}
              >
                {t('nav.more')}
                <ChevronDown size={13} className={`transition-transform ${moreOpen ? 'rotate-180' : ''}`} />
              </button>

              {moreOpen && (
                <div className={`absolute right-0 top-full z-50 mt-2 w-52 overflow-hidden rounded-xl border py-1 shadow-xl ${
                  isOverHero ? 'border-gray-200 bg-white' : 'border-navy-700 bg-navy-900'
                }`}>
                  {moreLinks.map((link) => (
                    <Link
                      key={link.to}
                      href={link.to}
                      className={`block px-4 py-2.5 text-sm font-medium transition-colors ${
                        pathname === link.to
                          ? isOverHero ? 'bg-gold-50 text-gold-700' : 'bg-navy-800 text-gold-400'
                          : isOverHero ? 'text-gray-700 hover:bg-gray-100 hover:text-gold-600' : 'text-gray-300 hover:bg-navy-800 hover:text-gold-400'
                      }`}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="hidden items-center gap-0.5 xl:flex">
            {isLoggedIn ? (
              <div className="ml-2 flex items-center gap-2 whitespace-nowrap">
                <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm whitespace-nowrap ${isOverHero ? 'bg-gray-100 text-gray-700' : 'bg-navy-800 text-gray-300'}`}>
                  <User size={15} className="text-gold-500 flex-shrink-0" />
                  <span className={`font-semibold ${isOverHero ? 'text-gold-600' : 'text-gold-400'}`}>{user.first_name}</span>
                  <span className="text-gray-500 text-xs">{user.member_code}</span>
                  <span className="text-gray-500 text-xs">·</span>
                  <span className={`text-xs font-semibold ${isOverHero ? 'text-gold-600' : 'text-gold-400'}`}>{user.total_pv ?? 0} PV</span>
                </div>
                <button
                  onClick={handleLogout}
                  className={`flex items-center gap-1.5 text-sm font-medium px-3 py-2 rounded-lg transition-colors whitespace-nowrap ${
                    isOverHero ? 'text-gray-700 hover:text-red-500 hover:bg-gray-100' : 'text-gray-300 hover:text-red-400 hover:bg-navy-800'
                  }`}
                >
                  <LogOut size={15} />
                  {t('nav.logout')}
                </button>
              </div>
            ) : (
              <div className="ml-2 flex items-center gap-2 whitespace-nowrap">
                <a
                  href={MEMBER_LOGIN_URL}
                  className={`flex items-center gap-1.5 text-sm font-medium px-3 py-2 rounded-lg transition-colors whitespace-nowrap ${
                    isOverHero ? 'text-gray-700 hover:text-gold-600 hover:bg-gray-100' : 'text-gray-300 hover:text-gold-400 hover:bg-navy-800'
                  }`}
                >
                  <LogIn size={15} />
                  {t('nav.login')}
                </a>
                <a
                  href={MEMBER_REGISTER_URL}
                  className={`flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${
                    isOverHero ? 'bg-navy-900 hover:bg-navy-800 text-white' : 'bg-white hover:bg-gray-100 text-navy-900'
                  }`}
                >
                  <UserPlus size={15} />
                  {t('nav.register')}
                </a>
              </div>
            )}
            <CartIcon light={isOverHero} />
            <ThemeToggle light={isOverHero} />
            <LangToggle light={isOverHero} />
          </div>

          <div className="flex items-center gap-2 xl:hidden">
            <ThemeToggle light={isOverHero} />
            <LangToggle light={isOverHero} />
            <CartIcon light={isOverHero} />
            <button
              className={`p-2 rounded-md transition-colors ${isOverHero ? 'text-gray-700 hover:text-gold-600' : 'text-gray-300 hover:text-gold-400'}`}
              onClick={() => setOpen(!open)}
              aria-label="Toggle menu"
            >
              {open ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {open && (
        <div className={`xl:hidden border-t ${isOverHero ? 'bg-white border-gray-200' : 'bg-navy-800 border-navy-700'}`}>
          <div className="px-4 py-2 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                href={link.to}
                className={`block px-4 py-3 rounded-md text-sm font-medium transition-colors ${
                  pathname === link.to
                    ? isOverHero ? 'text-gold-600 bg-gray-100' : 'text-gold-400 bg-navy-900'
                    : isOverHero ? 'text-gray-700 hover:text-gold-600 hover:bg-gray-100' : 'text-gray-300 hover:text-gold-400 hover:bg-navy-900'
                }`}
              >
                {link.label}
              </Link>
            ))}
            {isLoggedIn ? (
              <div className="mt-2 space-y-1">
                <div className={`flex items-center gap-2 px-4 py-3 rounded-lg ${isOverHero ? 'bg-gray-100' : 'bg-navy-900'}`}>
                  <User size={16} className="text-gold-500" />
                  <div>
                    <p className={`font-semibold text-sm ${isOverHero ? 'text-gold-600' : 'text-gold-400'}`}>{user.first_name} {user.last_name}</p>
                    <p className="text-gray-500 text-xs">{user.member_code} · {user.total_pv ?? 0} PV</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className={`flex items-center gap-2 w-full px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                    isOverHero ? 'text-red-500 hover:text-red-600 hover:bg-gray-100' : 'text-red-400 hover:text-red-300 hover:bg-navy-900'
                  }`}
                >
                  <LogOut size={16} />
                  {t('nav.logout')}
                </button>
              </div>
            ) : (
              <div className="mt-2 space-y-1">
                <a
                  href={MEMBER_LOGIN_URL}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                    isOverHero ? 'text-gray-700 hover:text-gold-600 hover:bg-gray-100' : 'text-gray-300 hover:text-gold-400 hover:bg-navy-900'
                  }`}
                >
                  <LogIn size={16} />
                  {t('nav.login')}
                </a>
                <a
                  href={MEMBER_REGISTER_URL}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold rounded-lg transition-colors ${
                    isOverHero ? 'bg-navy-900 hover:bg-navy-800 text-white' : 'bg-white hover:bg-gray-100 text-navy-900'
                  }`}
                >
                  <UserPlus size={16} />
                  {t('nav.register')}
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
