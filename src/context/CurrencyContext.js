import { createContext, useContext, useState, useEffect } from 'react';

const CURRENCIES = [
  // ── دول الشام والخليج العربي ──
  { code: 'JOD', symbol: 'د.أ', name: 'الأردن (دينار أردني)',   rate: 1,       iso: 'jo' },
  { code: 'ILS', symbol: 'شيكل', name: 'فلسطين (شيكل)',         rate: 5.25,    iso: 'ps' },
  { code: 'SAR', symbol: 'ر.س', name: 'السعودية (ريال سعودي)',   rate: 5.29,    iso: 'sa' },
  { code: 'AED', symbol: 'د.إ', name: 'الإمارات (درهم إماراتي)', rate: 5.18,    iso: 'ae' },
  { code: 'KWD', symbol: 'د.ك', name: 'الكويت (دينار كويتي)',   rate: 0.43,    iso: 'kw' },
  { code: 'QAR', symbol: 'ر.ق', name: 'قطر (ريال قطري)',        rate: 5.14,    iso: 'qa' },
  { code: 'BHD', symbol: 'د.ب', name: 'البحرين (دينار بحريني)', rate: 0.53,    iso: 'bh' },
  { code: 'OMR', symbol: 'ر.ع', name: 'سلطنة عُمان (ريال)',    rate: 0.54,    iso: 'om' },
  { code: 'SYP', symbol: 'ل.س', name: 'سوريا (ليرة سورية)',     rate: 18300,   iso: 'sy' },
  { code: 'LBP', symbol: 'ل.ل', name: 'لبنان (ليرة لبنانية)',   rate: 126000,  iso: 'lb' },
  
  // ── بقية الوطن العربي ──
  { code: 'IQD', symbol: 'ع.د', name: 'العراق (دينار عراقي)',   rate: 1846,    iso: 'iq' },
  { code: 'EGP', symbol: 'ج.م', name: 'مصر (جنيه مصري)',        rate: 68.5,    iso: 'eg' },
  { code: 'SDG', symbol: 'ج.س', name: 'السودان (جنيه سوداني)', rate: 845,     iso: 'sd' },
  { code: 'YER', symbol: 'ر.ي', name: 'اليمن (ريال يمني)',      rate: 352,     iso: 'ye' },
  { code: 'MAD', symbol: 'د.م', name: 'المغرب (درهم مغربي)',    rate: 14.1,    iso: 'ma' },
  { code: 'DZD', symbol: 'د.ج', name: 'الجزائر (دينار جزائري)', rate: 190,     iso: 'dz' },
  { code: 'TND', symbol: 'د.ت', name: 'تونس (دينار تونسي)',    rate: 4.3,     iso: 'tn' },
  { code: 'LYD', symbol: 'د.ل', name: 'ليبيا (دينار ليبي)',    rate: 6.85,    iso: 'ly' },
  { code: 'MRU', symbol: 'أ.م', name: 'موريتانيا (أوقية)',     rate: 56.2,    iso: 'mr' },
  { code: 'SOS', symbol: 'ش.س', name: 'الصومال (شلن صومالي)', rate: 805,     iso: 'so' },
  { code: 'DJF', symbol: 'ف.د', name: 'جيبوتي (فرنك جيبوتي)', rate: 251,     iso: 'dj' },
  { code: 'KMF', symbol: 'ف.ج', name: 'جزر القمر (فرنك قمري)',  rate: 645,     iso: 'km' },

  // ── دولية وعالمية ──
  { code: 'USD', symbol: '$',   name: 'أمريكا (دولار أمريكي)', rate: 1.41,    iso: 'us' },
  { code: 'EUR', symbol: '€',   name: 'الاتحاد الأوروبي (يورو)', rate: 1.31,  iso: 'eu' },
  { code: 'GBP', symbol: '£',   name: 'بريطانيا (جنيه إسترليني)', rate: 1.11, iso: 'gb' },
  { code: 'CAD', symbol: 'C$',  name: 'كندا (دولار كندي)',     rate: 1.94,    iso: 'ca' },
  { code: 'AUD', symbol: 'A$',  name: 'أستراليا (دولار)',     rate: 2.16,    iso: 'au' },
  { code: 'TRY', symbol: '₺',   name: 'تركيا (ليرة تركية)',   rate: 45.2,    iso: 'tr' },
  { code: 'RUB', symbol: 'روبل', name: 'روسيا (روبل روسي)',     rate: 128,     iso: 'ru' },
  { code: 'MYR', symbol: 'رينغيت', name: 'ماليزيا (رينغيت)',    rate: 6.25,    iso: 'my' },
  { code: 'INR', symbol: '₹',   name: 'الهند (روبية هندية)',   rate: 117.5,   iso: 'in' },
  { code: 'CNY', symbol: '¥',   name: 'الصين (يوان صيني)',    rate: 10.2,    iso: 'cn' },
  { code: 'JPY', symbol: '¥',   name: 'اليابان (ين ياباني)',   rate: 210,     iso: 'jp' },
  { code: 'KRW', symbol: '₩',   name: 'كوريا الجنوبية (وون)', rate: 1950,    iso: 'kr' },
  { code: 'CHF', symbol: 'Fr',  name: 'سويسرا (فرنك سويسري)',  rate: 1.27,    iso: 'ch' },
  { code: 'SEK', symbol: 'kr',  name: 'السويد (كرون سويدي)',   rate: 14.8,    iso: 'se' },
  { code: 'NOK', symbol: 'kr',  name: 'النرويج (كرون نرويجي)', rate: 15.1,    iso: 'no' },
  { code: 'BRL', symbol: 'R$',  name: 'البرازيل (ريال برازيلي)', rate: 7.8,    iso: 'br' },
  { code: 'ZAR', symbol: 'راند', name: 'جنوب أفريقيا (راند)',  rate: 25.8,    iso: 'za' },
  { code: 'SGD', symbol: 'S$',  name: 'سنغافورة (دولار)',    rate: 1.88,    iso: 'sg' },
  { code: 'NZD', symbol: 'NZ$', name: 'نيوزيلندا (دولار)',   rate: 2.35,    iso: 'nz' },
];

// Returns a real flag image URL from flagcdn.com
export function getFlagUrl(iso) {
  if (!iso) return null;
  if (iso === 'eu') return 'https://flagcdn.com/24x18/eu.png';
  return `https://flagcdn.com/24x18/${iso}.png`;
}

const CurrencyContext = createContext(null);

export function CurrencyProvider({ children }) {
  const [currency, setCurrency] = useState(() => {
    try {
      const saved = localStorage.getItem('yafa_currency');
      return CURRENCIES.find(c => c.code === saved) || CURRENCIES[0];
    } catch {
      return CURRENCIES[0];
    }
  });

  useEffect(() => {
    try { localStorage.setItem('yafa_currency', currency.code); } catch {}
  }, [currency]);

  const convert = (jodAmount) => {
    const val = parseFloat(jodAmount) || 0;
    return (val * currency.rate).toFixed(2);
  };

  const format = (jodAmount) => {
    const lang = localStorage.getItem('app_language') || 'ar';
    const amount = convert(jodAmount);
    if (lang === 'en') {
      if (currency.symbol === '$' || currency.symbol === '€' || currency.symbol === '£') {
        return `${currency.symbol}${amount}`;
      }
      return `${amount} ${currency.code}`;
    }
    return `${amount} ${currency.symbol}`;
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, currencies: CURRENCIES, convert, format }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error('useCurrency must be used within CurrencyProvider');
  return ctx;
}

export { CURRENCIES };
