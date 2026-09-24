// Static data we already know from the Excel sheet — doesn't change live
export interface StockInput {
  particulars: string;    // e.g. "HDFC Bank"
  purchasePrice: number;  // e.g. 1490
  qty: number;             // e.g. 50
  exchangeCode: string;    // NSE/BSE symbol e.g. "HDFCBANK"
  sector: string;           // e.g. "Financial Sector"
}

// Live data fetched from Yahoo/Google — this updates every 15s
export interface LiveStockData {
  cmp: number | null;
  peRatio: number | null;
  latestEarnings: string | null;
}

// The full row the table renders — static + live + calculated fields
export interface StockRow extends StockInput, LiveStockData {
  investment: number;
  portfolioPercent: number;
  presentValue: number | null;
  gainLoss: number | null;
  gainLossPercent: number | null;
}

export interface SectorSummary {
  sector: string;
  totalInvestment: number;
  totalPresentValue: number;
  totalGainLoss: number;
}
export interface PortfolioResponse {
  stocks: StockRow[];
  sectorSummaries: SectorSummary[];
}
 