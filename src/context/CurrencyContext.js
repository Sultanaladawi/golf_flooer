import { createContext, useContext, useState, useEffect } from 'react';

const CURRENCIES = [
  { code: 'JOD', symbol: 'د.أ', name: 'دينار أردني',    rate: 1,      iso: 'jo' },
  { code: 'USD', symbol: '$',   name: 'دولار أمريكي',   rate: 1.41,   iso: 'us' },
  { code: 'SAR', symbol: 'ر.س', name: 'ريال سعودي',     rate: 5.29,   iso: 'sa' },
  { code: 'AED', symbol: 'د.إ', name: 'درهم إماراتي',   rate: 5.18,   iso: 'ae' },
  { code: 'EUR', symbol: '€',   name: 'يورو',            rate: 1.31,   iso: 'eu' },
  { code: 'GBP', symbol: '£',   name: 'جنيه إسترليني',  rate: 1.11,   iso: 'gb' },
  { code: 'KWD', symbol: 'د.ك', name: 'دينار كويتي',    rate: 0.43,   iso: 'kw' },
  { code: 'QAR', symbol: 'ر.ق', name: 'ريال قطري',      rate: 5.14,   iso: 'qa' },
  { code: 'BHD', symbol: 'د.ب', name: 'دينار بحريني',   rate: 0.53,   iso: 'bh' },
  { code: 'EGP', symbol: 'ج.م', name: 'جنيه مصري',      rate: 68.5,   iso: 'eg' },
];

// Returns a real flag image URL from flagcdn.com
export function getFlagUrl(iso) {
  if (!iso) return null;
  // EU uses a special path
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
    return `${currency.symbol} ${convert(jodAmount)}`;
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
