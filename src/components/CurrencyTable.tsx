import { Plus, Trash2, RefreshCw, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CurrencyRow } from '@/types/currency';
import { cn } from '@/lib/utils';

interface CurrencyTableProps {
  rows: CurrencyRow[];
  supportedCurrencies: string[];
  onUpdateRow: (id: string, field: keyof CurrencyRow, value: string) => void;
  onAddRow: () => void;
  onRemoveRow: (id: string) => void;
  onConvertAll: () => void;
}

export const CurrencyTable = ({
  rows,
  supportedCurrencies,
  onUpdateRow,
  onAddRow,
  onRemoveRow,
  onConvertAll,
}: CurrencyTableProps) => {
  const formatEuro = (value: number | null) => {
    if (value === null) return '—';
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
    }).format(value);
  };

  const isAnyLoading = rows.some(row => row.isLoading);

  return (
    <div className="w-full">
      {/* Table Header Actions */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Button
            onClick={onAddRow}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Row
          </Button>
          <Button
            onClick={onConvertAll}
            variant="default"
            size="sm"
            className="gap-2"
            disabled={isAnyLoading}
          >
            {isAnyLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            Convert All
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Exchange rates from Frankfurter API
        </p>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="table-header-cell w-12">#</th>
                <th className="table-header-cell">Date</th>
                <th className="table-header-cell">Currency</th>
                <th className="table-header-cell">Amount</th>
                <th className="table-header-cell">
                  <span className="inline-flex items-center gap-1.5">
                    EUR Value
                    <span className="text-euro">€</span>
                  </span>
                </th>
                <th className="table-header-cell w-12"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr
                  key={row.id}
                  className={cn(
                    "table-row-interactive animate-fade-in",
                    row.error && "bg-destructive/5"
                  )}
                >
                  <td className="table-body-cell text-center">
                    <span className="text-xs text-muted-foreground font-mono px-3 py-2.5 block">
                      {index + 1}
                    </span>
                  </td>
                  <td className="table-body-cell">
                    <Input
                      type="date"
                      value={row.date}
                      onChange={(e) => onUpdateRow(row.id, 'date', e.target.value)}
                      className="table-cell-input border-0 rounded-none h-auto focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                  </td>
                  <td className="table-body-cell">
                    <Select
                      value={row.currencyCode}
                      onValueChange={(value) => onUpdateRow(row.id, 'currencyCode', value)}
                    >
                      <SelectTrigger className="border-0 rounded-none h-auto py-2.5 px-3 font-mono text-sm focus:ring-0 focus:ring-offset-0 shadow-none">
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                      <SelectContent>
                        {supportedCurrencies.map((currency) => (
                          <SelectItem key={currency} value={currency} className="font-mono">
                            {currency}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="table-body-cell">
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={row.amount}
                      onChange={(e) => onUpdateRow(row.id, 'amount', e.target.value)}
                      placeholder="0.00"
                      className="table-cell-input border-0 rounded-none h-auto focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                  </td>
                  <td className="table-body-cell">
                    <div className="px-3 py-2.5 flex items-center gap-2">
                      {row.isLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                      ) : row.error ? (
                        <span className="text-xs text-destructive">{row.error}</span>
                      ) : (
                        <span className={cn(
                          "font-mono text-sm",
                          row.convertedAmount !== null && "euro-value"
                        )}>
                          {formatEuro(row.convertedAmount)}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="table-body-cell">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onRemoveRow(row.id)}
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      disabled={rows.length <= 1}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary */}
      {rows.some(row => row.convertedAmount !== null) && (
        <div className="mt-4 p-4 bg-accent/50 rounded-lg border border-accent">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-accent-foreground">Total EUR</span>
            <span className="text-xl font-bold euro-value">
              {formatEuro(
                rows.reduce((sum, row) => sum + (row.convertedAmount || 0), 0)
              )}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
