import * as XLSX from 'xlsx';
import { Button } from '@/components/ui/button';
import { Download, FileSpreadsheet, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

const VBA_CODE = `Sub FetchExchangeRates()
    Dim ws As Worksheet
    Dim lastRow As Long
    Dim i As Long
    Dim url As String
    Dim http As Object
    Dim json As String
    Dim rate As Double
    Dim dateStr As String
    Dim currency As String
    
    Set ws = ThisWorkbook.Sheets("Data")
    lastRow = ws.Cells(ws.Rows.Count, "A").End(xlUp).Row
    
    Set http = CreateObject("MSXML2.XMLHTTP")
    
    For i = 2 To lastRow
        dateStr = Format(ws.Cells(i, 1).Value, "yyyy-mm-dd")
        currency = ws.Cells(i, 2).Value
        
        If dateStr <> "" And currency <> "" And currency <> "EUR" Then
            url = "https://api.frankfurter.app/" & dateStr & "?from=" & currency & "&to=EUR"
            
            On Error Resume Next
            http.Open "GET", url, False
            http.Send
            
            If http.Status = 200 Then
                json = http.responseText
                ' Extract rate from JSON response
                rate = ExtractRate(json)
                If rate > 0 Then
                    ws.Cells(i, 4).Value = rate
                End If
            End If
            On Error GoTo 0
        End If
    Next i
    
    MsgBox "Exchange rates updated!", vbInformation
End Sub

Function ExtractRate(json As String) As Double
    Dim pos1 As Long, pos2 As Long
    Dim rateStr As String
    
    pos1 = InStr(json, """EUR"":")
    If pos1 > 0 Then
        pos1 = pos1 + 6
        pos2 = InStr(pos1, json, "}")
        rateStr = Mid(json, pos1, pos2 - pos1)
        ExtractRate = CDbl(rateStr)
    Else
        ExtractRate = 0
    End If
End Function`;

const Index = () => {
  const [copied, setCopied] = useState(false);

  const generateExcelTemplate = () => {
    const workbook = XLSX.utils.book_new();

    // Main data sheet
    const mainData = [
      ['Date', 'Currency Code', 'Amount', 'Exchange Rate (EUR)', 'Converted EUR'],
      ['2024-01-15', 'CAD', 100, '', '=IF(D2="","",C2*D2)'],
      ['2024-01-16', 'USD', 250, '', '=IF(D3="","",C3*D3)'],
      ['2024-01-17', 'GBP', 500, '', '=IF(D4="","",C4*D4)'],
      ['', '', '', '', ''],
      ['', '', '', 'Total EUR:', '=SUM(E2:E4)'],
    ];
    const mainSheet = XLSX.utils.aoa_to_sheet(mainData);
    mainSheet['!cols'] = [
      { wch: 12 },
      { wch: 15 },
      { wch: 12 },
      { wch: 20 },
      { wch: 15 },
    ];

    // Instructions sheet
    const instructionsData = [
      ['Currency to EUR Converter with VBA Macro'],
      [''],
      ['SETUP (one-time):'],
      ['1. Save this file as .xlsm (Macro-Enabled Workbook)'],
      ['2. Press Alt+F11 to open the VBA Editor'],
      ['3. Insert > Module'],
      ['4. Paste the VBA code from the download page'],
      ['5. Close the VBA Editor'],
      [''],
      ['USAGE:'],
      ['1. Enter your data in the "Data" sheet (Date, Currency, Amount)'],
      ['2. Press Alt+F8, select "FetchExchangeRates", click Run'],
      ['3. The macro will fetch rates from the Frankfurter API'],
      ['4. Column E calculates the EUR amount automatically'],
      [''],
      ['SUPPORTED CURRENCIES:'],
      ['USD, CAD, GBP, JPY, CHF, AUD, NZD, SEK, NOK, DKK, and more'],
    ];
    const instructionsSheet = XLSX.utils.aoa_to_sheet(instructionsData);
    instructionsSheet['!cols'] = [{ wch: 60 }];

    XLSX.utils.book_append_sheet(workbook, instructionsSheet, 'Instructions');
    XLSX.utils.book_append_sheet(workbook, mainSheet, 'Data');

    XLSX.writeFile(workbook, 'currency_converter_template.xlsx');
    toast.success('Template downloaded! Follow the setup instructions.');
  };

  const copyVBACode = async () => {
    await navigator.clipboard.writeText(VBA_CODE);
    setCopied(true);
    toast.success('VBA code copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <FileSpreadsheet className="w-16 h-16 mx-auto text-primary" />
          <h1 className="text-3xl font-bold text-foreground">
            Currency to EUR Converter
          </h1>
          <p className="text-muted-foreground">
            Excel template with VBA macro that fetches exchange rates from the Frankfurter API
          </p>
        </div>

        <div className="flex justify-center">
          <Button onClick={generateExcelTemplate} size="lg" className="gap-2">
            <Download className="w-5 h-5" />
            Download Excel Template
          </Button>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">VBA Macro Code</h2>
            <Button variant="outline" size="sm" onClick={copyVBACode} className="gap-2">
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied!' : 'Copy Code'}
            </Button>
          </div>
          <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-xs text-foreground font-mono">
            {VBA_CODE}
          </pre>
        </div>

        <div className="rounded-xl border border-border bg-muted/50 p-6 space-y-3">
          <h3 className="font-semibold text-foreground">Setup Instructions</h3>
          <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
            <li>Download and open the Excel template</li>
            <li>Save as <strong>.xlsm</strong> (Excel Macro-Enabled Workbook)</li>
            <li>Press <strong>Alt+F11</strong> to open VBA Editor</li>
            <li>Go to <strong>Insert → Module</strong></li>
            <li>Paste the VBA code above and close the editor</li>
            <li>Enter your data (Date, Currency, Amount) in the Data sheet</li>
            <li>Press <strong>Alt+F8</strong>, select <strong>FetchExchangeRates</strong>, click Run</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default Index;
