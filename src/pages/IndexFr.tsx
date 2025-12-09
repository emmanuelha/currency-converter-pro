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

const IndexFr = () => {
  const [copied, setCopied] = useState(false);

  const copyAppsScriptCode = async () => {
    await navigator.clipboard.writeText(APPS_SCRIPT_CODE);
    setCopied(true);
    toast.success('Code Apps Script copié dans le presse-papiers !');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="flex justify-end">
          <Link to="/" className="text-sm text-muted-foreground hover:text-primary">
            English
          </Link>
        </div>

        <div className="text-center space-y-4">
          <FileSpreadsheet className="w-16 h-16 mx-auto text-primary" />
          <h1 className="text-3xl font-bold text-foreground">
            Convertisseur de Devises vers EUR
          </h1>
          <p className="text-muted-foreground">
            Pourquoi ce convertisseur ?
            <br /><b>Savez vous comment votre courtier gère les conversions de devises pour chaque transactions ?</b>
            <br /><b>Avez vous des comptes qui ne sont pas en devises de base EUR ?</b>
            
            <br /><br />Si vous avez plusieurs comptes en devises différentes, ce modèle vous aidera à convertir facilement les montants en EUR en utilisant les taux de change historiques.
            <br /><br />Pourquoi auriez vous des comptes qui ne sont pas en devises de base EUR vous me direz ?
            <br />Très simple : chez certain courtiers quand vous possedez du cash en plusieurs monnaies et que vous vendez des actions en dollar par exemple, le courtier va effectuer un ensemble de conversions dans différentes monnaies et pas seulement faire une vente en dollar. Vous ne maitriserez en aucun cas ces conversions de monnaies.
            <br />Pour palier à cela il est judicieux d'avoir des comptes en différentes devises.
            <br />Par contre le revers de la médaille est que vous devez gérer les conversions de devises vous même pour savoir combien vous avez réellement en EUR. 
            <br />Ce convertisseur est un simple, il utilise Google Sheet car nous avons quasiment tous un compte Google.
            <br />Par contre nous n'avons pas tous Excel (qui est payant) et certains sont sur mac ou Linux. 
            <br />Ce convertisseur utilise un modèle Google Sheets avec Apps Script qui récupère les taux de change de l'API Frankfurter.
          </p>
        </div>

        <div className="rounded-xl border border-border bg-muted/50 p-6 space-y-3">
          <h3 className="font-semibold text-foreground">Étape 1 : Créez votre Google Sheet</h3>
          <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
            <li>Allez sur <a href="https://sheets.google.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Google Sheets</a> et créez une nouvelle feuille de calcul</li>
            <li>Ajoutez le script Apps ci-dessous (Étape 2), puis utilisez <strong>Currency Converter → Setup Sheet</strong> pour créer automatiquement les en-têtes</li>
          </ol>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-foreground">Étape 2 : Ajoutez le Apps Script</h3>
            <Button variant="outline" size="sm" onClick={copyAppsScriptCode} className="gap-2">
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copié !' : 'Copier le code'}
            </Button>
          </div>
          <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-xs text-foreground font-mono max-h-64 overflow-y-auto">
            {APPS_SCRIPT_CODE}
          </pre>
          <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
            <li>Dans votre Google Sheet, allez dans <strong>Extensions → Apps Script</strong></li>
            <li>Supprimez tout code existant et collez le code ci-dessus</li>
            <li>Cliquez sur <strong>Enregistrer</strong> (Ctrl+S)</li>
            <li>Fermez l'onglet Apps Script et actualisez votre Google Sheet</li>
          </ol>
        </div>

        <div className="rounded-xl border border-border bg-muted/50 p-6 space-y-3">
          <h3 className="font-semibold text-foreground">Étape 3 : Utilisez le Convertisseur</h3>
          <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
            <li>Cliquez sur <strong>Currency Converter → Setup Sheet</strong> pour créer les en-têtes automatiquement</li>
            <li>Entrez vos données à partir de la ligne 2 (Date, Code Devise, Montant)</li>
            <li>Cliquez sur <strong>Currency Converter → Fetch Exchange Rates</strong></li>
            <li>Autorisez le script lorsque demandé (première fois uniquement)</li>
            <li>Les taux de change seront récupérés et les montants en EUR calculés automatiquement !</li>
          </ol>
        </div>

        <div className="rounded-xl border border-primary/20 bg-primary/5 p-6 space-y-3">
          <h3 className="font-semibold text-foreground">Devises Supportées</h3>
          <p className="text-sm text-muted-foreground">
            USD, CAD, GBP, JPY, CHF, AUD, NZD, SEK, NOK, DKK, PLN, CZK, HUF, et plus de l'API Frankfurter.
          </p>
        </div>
      </div>
    </div>
  );
};

export default IndexFr;
