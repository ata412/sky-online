import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, AlertCircle, Eye, EyeOff, UserPlus, Copy, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { registerMember } from '../services/api';

const provinces = [
  'กรุงเทพมหานคร','กระบี่','กาญจนบุรี','กาฬสินธุ์','กำแพงเพชร','ขอนแก่น','จันทบุรี','ฉะเชิงเทรา',
  'ชลบุรี','ชัยนาท','ชัยภูมิ','ชุมพร','เชียงราย','เชียงใหม่','ตรัง','ตราด','ตาก','นครนายก',
  'นครปฐม','นครพนม','นครราชสีมา','นครศรีธรรมราช','นครสวรรค์','นนทบุรี','นราธิวาส','น่าน',
  'บึงกาฬ','บุรีรัมย์','ปทุมธานี','ประจวบคีรีขันธ์','ปราจีนบุรี','ปัตตานี','พระนครศรีอยุธยา',
  'พะเยา','พังงา','พัทลุง','พิจิตร','พิษณุโลก','เพชรบุรี','เพชรบูรณ์','แพร่','ภูเก็ต',
  'มหาสารคาม','มุกดาหาร','แม่ฮ่องสอน','ยโสธร','ยะลา','ร้อยเอ็ด','ระนอง','ระยอง','ราชบุรี',
  'ลพบุรี','ลำปาง','ลำพูน','เลย','ศรีสะเกษ','สกลนคร','สงขลา','สตูล','สมุทรปราการ',
  'สมุทรสงคราม','สมุทรสาคร','สระแก้ว','สระบุรี','สิงห์บุรี','สุโขทัย','สุพรรณบุรี',
  'สุราษฎร์ธานี','สุรินทร์','หนองคาย','หนองบัวลำภู','อ่างทอง','อำนาจเจริญ','อุดรธานี',
  'อุตรดิตถ์','อุทัยธานี','อุบลราชธานี',
];

export default function Register() {
  const { t } = useTranslation();

  const benefits = [
    t('register.benefit1'),
    t('register.benefit2'),
    t('register.benefit3'),
    t('register.benefit4'),
    t('register.benefit5'),
  ];

  const [form, setForm] = useState({
    first_name: '', last_name: '', email: '', phone: '',
    password: '', confirm_password: '', birth_date: '',
    province: '', address: '', referrer_code: '',
  });
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const validate = () => {
    if (!form.first_name.trim() || !form.last_name.trim()) return t('register.validationName');
    if (!form.email.trim()) return t('register.validationEmail');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return t('register.validationEmailFormat');
    if (!form.phone.trim()) return t('register.validationPhone');
    if (!/^0[0-9]{8,9}$/.test(form.phone.replace(/-/g, ''))) return t('register.validationPhoneFormat');
    if (form.password.length < 6) return t('register.validationPassword');
    if (form.password !== form.confirm_password) return t('register.validationPasswordMatch');
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) { setStatus({ type: 'error', msg: err }); return; }
    setLoading(true);
    setStatus(null);
    try {
      const { confirm_password, ...payload } = form;
      const res = await registerMember(payload);
      setStatus({ type: 'success', member: res.data.member, msg: res.data.message });
      setForm({ first_name: '', last_name: '', email: '', phone: '', password: '', confirm_password: '', birth_date: '', province: '', address: '', referrer_code: '' });
    } catch (err) {
      setStatus({ type: 'error', msg: err.response?.data?.error || t('register.errorDefault') });
    } finally {
      setLoading(false);
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(status.member.member_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div>
      <div className="bg-hero-gradient py-16 text-center px-4">
        <h1 className="text-4xl sm:text-5xl font-bold text-white mb-3">{t('register.title')}</h1>
        <p className="text-gray-300 text-lg max-w-xl mx-auto">
          {t('register.subtitle')}
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">

          {/* Benefits Sidebar */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-navy-900 rounded-2xl p-7 text-white">
              <h2 className="text-xl font-bold text-gold-400 mb-5">{t('register.memberBenefits')}</h2>
              <ul className="space-y-3">
                {benefits.map((b) => (
                  <li key={b} className="flex items-start gap-3">
                    <CheckCircle size={18} className="text-gold-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300 text-sm">{b}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-gold-50 border border-gold-200 rounded-2xl p-6">
              <h3 className="font-bold text-navy-900 mb-2">{t('register.hasReferrer')}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                {t('register.referrerHint')}
              </p>
            </div>

            <div className="text-center text-sm text-gray-500">
              {t('register.alreadyHaveAccount')}{' '}
              <Link to="/contact" className="text-gold-600 hover:text-gold-700 font-medium">
                {t('register.contactUs')}
              </Link>
            </div>
          </div>

          {/* Registration Form */}
          <div className="lg:col-span-3">
            {status?.type === 'success' ? (
              <div className="bg-white rounded-2xl shadow-md p-8 text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
                  <CheckCircle size={40} className="text-green-500" />
                </div>
                <h2 className="text-2xl font-bold text-navy-900 mb-2">{t('register.successTitle')}</h2>
                <p className="text-gray-500 mb-6">
                  {t('register.successWelcome', { firstName: status.member.first_name, lastName: status.member.last_name })}
                </p>

                <div className="bg-gray-50 rounded-xl p-5 mb-6">
                  <p className="text-xs text-gray-400 mb-1">{t('register.memberCode')}</p>
                  <div className="flex items-center justify-center gap-3">
                    <span className="text-3xl font-bold text-navy-900 tracking-widest">
                      {status.member.member_code}
                    </span>
                    <button
                      onClick={copyCode}
                      className="p-2 text-gray-400 hover:text-gold-600 transition-colors"
                      title="คัดลอกรหัส"
                    >
                      {copied ? <Check size={20} className="text-green-500" /> : <Copy size={20} />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">{t('register.memberCodeNote')}</p>
                </div>

                <div className="flex gap-3 justify-center">
                  <Link to="/" className="btn-gold">{t('register.backHome')}</Link>
                  <button
                    onClick={() => setStatus(null)}
                    className="btn-outline-gold"
                  >
                    {t('register.registerAnother')}
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-md p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gold-100 rounded-xl flex items-center justify-center">
                    <UserPlus size={20} className="text-gold-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-navy-900">{t('register.fillInfo')}</h2>
                </div>

                {status?.type === 'error' && (
                  <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mb-6">
                    <AlertCircle size={18} className="flex-shrink-0" />
                    <p className="text-sm">{status.msg}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Name */}
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">{t('register.personalInfo')}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          {t('register.firstName')} <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text" name="first_name" value={form.first_name} onChange={handleChange}
                          placeholder={t('register.firstNamePlaceholder')} required
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          {t('register.lastName')} <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text" name="last_name" value={form.last_name} onChange={handleChange}
                          placeholder={t('register.lastNamePlaceholder')} required
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500 text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Contact */}
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">{t('register.contactInfo')}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          {t('register.email')} <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="email" name="email" value={form.email} onChange={handleChange}
                          placeholder="example@email.com" required
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          {t('register.phone')} <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="tel" name="phone" value={form.phone} onChange={handleChange}
                          placeholder="0812345678" required
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500 text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">{t('register.passwordSection')}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          {t('register.password')} <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type={showPass ? 'text' : 'password'} name="password"
                            value={form.password} onChange={handleChange}
                            placeholder={t('register.passwordPlaceholder')} required minLength={6}
                            className="w-full px-4 py-3 pr-10 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500 text-sm"
                          />
                          <button type="button" onClick={() => setShowPass(!showPass)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                            {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          {t('register.confirmPassword')} <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type={showConfirm ? 'text' : 'password'} name="confirm_password"
                            value={form.confirm_password} onChange={handleChange}
                            placeholder={t('register.confirmPasswordPlaceholder')} required
                            className={`w-full px-4 py-3 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500 text-sm ${
                              form.confirm_password && form.confirm_password !== form.password
                                ? 'border-red-300 bg-red-50' : 'border-gray-200'
                            }`}
                          />
                          <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                            {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                        {form.confirm_password && form.confirm_password !== form.password && (
                          <p className="text-xs text-red-500 mt-1">{t('register.passwordMismatch')}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Optional Info */}
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">{t('register.optionalInfo')}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('register.birthDate')}</label>
                        <input
                          type="date" name="birth_date" value={form.birth_date} onChange={handleChange}
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('register.province')}</label>
                        <select
                          name="province" value={form.province} onChange={handleChange}
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500 text-sm bg-white"
                        >
                          <option value="">{t('register.selectProvince')}</option>
                          {provinces.map((p) => <option key={p} value={p}>{p}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('register.address')}</label>
                      <textarea
                        name="address" value={form.address} onChange={handleChange}
                        placeholder={t('register.addressPlaceholder')}
                        rows={2}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500 text-sm resize-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('register.referrerCode')}</label>
                      <input
                        type="text" name="referrer_code" value={form.referrer_code} onChange={handleChange}
                        placeholder={t('register.referrerCodePlaceholder')}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500 text-sm uppercase"
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit" disabled={loading}
                      className="w-full btn-gold flex items-center justify-center gap-2 py-4 text-base disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <UserPlus size={20} />
                      )}
                      {loading ? t('register.registering') : t('register.submit')}
                    </button>
                    <p className="text-center text-xs text-gray-400 mt-3">
                      {t('register.termsNote')}{' '}
                      <span className="text-gold-600 cursor-pointer hover:underline">{t('register.termsLink')}</span>{' '}
                      {t('register.termsOf')}
                    </p>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
