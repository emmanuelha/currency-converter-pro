export interface CurrencyRow {
  id: string;
  date: string;
  currencyCode: string;
  amount: string;
  convertedAmount: number | null;
  isLoading: boolean;
  error: string | null;
}

export interface ExchangeRate {
  base: string;
  date: string;
  rates: Record<string, number>;
}
