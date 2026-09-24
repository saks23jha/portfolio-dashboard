"use client";

import { StockRow as StockRowType, SectorSummary } from "@/types/portfolio";
import SectorGroup from "./SectorGroup";

interface PortfolioTableProps {
  data: StockRowType[];
  sectorSummaries: SectorSummary[];
}

const COLUMN_HEADERS = [
  "Particulars", "Purchase Price", "Qty", "Investment", "Portfolio (%)",
  "NSE/BSE", "CMP", "Present Value", "Gain/Loss", "P/E Ratio", "Latest Earnings",
];

// Groups the flat stock list into { sectorName: [stocks...] } — still
// needed here to know which stocks render under which sector header,
// even though the totals themselves now come from the backend.
function groupBySector(stocks: StockRowType[]): Record<string, StockRowType[]> {
  return stocks.reduce((groups, stock) => {
    if (!groups[stock.sector]) groups[stock.sector] = [];
    groups[stock.sector].push(stock);
    return groups;
  }, {} as Record<string, StockRowType[]>);
}

const EMPTY_SUMMARY = (sector: string): SectorSummary => ({
  sector,
  totalInvestment: 0,
  totalPresentValue: 0,
  totalGainLoss: 0,
});

export default function PortfolioTable({ data, sectorSummaries }: PortfolioTableProps) {
  const grouped = groupBySector(data);

  // Sector totals now come from the backend (which correctly excludes
  // stocks with a failed/null scrape from the sums, instead of treating
  // them as zero) — look them up by sector name instead of recomputing.
  const summaryMap = new Map(sectorSummaries.map((s) => [s.sector, s]));

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-slate-800">
            {COLUMN_HEADERS.map((header) => (
              <th key={header} className="px-4 py-3 text-left text-xs font-semibold uppercase text-white">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Object.entries(grouped).map(([sector, stocks]) => (
            <SectorGroup
              key={sector}
              sector={sector}
              stocks={stocks}
              summary={summaryMap.get(sector) ?? EMPTY_SUMMARY(sector)}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}