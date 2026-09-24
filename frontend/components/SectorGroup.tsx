import { StockRow as StockRowType, SectorSummary } from "@/types/portfolio";
import { formatCurrency } from "@/lib/format";
import StockRow from "./StockRow";

interface SectorGroupProps {
  sector: string;
  stocks: StockRowType[];
  summary: SectorSummary;
}

export default function SectorGroup({ sector, stocks, summary }: SectorGroupProps) {
  const isGain = summary.totalGainLoss >= 0;

  return (
    <>
      {/* Sector header row */}
      <tr className="bg-slate-100">
        <td colSpan={11} className="px-4 py-2 text-sm font-bold text-slate-800">
          {sector}
        </td>
      </tr>

      {/* All stocks belonging to this sector */}
      {stocks.map((stock) => (
        <StockRow key={stock.particulars} stock={stock} />
      ))}

      {/* Sector subtotal row */}
      <tr className="bg-slate-50 border-b-2 border-slate-200">
        <td className="px-4 py-2 text-sm font-semibold text-slate-700" colSpan={3}>
          {sector} Total
        </td>
        <td className="px-4 py-2 text-sm font-semibold text-slate-700">
          {formatCurrency(summary.totalInvestment)}
        </td>
        <td colSpan={3}></td>
        <td className="px-4 py-2 text-sm font-semibold text-slate-700">
          {formatCurrency(summary.totalPresentValue)}
        </td>
        <td className={`px-4 py-2 text-sm font-bold ${isGain ? "text-gain" : "text-loss"}`}>
          {formatCurrency(summary.totalGainLoss)}
        </td>
        <td colSpan={2}></td>
      </tr>
    </>
  );
}