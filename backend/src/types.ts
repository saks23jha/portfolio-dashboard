export interface StockInput {
  particulars: string;
  purchasePrice: number;
  qty: number;
  exchangeCode: string;
  yahooSymbol?: string;
  exchange: "NSE" | "BSE";
  sector: string;
}

export interface LiveStockData {
  cmp: number | null;
  peRatio: number | null;
  latestEarnings: string | null;
}

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