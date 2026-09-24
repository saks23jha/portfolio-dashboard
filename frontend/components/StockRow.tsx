import { StockRow as StockRowType } from "@/types/portfolio";
import { formatCurrency, formatPercent } from "@/lib/format";

interface StockRowProps {
  stock: StockRowType;
}

export default function StockRow({ stock }: StockRowProps) {
  // Determine color based on gain/loss 
  // "Visual Indicators: Green for gains, Red for losses" requirement
  const isGain = stock.gainLoss !== null && stock.gainLoss >= 0;
  const gainLossColor = stock.gainLoss === null
    ? "text-slate-400"
    : isGain
    ? "text-gain"
    : "text-loss";

  return (
    <tr className="border-b border-slate-100 hover:bg-slate-50">
      <td className="px-4 py-2 text-sm font-medium text-slate-900">{stock.particulars}</td>
      <td className="px-4 py-2 text-sm text-slate-600">{formatCurrency(stock.purchasePrice)}</td>
      <td className="px-4 py-2 text-sm text-slate-600">{stock.qty}</td>
      <td className="px-4 py-2 text-sm text-slate-600">{formatCurrency(stock.investment)}</td>
      <td className="px-4 py-2 text-sm text-slate-600">{formatPercent(stock.portfolioPercent)}</td>
      <td className="px-4 py-2 text-sm text-slate-600">{stock.exchangeCode}</td>
      <td className="px-4 py-2 text-sm font-medium text-slate-900">{formatCurrency(stock.cmp)}</td>
      <td className="px-4 py-2 text-sm text-slate-600">{formatCurrency(stock.presentValue)}</td>
      <td className={`px-4 py-2 text-sm font-semibold ${gainLossColor}`}>
        {stock.gainLoss === null ? "—" : formatCurrency(stock.gainLoss)}
      </td>
      <td className="px-4 py-2 text-sm text-slate-600">{stock.peRatio ?? "—"}</td>
      <td className="px-4 py-2 text-sm text-slate-600">{stock.latestEarnings ?? "—"}</td>
    </tr>
  );
}