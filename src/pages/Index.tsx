import * as XLSX from 'xlsx';
import { Button } from '@/components/ui/button';
import { Download, FileSpreadsheet } from 'lucide-react';

const Index = () => {
  const generateExcelTemplate = () => {
    const workbook = XLSX.utils.book_new();

    // Main data sheet
    const mainData = [
      ['Date', 'Currency Code', 'Amount', 'Exchange Rate to EUR', 'Converted EUR'],
      ['2024-01-15', 'CAD', 100, '', '=IF(D2="","",C2/D2)'],
      ['2024-01-16', 'USD', 250, '', '=IF(D3="","",C3/D3)'],
      ['2024-01-17', 'GBP', 500, '', '=IF(D4="","",C4/D4)'],
      ['', '', '', '', ''],
      ['', '', '', 'Total EUR:', '=SUM(E2:E4)'],
    ];
    const mainSheet = XLSX.utils.aoa_to_sheet(mainData);
    
    // Set column widths
    mainSheet['!cols'] = [
      { wch: 12 }, // Date
      { wch: 15 }, // Currency Code
      { wch: 12 }, // Amount
      { wch: 20 }, // Exchange Rate
      { wch: 15 }, // Converted EUR
    ];

    // Exchange rates reference sheet
    const ratesData = [
      ['Currency', 'Rate to EUR (1 EUR = X Currency)', 'Rate from Currency to EUR'],
      ['USD', 1.08, '=1/B2'],
      ['CAD', 1.47, '=1/B3'],
      ['GBP', 0.86, '=1/B4'],
      ['JPY', 162.5, '=1/B5'],
      ['CHF', 0.94, '=1/B6'],
      ['AUD', 1.65, '=1/B7'],
      ['', '', ''],
      ['Note: Update rates in column B with current values.', '', ''],
      ['Column C shows the rate to divide your amount by.', '', ''],
    ];
    const ratesSheet = XLSX.utils.aoa_to_sheet(ratesData);
    ratesSheet['!cols'] = [
      { wch: 15 },
      { wch: 30 },
      { wch: 25 },
    ];

    // Instructions sheet
    const instructionsData = [
      ['Currency to EUR Converter - Instructions'],
      [''],
      ['1. Go to the "Data" sheet'],
      ['2. Enter your date in column A'],
      ['3. Enter the currency code in column B (e.g., CAD, USD, GBP)'],
      ['4. Enter the amount in column C'],
      ['5. Enter the exchange rate in column D'],
      ['   - Look up the rate from the "Exchange Rates" sheet (Column C)'],
      ['   - Or use VLOOKUP: =VLOOKUP(B2,\'Exchange Rates\'!A:C,3,FALSE)'],
      ['6. Column E will automatically calculate the EUR amount'],
      [''],
      ['Tip: Update the exchange rates in the "Exchange Rates" sheet'],
      ['with current values from xe.com or your bank.'],
    ];
    const instructionsSheet = XLSX.utils.aoa_to_sheet(instructionsData);
    instructionsSheet['!cols'] = [{ wch: 60 }];

    // Add sheets to workbook
    XLSX.utils.book_append_sheet(workbook, instructionsSheet, 'Instructions');
    XLSX.utils.book_append_sheet(workbook, mainSheet, 'Data');
    XLSX.utils.book_append_sheet(workbook, ratesSheet, 'Exchange Rates');

    // Generate and download file
    XLSX.writeFile(workbook, 'currency_converter_template.xlsx');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-8">
      <div className="max-w-xl w-full text-center space-y-8">
        <div className="space-y-4">
          <FileSpreadsheet className="w-20 h-20 mx-auto text-primary" />
          <h1 className="text-3xl font-bold text-foreground">
            Currency to EUR Converter
          </h1>
          <p className="text-muted-foreground">
            Download an Excel template with formulas to convert any currency to EUR.
            Simply enter your dates, currency codes, amounts, and exchange rates.
          </p>
        </div>

        <Button 
          onClick={generateExcelTemplate} 
          size="lg"
          className="gap-2"
        >
          <Download className="w-5 h-5" />
          Download Excel Template
        </Button>

        <div className="text-sm text-muted-foreground space-y-2 pt-4 border-t border-border">
          <p className="font-medium">The template includes:</p>
          <ul className="list-disc list-inside text-left space-y-1">
            <li>Data sheet with conversion formulas</li>
            <li>Exchange rates reference sheet</li>
            <li>Step-by-step instructions</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Index;
