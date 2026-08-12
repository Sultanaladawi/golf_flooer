import { createContext, useContext, useState, useEffect } from 'react';

const CURRENCIES = [
  // ── الخليج العربي ──
  { code: 'JOD', symbol: 'د.أ', name: 'دينار أردني',      rate: 1,       iso: 'jo' },
  { code: 'SAR', symbol: 'ر.س', name: 'ريال سعودي',       rate: 5.29,    iso: 'sa' },
  { code: 'AED', symbol: 'د.إ', name: 'درهم إماراتي',     rate: 5.18,    iso: 'ae' },
  { code: 'KWD', symbol: 'د.ك', name: 'دينار كويتي',      rate: 0.43,    iso: 'kw' },
  { code: 'QAR', symbol: 'ر.ق', name: 'ريال قطري',        rate: 5.14,    iso: 'qa' },
  { code: 'BHD', symbol: 'د.ب', name: 'دينار بحريني',     rate: 0.53,    iso: 'bh' },
  { code: 'OMR', symbol: 'ر.ع', name: 'ريال عُماني',      rate: 0.54,    iso: 'om' },
  // ── المشرق العربي ──
  { code: 'IQD', symbol: 'ع.د', name: 'دينار عراقي',      rate: 1846,    iso: 'iq' },
  { code: 'EGP', symbol: 'ج.م', name: 'جنيه مصري',        rate: 68.5,    iso: 'eg' },
  { code: 'SDG', symbol: 'ج.س', name: 'جنيه سوداني',      rate: 845,     iso: 'sd' },
  { code: 'YER', symbol: 'ر.ي', name: 'ريال يمني',        rate: 352,     iso: 'ye' },
  // ── المغرب العربي ──
  { code: 'MAD', symbol: 'د.م', name: 'درهم مغربي',       rate: 14.1,    iso: 'ma' },
  { code: 'DZD', symbol: 'د.ج', name: 'دينار جزائري',     rate: 190,     iso: 'dz' },
  { code: 'TND', symbol: 'د.ت', name: 'دينار تونسي',      rate: 4.3,     iso: 'tn' },
  { code: 'LYD', symbol: 'د.ل', name: 'دينار ليبي',       rate: 6.85,    iso: 'ly' },
  // ── عالمية ──
  { code: 'USD', symbol: '$',   name: 'دولار أمريكي',     rate: 1.41,    iso: 'us' },
  { code: 'EUR', symbol: '€',   name: 'يورو',              rate: 1.31,    iso: 'eu' },
  { code: 'GBP', symbol: '£',   name: 'جنيه إسترليني',    rate: 1.11,    iso: 'gb' },
  { code: 'CAD', symbol: 'C$',  name: 'دولار كندي',       rate: 1.94,    iso: 'ca' },
  { code: 'AUD', symbol: 'A$',  name: 'دولار أسترالي',    rate: 2.16,    iso: 'au' },
  { code: 'TRY', symbol: '₺',   name: 'ليرة تركية',       rate: 45.2,    iso: 'tr' },
  { code: 'INR', symbol: '₹',   name: 'روبية هندية',      rate: 117.5,   iso: 'in' },
  { code: 'CNY', symbol: '¥',   name: 'يوان صيني',        rate: 10.2,    iso: 'cn' },
  { code: 'JPY', symbol: '¥',   name: 'ين ياباني',        rate: 210,     iso: 'jp' },
  { code: 'CHF', symbol: 'Fr',  name: 'فرنك سويسري',      rate: 1.27,    iso: 'ch' },
  { code: 'SEK', symbol: 'kr',  name: 'كرون سويدي',       rate: 14.8,    iso: 'se' },
  { code: 'NOK', symbol: 'kr',  name: 'كرون نرويجي',      rate: 15.1,    iso: 'no' },
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
