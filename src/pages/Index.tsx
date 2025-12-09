import { Button } from '@/components/ui/button';
import { Copy, Check, FileSpreadsheet } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

const APPS_SCRIPT_CODE = `function setupSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName('Data');
  
  if (!sheet) {
    sheet = ss.insertSheet('Data');
  }
  
  const headers = ['Date', 'Currency Code', 'Amount', 'Exchange Rate (EUR)', 'Converted EUR'];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
  sheet.getRange('E2').setFormula('=IF(D2="","",C2*D2)');
  
  SpreadsheetApp.getUi().alert('Sheet setup complete! Add your data starting from row 2.');
}

function fetchExchangeRates() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Data');
  const lastRow = sheet.getLastRow();
  
  for (let i = 2; i <= lastRow; i++) {
    const date = sheet.getRange(i, 1).getValue();
    const currency = sheet.getRange(i, 2).getValue();
    
    if (date && currency && currency !== 'EUR') {
      const dateStr = Utilities.formatDate(new Date(date), 'GMT', 'yyyy-MM-dd');
      const url = 'https://api.frankfurter.app/' + dateStr + '?from=' + currency + '&to=EUR';
      
      try {
        const response = UrlFetchApp.fetch(url);
        const json = JSON.parse(response.getContentText());
        const rate = json.rates.EUR;
        
        if (rate) {
          sheet.getRange(i, 4).setValue(rate);
        }
      } catch (e) {
        Logger.log('Error fetching rate for row ' + i + ': ' + e);
      }
    }
  }
  
  SpreadsheetApp.getUi().alert('Exchange rates updated!');
}

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Currency Converter')
    .addItem('Setup Sheet', 'setupSheet')
    .addItem('Fetch Exchange Rates', 'fetchExchangeRates')
    .addToUi();
}`;

const Index = () => {
  const [copied, setCopied] = useState(false);

  const copyAppsScriptCode = async () => {
    await navigator.clipboard.writeText(APPS_SCRIPT_CODE);
    setCopied(true);
    toast.success('Apps Script code copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="flex justify-end">
          <Link to="/fr" className="text-sm text-muted-foreground hover:text-primary">
            Français
          </Link>
        </div>

        <div className="text-left space-y-4">
          <FileSpreadsheet className="w-16 h-16 mx-auto text-primary" />
          <h1 className="text-3xl font-bold text-foreground">
            Currency to EUR Converter
          </h1>
            <p className="rounded-xl border border-border bg-card p-6 space-y-4;">
            Why this converter?

            <br /><b>Do you know how your broker handles currency conversions for each transaction?</b>
            <br /><b>Do you have accounts that are not in your base currency EUR?</b>

            <br /><br />If you have multiple accounts in different currencies, this template will help you easily convert amounts to EUR using historical exchange rates.
            <br /><br />Why would you have accounts not in your base currency EUR, you might ask?

            <br />Simple: at certain brokers, when you hold cash in multiple currencies and you sell stocks in dollars for example, the broker will perform a series of conversions across different currencies and not just a dollar sale. You have no control over these currency conversions.
            <br /><br />To avoid this, it's wise to have accounts in different currencies.
            <br />However, the downside is that you must manage currency conversions yourself to know how much you really have in EUR.

            <br /><br />This converter is simple; it uses Google Sheets because almost all of us have a Google account.
            <br />But not all of us have Excel (which has a cost) and some are on Mac or Linux.
            <br />This converter uses a Google Sheets template with Apps Script that fetches exchange rates from the Frankfurter API.
            <br />If you would like to see support for other target currencies than EUR, please let me know!
            </p>
        </div>

        <div className="rounded-xl border border-border bg-muted/50 p-6 space-y-3">
          <h3 className="font-semibold text-foreground">Step 1: Create Your Google Sheet</h3>
          <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
            <li>Go to <a href="https://sheets.google.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Google Sheets</a> and create a new spreadsheet</li>
            <li>Add the Apps Script below (Step 2), then use <strong>Currency Converter → Setup Sheet</strong> to auto-create headers</li>
          </ol>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-foreground">Step 2: Add the Apps Script</h3>
            <Button variant="outline" size="sm" onClick={copyAppsScriptCode} className="gap-2">
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied!' : 'Copy Code'}
            </Button>
          </div>
          <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-xs text-foreground font-mono max-h-64 overflow-y-auto">
            {APPS_SCRIPT_CODE}
          </pre>
          <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
            <li>In your Google Sheet, go to <strong>Extensions → Apps Script</strong></li>
            <li>Delete any existing code and paste the code above</li>
            <li>Click <strong>Save</strong> (Ctrl+S)</li>
            <li>Close the Apps Script tab and refresh your Google Sheet</li>
          </ol>
        </div>

        <div className="rounded-xl border border-border bg-muted/50 p-6 space-y-3">
          <h3 className="font-semibold text-foreground">Step 3: Use the Converter</h3>
          <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
            <li>Click <strong>Currency Converter → Setup Sheet</strong> to create headers automatically</li>
            <li>Enter your data starting from row 2 (Date, Currency Code, Amount)</li>
            <li>Click <strong>Currency Converter → Fetch Exchange Rates</strong></li>
            <li>Authorize the script when prompted (first time only)</li>
            <li>Exchange rates will be fetched and EUR amounts calculated automatically!</li>
          </ol>
        </div>

        <div className="rounded-xl border border-primary/20 bg-primary/5 p-6 space-y-3">
          <h3 className="font-semibold text-foreground">Supported Currencies</h3>
          <p className="text-sm text-muted-foreground">
            USD, CAD, GBP, JPY, CHF, AUD, NZD, SEK, NOK, DKK, PLN, CZK, HUF, and more from the Frankfurter API.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
