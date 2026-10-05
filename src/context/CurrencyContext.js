import { createContext, useContext, useState, useEffect } from 'react';

const CURRENCIES = [
  // ── دول الشام والخليج العربي ──
  { code: 'JOD', symbol: 'د.أ', name: 'الأردن (دينار أردني)',   nameEn: 'Jordan (JOD)',       rate: 1,       iso: 'jo' },
  { code: 'ILS', symbol: 'شيكل', name: 'فلسطين (شيكل)',         nameEn: 'Palestine (ILS)',    rate: 5.25,    iso: 'ps' },
  { code: 'SAR', symbol: 'ر.س', name: 'السعودية (ريال سعودي)',   nameEn: 'Saudi Arabia (SAR)', rate: 5.29,    iso: 'sa' },
  { code: 'AED', symbol: 'د.إ', name: 'الإمارات (درهم إماراتي)', nameEn: 'UAE (AED)',          rate: 5.18,    iso: 'ae' },
  { code: 'KWD', symbol: 'د.ك', name: 'الكويت (دينار كويتي)',   nameEn: 'Kuwait (KWD)',       rate: 0.43,    iso: 'kw' },
  { code: 'QAR', symbol: 'ر.ق', name: 'قطر (ريال قطري)',        nameEn: 'Qatar (QAR)',        rate: 5.14,    iso: 'qa' },
  { code: 'BHD', symbol: 'د.ب', name: 'البحرين (دينار بحريني)', nameEn: 'Bahrain (BHD)',      rate: 0.53,    iso: 'bh' },
  { code: 'OMR', symbol: 'ر.ع', name: 'سلطنة عُمان (ريال)',    nameEn: 'Oman (OMR)',         rate: 0.54,    iso: 'om' },
  { code: 'SYP', symbol: 'ل.س', name: 'سوريا (ليرة سورية)',     nameEn: 'Syria (SYP)',        rate: 18300,   iso: 'sy' },
  { code: 'LBP', symbol: 'ل.ل', name: 'لبنان (ليرة لبنانية)',   nameEn: 'Lebanon (LBP)',      rate: 126000,  iso: 'lb' },
  
  // ── بقية الوطن العربي ──
  { code: 'IQD', symbol: 'ع.د', name: 'العراق (دينار عراقي)',   nameEn: 'Iraq (IQD)',         rate: 1846,    iso: 'iq' },
  { code: 'EGP', symbol: 'ج.م', name: 'مصر (جنيه مصري)',        nameEn: 'Egypt (EGP)',        rate: 68.5,    iso: 'eg' },
  { code: 'SDG', symbol: 'ج.س', name: 'السودان (جنيه سوداني)', nameEn: 'Sudan (SDG)',        rate: 845,     iso: 'sd' },
  { code: 'YER', symbol: 'ر.ي', name: 'اليمن (ريال يمني)',      nameEn: 'Yemen (YER)',        rate: 352,     iso: 'ye' },
  { code: 'MAD', symbol: 'د.م', name: 'المغرب (درهم مغربي)',    nameEn: 'Morocco (MAD)',      rate: 14.1,    iso: 'ma' },
  { code: 'DZD', symbol: 'د.ج', name: 'الجزائر (دينار جزائري)', nameEn: 'Algeria (DZD)',      rate: 190,     iso: 'dz' },
  { code: 'TND', symbol: 'د.ت', name: 'تونس (دينار تونسي)',    nameEn: 'Tunisia (TND)',      rate: 4.3,     iso: 'tn' },
  { code: 'LYD', symbol: 'د.ل', name: 'ليبيا (دينار ليبي)',    nameEn: 'Libya (LYD)',        rate: 6.85,    iso: 'ly' },
  { code: 'MRU', symbol: 'أ.م', name: 'موريتانيا (أوقية)',     nameEn: 'Mauritania (MRU)',   rate: 56.2,    iso: 'mr' },
  { code: 'SOS', symbol: 'ش.س', name: 'الصومال (شلن صومالي)', nameEn: 'Somalia (SOS)',      rate: 805,     iso: 'so' },
  { code: 'DJF', symbol: 'ف.د', name: 'جيبوتي (فرنك جيبوتي)', nameEn: 'Djibouti (DJF)',     rate: 251,     iso: 'dj' },
  { code: 'KMF', symbol: 'ف.ج', name: 'جزر القمر (فرنك قمري)',  nameEn: 'Comoros (KMF)',      rate: 645,     iso: 'km' },

  // ── دولية وعالمية ──
  { code: 'USD', symbol: '$',   name: 'أمريكا (دولار أمريكي)', nameEn: 'USA (USD)',          rate: 1.41,    iso: 'us' },
  { code: 'EUR', symbol: '€',   name: 'الاتحاد الأوروبي (يورو)', nameEn: 'European Union (EUR)', rate: 1.31,  iso: 'eu' },
  { code: 'GBP', symbol: '£',   name: 'بريطانيا (جنيه إسترليني)', nameEn: 'UK (GBP)',          rate: 1.11,    iso: 'gb' },
  { code: 'CAD', symbol: 'C$',  name: 'كندا (دولار كندي)',     nameEn: 'Canada (CAD)',       rate: 1.94,    iso: 'ca' },
  { code: 'AUD', symbol: 'A$',  name: 'أستراليا (دولار)',     nameEn: 'Australia (AUD)',    rate: 2.16,    iso: 'au' },
  { code: 'TRY', symbol: '₺',   name: 'تركيا (ليرة تركية)',   nameEn: 'Turkey (TRY)',       rate: 45.2,    iso: 'tr' },
  { code: 'RUB', symbol: 'روبل', name: 'روسيا (روبل روسي)',     nameEn: 'Russia (RUB)',       rate: 128,     iso: 'ru' },
  { code: 'MYR', symbol: 'رينغيت', name: 'ماليزيا (رينغيت)',    nameEn: 'Malaysia (MYR)',     rate: 6.25,    iso: 'my' },
  { code: 'IDR', symbol: 'روبية', name: 'إندونيسيا (روبية إندونيسية)', nameEn: 'Indonesia (IDR)', rate: 22800, iso: 'id' },
  { code: 'BND', symbol: 'B$',  name: 'بروناي (دولار بروناي)',  nameEn: 'Brunei (BND)',       rate: 1.88,    iso: 'bn' },
  { code: 'SGD', symbol: 'S$',  name: 'سنغافورة (دولار)',    nameEn: 'Singapore (SGD)',    rate: 1.88,    iso: 'sg' },
  { code: 'THB', symbol: '฿',   name: 'تايلاند (بات تايلاندي)', nameEn: 'Thailand (THB)',     rate: 49.5,    iso: 'th' },
  { code: 'PHP', symbol: '₱',   name: 'الفلبين (بيزو فلبيني)', nameEn: 'Philippines (PHP)',  rate: 82.5,    iso: 'ph' },
  { code: 'INR', symbol: '₹',   name: 'الهند (روبية هندية)',   nameEn: 'India (INR)',        rate: 117.5,   iso: 'in' },
  { code: 'CNY', symbol: '¥',   name: 'الصين (يوان صيني)',    nameEn: 'China (CNY)',        rate: 10.2,    iso: 'cn' },
  { code: 'JPY', symbol: '¥',   name: 'اليابان (ين ياباني)',   nameEn: 'Japan (JPY)',        rate: 210,     iso: 'jp' },
  { code: 'KRW', symbol: '₩',   name: 'كوريا الجنوبية (وون)', nameEn: 'South Korea (KRW)',  rate: 1950,    iso: 'kr' },
  { code: 'CHF', symbol: 'Fr',  name: 'سويسرا (فرنك سويسري)',  nameEn: 'Switzerland (CHF)',  rate: 1.27,    iso: 'ch' },
  { code: 'SEK', symbol: 'kr',  name: 'السويد (كرون سويدي)',   nameEn: 'Sweden (SEK)',       rate: 14.8,    iso: 'se' },
  { code: 'NOK', symbol: 'kr',  name: 'النرويج (كرون نرويجي)', nameEn: 'Norway (NOK)',       rate: 15.1,    iso: 'no' },
  { code: 'BRL', symbol: 'R$',  name: 'البرازيل (ريال برازيلي)', nameEn: 'Brazil (BRL)',       rate: 7.8,     iso: 'br' },
  { code: 'ZAR', symbol: 'راند', name: 'جنوب أفريقيا (راند)',  nameEn: 'South Africa (ZAR)', rate: 25.8,    iso: 'za' },
  { code: 'NZD', symbol: 'NZ$', name: 'نيوزيلندا (دولار)',   nameEn: 'New Zealand (NZD)',  rate: 2.35,    iso: 'nz' },
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
