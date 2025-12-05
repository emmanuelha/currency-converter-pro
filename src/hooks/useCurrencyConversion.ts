import { useState, useCallback } from 'react';
import { CurrencyRow } from '@/types/currency';

const SUPPORTED_CURRENCIES = [
  'USD', 'CAD', 'GBP', 'CHF', 'JPY', 'AUD', 'NZD', 'SEK', 'NOK', 'DKK',
  'PLN', 'CZK', 'HUF', 'RON', 'BGN', 'HRK', 'ISK', 'TRY', 'RUB', 'BRL',
  'CNY', 'HKD', 'SGD', 'THB', 'MXN', 'ZAR', 'INR', 'KRW', 'IDR', 'MYR', 'PHP'
];

export const useCurrencyConversion = () => {
  const [rows, setRows] = useState<CurrencyRow[]>([
    createEmptyRow(),
    createEmptyRow(),
    createEmptyRow(),
  ]);

  function createEmptyRow(): CurrencyRow {
    return {
      id: crypto.randomUUID(),
      date: new Date().toISOString().split('T')[0],
      currencyCode: 'CAD',
      amount: '',
      convertedAmount: null,
      isLoading: false,
      error: null,
    };
  }

  const fetchExchangeRate = async (date: string, currency: string): Promise<number | null> => {
    try {
      // Frankfurter API for historical exchange rates
      const response = await fetch(
        `https://api.frankfurter.app/${date}?from=${currency}&to=EUR`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch exchange rate');
      }
      
      const data = await response.json();
      return data.rates?.EUR || null;
    } catch (error) {
      console.error('Exchange rate fetch error:', error);
      return null;
    }
  };

  const updateRow = useCallback(async (id: string, field: keyof CurrencyRow, value: string) => {
    setRows(prev => prev.map(row => {
      if (row.id !== id) return row;
      return { ...row, [field]: value, error: null };
    }));

    // Get the current row after update
    setRows(prev => {
      const row = prev.find(r => r.id === id);
      if (!row) return prev;

      const updatedRow = { ...row, [field]: value };
      
      // Check if we should convert
      const shouldConvert = 
        updatedRow.date && 
        updatedRow.currencyCode && 
        updatedRow.amount && 
        !isNaN(parseFloat(updatedRow.amount)) &&
        parseFloat(updatedRow.amount) > 0;

      if (!shouldConvert) {
        return prev.map(r => r.id === id ? { ...updatedRow, convertedAmount: null, isLoading: false } : r);
      }

      // Start conversion
      return prev.map(r => r.id === id ? { ...updatedRow, isLoading: true } : r);
    });

    // Perform the actual conversion
    const currentRows = await new Promise<CurrencyRow[]>(resolve => {
      setRows(prev => {
        resolve(prev);
        return prev;
      });
    });

    const row = currentRows.find(r => r.id === id);
    if (!row || !row.isLoading) return;

    const rate = await fetchExchangeRate(row.date, row.currencyCode);
    
    setRows(prev => prev.map(r => {
      if (r.id !== id) return r;
      if (rate === null) {
        return { ...r, convertedAmount: null, isLoading: false, error: 'Unable to fetch rate' };
      }
      const amount = parseFloat(r.amount);
      return { ...r, convertedAmount: amount * rate, isLoading: false, error: null };
    }));
  }, []);

  const addRow = useCallback(() => {
    setRows(prev => [...prev, createEmptyRow()]);
  }, []);

  const removeRow = useCallback((id: string) => {
    setRows(prev => {
      if (prev.length <= 1) return prev;
      return prev.filter(row => row.id !== id);
    });
  }, []);

  const convertAll = useCallback(async () => {
    const rowsToConvert = rows.filter(row => 
      row.date && 
      row.currencyCode && 
      row.amount && 
      !isNaN(parseFloat(row.amount)) &&
      parseFloat(row.amount) > 0
    );

    // Set loading state for all valid rows
    setRows(prev => prev.map(row => {
      const shouldConvert = rowsToConvert.some(r => r.id === row.id);
      return shouldConvert ? { ...row, isLoading: true } : row;
    }));

    // Convert all rows
    await Promise.all(rowsToConvert.map(async (row) => {
      const rate = await fetchExchangeRate(row.date, row.currencyCode);
      
      setRows(prev => prev.map(r => {
        if (r.id !== row.id) return r;
        if (rate === null) {
          return { ...r, convertedAmount: null, isLoading: false, error: 'Unable to fetch rate' };
        }
        const amount = parseFloat(r.amount);
        return { ...r, convertedAmount: amount * rate, isLoading: false, error: null };
      }));
    }));
  }, [rows]);

  return {
    rows,
    updateRow,
    addRow,
    removeRow,
    convertAll,
    supportedCurrencies: SUPPORTED_CURRENCIES,
  };
};
