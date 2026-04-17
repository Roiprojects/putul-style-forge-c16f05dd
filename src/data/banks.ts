// Bank lists by country (ISO-2 code). "default" is fallback.
export const BANKS_BY_COUNTRY: Record<string, string[]> = {
  IN: [
    "State Bank of India", "HDFC Bank", "ICICI Bank", "Axis Bank", "Kotak Mahindra Bank",
    "Punjab National Bank", "Bank of Baroda", "Canara Bank", "Union Bank of India",
    "Bank of India", "IndusInd Bank", "Yes Bank", "IDFC FIRST Bank", "Federal Bank",
    "RBL Bank", "South Indian Bank", "Karur Vysya Bank", "City Union Bank",
    "Bandhan Bank", "AU Small Finance Bank", "IDBI Bank", "Indian Bank",
    "Indian Overseas Bank", "UCO Bank", "Central Bank of India", "Punjab & Sind Bank",
    "Standard Chartered Bank", "HSBC India", "Citibank India", "DBS Bank India",
    "Paytm Payments Bank", "Airtel Payments Bank", "Jio Payments Bank",
  ],
  ES: [
    "Banco Santander", "BBVA", "CaixaBank", "Banco Sabadell", "Bankinter",
    "Unicaja Banco", "Abanca", "Ibercaja", "Kutxabank", "Cajamar", "Openbank",
    "ING España", "Deutsche Bank España", "EVO Banco", "WiZink", "N26 España",
    "Revolut", "BNP Paribas España",
  ],
  US: [
    "JPMorgan Chase", "Bank of America", "Wells Fargo", "Citibank", "U.S. Bank",
    "PNC Bank", "Truist Bank", "Capital One", "TD Bank", "Goldman Sachs",
    "Charles Schwab Bank", "Ally Bank", "Discover Bank", "American Express Bank",
    "HSBC USA", "Citizens Bank", "Fifth Third Bank", "KeyBank", "Regions Bank",
  ],
  GB: [
    "Barclays", "HSBC UK", "Lloyds Bank", "NatWest", "Santander UK", "Halifax",
    "Nationwide", "TSB Bank", "Royal Bank of Scotland", "Bank of Scotland",
    "Metro Bank", "Monzo", "Starling Bank", "Revolut", "First Direct", "Co-operative Bank",
  ],
  AE: [
    "Emirates NBD", "First Abu Dhabi Bank", "Abu Dhabi Commercial Bank",
    "Dubai Islamic Bank", "Mashreq Bank", "RAKBANK", "Commercial Bank of Dubai",
    "Abu Dhabi Islamic Bank", "HSBC UAE", "Standard Chartered UAE", "Citibank UAE",
  ],
  CA: [
    "Royal Bank of Canada", "TD Canada Trust", "Scotiabank", "Bank of Montreal",
    "CIBC", "National Bank of Canada", "HSBC Canada", "Tangerine", "Desjardins",
  ],
  AU: [
    "Commonwealth Bank", "Westpac", "ANZ", "National Australia Bank", "Macquarie Bank",
    "Bendigo Bank", "Suncorp Bank", "ING Australia", "Bank of Queensland",
  ],
  default: [
    "Other / International Bank",
  ],
};

export const getBanksForCountry = (country?: string | null): string[] => {
  if (!country) return BANKS_BY_COUNTRY.default;
  const code = country.toUpperCase();
  return BANKS_BY_COUNTRY[code] || BANKS_BY_COUNTRY.default;
};
