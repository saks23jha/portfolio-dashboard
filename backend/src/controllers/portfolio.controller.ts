import { Request, Response } from "express";
import portfolioData from "../data/portfolio.json";
import { getCMPBatch } from "../services/yahooFinance.service";
import { getGoogleFinanceBatch } from "../services/googleFinance.service";
import { StockInput, StockRow } from "../types";
import portfolioCache from "../cache/cache";

const CACHE_KEY = "portfolio_data";

interface SectorSummary {
  sector: string;
  totalInvestment: number;
  totalPresentValue: number;
  totalGainLoss: number;
}

interface PortfolioResponse {
  stocks: StockRow[];
  sectorSummaries: SectorSummary[];
}

// Stores the latest successfully built portfolio even after
// the NodeCache TTL expires.
let latestPortfolio: PortfolioResponse | null = null;

// Prevents multiple Yahoo/Google scrapes from running together.
let inFlightRequest: Promise<PortfolioResponse> | null = null;

async function buildPortfolioResponse(): Promise<PortfolioResponse> {
  const stocks = portfolioData as StockInput[];

  // ---------------------------------------------------------
  // 1. Fetch live CMP from Yahoo Finance
  // ---------------------------------------------------------

  const cmpMap = await getCMPBatch(
    stocks.map((s) => ({
      symbol: s.exchangeCode,
      yahooSymbol: s.yahooSymbol,
      exchange: s.exchange,
    }))
  );

  // ---------------------------------------------------------
  // 2. Fetch P/E Ratio and Latest Earnings from Google Finance
  // ---------------------------------------------------------

  const googleMap = await getGoogleFinanceBatch(
    stocks.map((s) => ({
      ticker: s.exchangeCode,
      exchange: s.exchange,
      companyLabel: s.particulars,
    }))
  );

  // ---------------------------------------------------------
  // 3. Calculate total investment
  // ---------------------------------------------------------

  const totalInvestment = stocks.reduce(
    (sum, s) => sum + s.purchasePrice * s.qty,
    0
  );

  // ---------------------------------------------------------
  // 4. Build stock rows
  // ---------------------------------------------------------

  const result: StockRow[] = stocks.map((stock) => {
    const investment = stock.purchasePrice * stock.qty;

    const google = googleMap[stock.exchangeCode] ?? {
      price: null,
      peRatio: null,
      latestEarnings: null,
    };

    // IMPORTANT:
    // Yahoo Finance is the ONLY source for CMP.
    // Google Finance price is NOT used here.

    const cmp = cmpMap[stock.exchangeCode] ?? null;

    // Present Value = CMP × Quantity
    const presentValue =
      cmp !== null ? cmp * stock.qty : null;

    // Gain/Loss = Present Value - Investment
    const gainLoss =
      presentValue !== null
        ? presentValue - investment
        : null;

    const gainLossPercent =
      gainLoss !== null
        ? (gainLoss / investment) * 100
        : null;

    return {
      ...stock,

      investment,

      portfolioPercent:
        (investment / totalInvestment) * 100,

      // Yahoo Finance
      cmp,

      presentValue,

      gainLoss,

      gainLossPercent,

      // Google Finance
      peRatio: google.peRatio,
      latestEarnings: google.latestEarnings,
    };
  });

  // ---------------------------------------------------------
  // 5. Sector summaries
  // ---------------------------------------------------------

  const sectorMap = new Map<string, SectorSummary>();

  for (const row of result) {
    const existing = sectorMap.get(row.sector) ?? {
      sector: row.sector,
      totalInvestment: 0,
      totalPresentValue: 0,
      totalGainLoss: 0,
    };

    existing.totalInvestment += row.investment;

    if (row.presentValue !== null) {
      existing.totalPresentValue += row.presentValue;
    }

    if (row.gainLoss !== null) {
      existing.totalGainLoss += row.gainLoss;
    }

    sectorMap.set(row.sector, existing);
  }

  return {
    stocks: result,
    sectorSummaries: Array.from(sectorMap.values()),
  };
}

/**
 * Starts a fresh scrape in the background.
 *
 * If another scrape is already running, we do nothing.
 */
function refreshInBackground() {
  if (inFlightRequest) {
    return;
  }

  console.log("[portfolio] Starting background refresh...");

  inFlightRequest = buildPortfolioResponse();

  inFlightRequest
    .then((result) => {
      latestPortfolio = result;

      portfolioCache.set(CACHE_KEY, result);

      console.log("[portfolio] Background refresh completed");
    })
    .catch((error) => {
      console.error(
        "[portfolio] Background refresh failed:",
        error
      );
    })
    .finally(() => {
      inFlightRequest = null;
    });
}

export async function getPortfolio(
  req: Request,
  res: Response
) {
  try {
    // ---------------------------------------------------------
    // FIRST: return the latest available data immediately
    // ---------------------------------------------------------

    const cached =
      portfolioCache.get<PortfolioResponse>(CACHE_KEY);

    if (cached) {
      latestPortfolio = cached;
    }

    if (latestPortfolio) {
      // Send current data immediately.
      res.json(latestPortfolio);

      // Then refresh in the background.
      refreshInBackground();

      return;
    }

    // ---------------------------------------------------------
    // FIRST EVER REQUEST
    // No data exists yet, so we must wait for initial scrape.
    // ---------------------------------------------------------

    if (!inFlightRequest) {
      console.log("[portfolio] Starting initial fetch...");

      inFlightRequest = buildPortfolioResponse();
    }

    try {
      const result = await inFlightRequest;

      latestPortfolio = result;

      portfolioCache.set(CACHE_KEY, result);

      res.json(result);
    } finally {
      inFlightRequest = null;
    }
  } catch (error) {
    console.error(
      "[portfolio.controller] Unexpected error:",
      error
    );

    // If we already have old data, return it instead of
    // failing the entire dashboard.
    if (latestPortfolio) {
      return res.json(latestPortfolio);
    }

    res.status(500).json({
      error: "Failed to fetch portfolio data",
    });
  }
}