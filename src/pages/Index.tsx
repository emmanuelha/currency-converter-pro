import { CurrencyTable } from '@/components/CurrencyTable';
import { useCurrencyConversion } from '@/hooks/useCurrencyConversion';
import { Euro, ArrowRightLeft } from 'lucide-react';

const Index = () => {
  const {
    rows,
    updateRow,
    addRow,
    removeRow,
    convertAll,
    supportedCurrencies,
  } = useCurrencyConversion();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Euro className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-foreground">Currency Converter</h1>
              <p className="text-xs text-muted-foreground">Convert any currency to Euro</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container max-w-5xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent text-accent-foreground text-xs font-medium mb-4">
            <ArrowRightLeft className="w-3 h-3" />
            Historical Exchange Rates
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            Multi-Currency to Euro
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Enter a date, select a currency, and input an amount to see the converted value in Euros. 
            Perfect for expense tracking and financial reporting.
          </p>
        </div>

        {/* Table */}
        <CurrencyTable
          rows={rows}
          supportedCurrencies={supportedCurrencies}
          onUpdateRow={updateRow}
          onAddRow={addRow}
          onRemoveRow={removeRow}
          onConvertAll={convertAll}
        />

        {/* Help Text */}
        <div className="mt-8 p-6 rounded-xl bg-muted/50 border border-border">
          <h3 className="font-semibold text-foreground mb-3">How to use</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center flex-shrink-0 mt-0.5">1</span>
              <span>Select a <strong>date</strong> for the exchange rate you want to use</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center flex-shrink-0 mt-0.5">2</span>
              <span>Choose the <strong>currency code</strong> (e.g., CAD, USD, GBP)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center flex-shrink-0 mt-0.5">3</span>
              <span>Enter the <strong>amount</strong> in the source currency</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center flex-shrink-0 mt-0.5">4</span>
              <span>Click <strong>Convert All</strong> or the conversion happens automatically</span>
            </li>
          </ul>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-16 py-6">
        <div className="container max-w-5xl mx-auto px-4 text-center text-xs text-muted-foreground">
          Exchange rates provided by{' '}
          <a 
            href="https://www.frankfurter.app/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            Frankfurter API
          </a>
          {' '}• Data from European Central Bank
        </div>
      </footer>
    </div>
  );
};

export default Index;
