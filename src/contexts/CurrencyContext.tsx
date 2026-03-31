import { createContext, useContext, useState, useEffect, ReactNode } from "react";

// Currency data: symbol, code, and approximate exchange rate from INR
const CURRENCY_MAP: Record<string, { symbol: string; code: string; rate: number }> = {
  IN: { symbol: "₹", code: "INR", rate: 1 },
  US: { symbol: "$", code: "USD", rate: 0.012 },
  GB: { symbol: "£", code: "GBP", rate: 0.0094 },
  AU: { symbol: "A$", code: "AUD", rate: 0.018 },
  CN: { symbol: "¥", code: "CNY", rate: 0.086 },
  JP: { symbol: "¥", code: "JPY", rate: 1.78 },
  DE: { symbol: "€", code: "EUR", rate: 0.011 },
  FR: { symbol: "€", code: "EUR", rate: 0.011 },
  IT: { symbol: "€", code: "EUR", rate: 0.011 },
  ES: { symbol: "€", code: "EUR", rate: 0.011 },
  PT: { symbol: "€", code: "EUR", rate: 0.011 },
  NL: { symbol: "€", code: "EUR", rate: 0.011 },
  BE: { symbol: "€", code: "EUR", rate: 0.011 },
  AT: { symbol: "€", code: "EUR", rate: 0.011 },
  IE: { symbol: "€", code: "EUR", rate: 0.011 },
  FI: { symbol: "€", code: "EUR", rate: 0.011 },
  GR: { symbol: "€", code: "EUR", rate: 0.011 },
  RU: { symbol: "₽", code: "RUB", rate: 1.06 },
  BR: { symbol: "R$", code: "BRL", rate: 0.060 },
  ZA: { symbol: "R", code: "ZAR", rate: 0.22 },
  KR: { symbol: "₩", code: "KRW", rate: 16.1 },
  MX: { symbol: "$", code: "MXN", rate: 0.21 },
  ID: { symbol: "Rp", code: "IDR", rate: 189 },
  TR: { symbol: "₺", code: "TRY", rate: 0.38 },
  SA: { symbol: "﷼", code: "SAR", rate: 0.045 },
  AE: { symbol: "د.إ", code: "AED", rate: 0.044 },
  SG: { symbol: "S$", code: "SGD", rate: 0.016 },
  MY: { symbol: "RM", code: "MYR", rate: 0.053 },
  TH: { symbol: "฿", code: "THB", rate: 0.42 },
  PH: { symbol: "₱", code: "PHP", rate: 0.67 },
  VN: { symbol: "₫", code: "VND", rate: 302 },
  BD: { symbol: "৳", code: "BDT", rate: 1.31 },
  PK: { symbol: "₨", code: "PKR", rate: 3.33 },
  LK: { symbol: "Rs", code: "LKR", rate: 3.6 },
  NP: { symbol: "₨", code: "NPR", rate: 1.59 },
  EG: { symbol: "E£", code: "EGP", rate: 0.58 },
  NG: { symbol: "₦", code: "NGN", rate: 18.0 },
  KE: { symbol: "KSh", code: "KES", rate: 1.55 },
  CA: { symbol: "C$", code: "CAD", rate: 0.016 },
  SE: { symbol: "kr", code: "SEK", rate: 0.12 },
  NO: { symbol: "kr", code: "NOK", rate: 0.13 },
  DK: { symbol: "kr", code: "DKK", rate: 0.082 },
  PL: { symbol: "zł", code: "PLN", rate: 0.047 },
  CZ: { symbol: "Kč", code: "CZK", rate: 0.27 },
  HU: { symbol: "Ft", code: "HUF", rate: 4.36 },
  RO: { symbol: "lei", code: "RON", rate: 0.055 },
  UA: { symbol: "₴", code: "UAH", rate: 0.49 },
  CH: { symbol: "CHF", code: "CHF", rate: 0.010 },
  NZ: { symbol: "NZ$", code: "NZD", rate: 0.020 },
  AR: { symbol: "$", code: "ARS", rate: 11.9 },
  CL: { symbol: "$", code: "CLP", rate: 11.2 },
  CO: { symbol: "$", code: "COP", rate: 49.5 },
  PE: { symbol: "S/", code: "PEN", rate: 0.044 },
  QA: { symbol: "﷼", code: "QAR", rate: 0.044 },
  KW: { symbol: "د.ك", code: "KWD", rate: 0.0037 },
  BH: { symbol: "BD", code: "BHD", rate: 0.0045 },
  OM: { symbol: "﷼", code: "OMR", rate: 0.0046 },
  JO: { symbol: "JD", code: "JOD", rate: 0.0085 },
};

// All available currencies for manual picker (deduplicated by code)
const seen = new Set<string>();
export const availableCurrencies = Object.values(CURRENCY_MAP).filter((c) => {
  if (seen.has(c.code)) return false;
  seen.add(c.code);
  return true;
});

interface CurrencyContextType {
  currencyCode: string;
  currencySymbol: string;
  isINR: boolean;
  convertPrice: (inrPrice: number) => number;
  formatPrice: (inrPrice: number) => string;
  setCurrencyCode: (code: string) => void;
}

const CurrencyContext = createContext<CurrencyContextType>({
  currencyCode: "INR",
  currencySymbol: "₹",
  isINR: true,
  convertPrice: (p) => p,
  formatPrice: (p) => `₹${p.toLocaleString()}`,
  setCurrencyCode: () => {},
});

export const useCurrency = () => useContext(CurrencyContext);

export const CurrencyProvider = ({ children }: { children: ReactNode }) => {
  const [currency, setCurrency] = useState<{ symbol: string; code: string; rate: number }>({
    symbol: "₹",
    code: "INR",
    rate: 1,
  });

  // Auto-detect country on mount
  useEffect(() => {
    const stored = localStorage.getItem("preferred_currency");
    if (stored) {
      const found = availableCurrencies.find((c) => c.code === stored);
      if (found) {
        setCurrency(found);
        return;
      }
    }

    // IP-based detection
    fetch("https://ipapi.co/json/")
      .then((r) => r.json())
      .then((data) => {
        const countryCode = data?.country_code;
        if (countryCode && CURRENCY_MAP[countryCode] && countryCode !== "IN") {
          setCurrency(CURRENCY_MAP[countryCode]);
        }
      })
      .catch(() => {
        // Silently fail, keep INR
      });
  }, []);

  const setCurrencyCode = (code: string) => {
    const found = availableCurrencies.find((c) => c.code === code);
    if (found) {
      setCurrency(found);
      localStorage.setItem("preferred_currency", code);
    }
  };

  const convertPrice = (inrPrice: number) => {
    if (currency.code === "INR") return inrPrice;
    return Math.round(inrPrice * currency.rate * 100) / 100;
  };

  const formatPrice = (inrPrice: number) => {
    if (currency.code === "INR") return `₹${inrPrice.toLocaleString()}`;
    const converted = convertPrice(inrPrice);
    return `${currency.symbol}${converted.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <CurrencyContext.Provider
      value={{
        currencyCode: currency.code,
        currencySymbol: currency.symbol,
        isINR: currency.code === "INR",
        convertPrice,
        formatPrice,
        setCurrencyCode,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};
