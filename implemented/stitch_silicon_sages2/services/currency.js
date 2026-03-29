// ============================================================
// CurrencyService — Live rates via exchangerate-api + country API
// Caches rates in sessionStorage for performance
// ============================================================

const CurrencyService = (() => {
  const API_KEY = 'd2d5e78f37ca64a96e9305c9';
  const RATES_CACHE_KEY = 'expensepro_rates_cache';
  const COUNTRIES_CACHE_KEY = 'expensepro_countries';

  // Currency symbols
  const SYMBOLS = {
    USD: '$', EUR: '€', GBP: '£', INR: '₹', JPY: '¥', SGD: 'S$', AUD: 'A$', CAD: 'C$',
    CHF: 'CHF', CNY: '¥', KRW: '₩', BRL: 'R$', MXN: 'MX$', SEK: 'kr', NOK: 'kr',
    DKK: 'kr', NZD: 'NZ$', ZAR: 'R', AED: 'د.إ', SAR: '﷼', THB: '฿', MYR: 'RM',
    IDR: 'Rp', PHP: '₱', HKD: 'HK$', TWD: 'NT$', PLN: 'zł', TRY: '₺', RUB: '₽',
    HUF: 'Ft', CZK: 'Kč', ILS: '₪', CLP: 'CL$', COP: 'CO$', PEN: 'S/', ARS: 'AR$',
    EGP: 'E£', NGN: '₦', KES: 'KSh', GHS: 'GH₵', PKR: '₨', BDT: '৳', LKR: 'Rs',
    NPR: 'रू', MMK: 'K', VND: '₫',
  };

  // Common currencies to show in dropdowns
  const COMMON_CURRENCIES = [
    'USD', 'EUR', 'GBP', 'INR', 'JPY', 'SGD', 'AUD', 'CAD', 'CHF', 'CNY',
    'KRW', 'BRL', 'MXN', 'SEK', 'NOK', 'NZD', 'ZAR', 'AED', 'THB', 'MYR',
    'IDR', 'PHP', 'HKD', 'TRY', 'RUB', 'PLN', 'PKR', 'BDT', 'VND', 'EGP', 'NGN',
  ];

  function getCurrencySymbol(code) {
    return SYMBOLS[code] || code + ' ';
  }

  function getAvailableCurrencies() {
    return COMMON_CURRENCIES;
  }

  // ---- Fetch live rates ----
  async function fetchRates(baseCurrency) {
    // Check cache first
    const cached = _getCachedRates(baseCurrency);
    if (cached) return cached;

    try {
      const resp = await fetch(`https://api.exchangerate-api.com/v4/latest/${baseCurrency}`);
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const data = await resp.json();
      const rates = data.rates || {};
      _cacheRates(baseCurrency, rates);
      return rates;
    } catch (err) {
      console.warn('Currency API failed, using fallback rates:', err);
      return _fallbackRates(baseCurrency);
    }
  }

  // ---- Convert ----
  async function convert(amount, fromCurrency, toCurrency) {
    if (fromCurrency === toCurrency) {
      return { convertedAmount: amount, rate: 1 };
    }
    const rates = await fetchRates(fromCurrency);
    const rate = rates[toCurrency] || 1;
    return {
      convertedAmount: amount * rate,
      rate,
    };
  }

  // ---- Countries API ----
  async function fetchCountries() {
    const cached = sessionStorage.getItem(COUNTRIES_CACHE_KEY);
    if (cached) {
      try { return JSON.parse(cached); } catch {}
    }
    try {
      const resp = await fetch('https://restcountries.com/v3.1/all?fields=name,currencies');
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const data = await resp.json();
      const countries = data
        .map(c => {
          const currKeys = Object.keys(c.currencies || {});
          return {
            name: c.name?.common || 'Unknown',
            currency: currKeys[0] || 'USD',
            currencyName: c.currencies?.[currKeys[0]]?.name || '',
            currencySymbol: c.currencies?.[currKeys[0]]?.symbol || '',
          };
        })
        .filter(c => c.currency)
        .sort((a, b) => a.name.localeCompare(b.name));

      sessionStorage.setItem(COUNTRIES_CACHE_KEY, JSON.stringify(countries));
      return countries;
    } catch (err) {
      console.warn('Countries API failed, using fallback:', err);
      return _fallbackCountries();
    }
  }

  // ---- Cache helpers ----
  function _getCachedRates(base) {
    try {
      const cached = JSON.parse(sessionStorage.getItem(RATES_CACHE_KEY) || '{}');
      if (cached.base === base && cached.timestamp && (Date.now() - cached.timestamp) < 3600000) {
        return cached.rates;
      }
    } catch {}
    return null;
  }

  function _cacheRates(base, rates) {
    sessionStorage.setItem(RATES_CACHE_KEY, JSON.stringify({ base, rates, timestamp: Date.now() }));
  }

  // ---- Fallback rates (offline) ----
  function _fallbackRates(base) {
    const usdRates = {
      USD:1, EUR:0.92, GBP:0.79, INR:83.12, JPY:149.50, SGD:1.34, AUD:1.53, CAD:1.36,
      CHF:0.88, CNY:7.24, KRW:1320, BRL:4.97, MXN:17.15, SEK:10.41, NOK:10.52,
      NZD:1.62, ZAR:18.44, AED:3.67, THB:34.87, MYR:4.64, IDR:15580, PHP:55.82,
      HKD:7.82, TRY:27.24, RUB:91.50, PLN:3.99, PKR:286.00, BDT:110.50, VND:24380,
      EGP:30.90, NGN:1520,
    };
    const baseToUsd = 1 / (usdRates[base] || 1);
    const rates = {};
    Object.keys(usdRates).forEach(k => { rates[k] = usdRates[k] * baseToUsd; });
    return rates;
  }

  function _fallbackCountries() {
    return [
      { name: 'United States', currency: 'USD', currencyName: 'US Dollar', currencySymbol: '$' },
      { name: 'United Kingdom', currency: 'GBP', currencyName: 'Pound Sterling', currencySymbol: '£' },
      { name: 'European Union', currency: 'EUR', currencyName: 'Euro', currencySymbol: '€' },
      { name: 'India', currency: 'INR', currencyName: 'Indian Rupee', currencySymbol: '₹' },
      { name: 'Singapore', currency: 'SGD', currencyName: 'Singapore Dollar', currencySymbol: 'S$' },
      { name: 'Japan', currency: 'JPY', currencyName: 'Japanese Yen', currencySymbol: '¥' },
      { name: 'Australia', currency: 'AUD', currencyName: 'Australian Dollar', currencySymbol: 'A$' },
      { name: 'Canada', currency: 'CAD', currencyName: 'Canadian Dollar', currencySymbol: 'C$' },
    ];
  }

  return {
    getCurrencySymbol, getAvailableCurrencies,
    fetchRates, convert,
    fetchCountries,
  };
})();
