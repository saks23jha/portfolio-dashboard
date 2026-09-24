"use client";

import { useState, useEffect, useCallback } from "react";
import { StockRow, SectorSummary } from "@/types/portfolio";
import { fetchPortfolio } from "@/lib/api";

const REFRESH_INTERVAL_MS = 15000; // 15 seconds, as required by the PDF
// NOTE: the backend serves this from cache (TTL ~90s) unless a real
// scrape is due, so most of these polls are cheap and fast — they don't
// trigger a fresh Yahoo/Google scrape every 15s.

export function usePortfolioData() {
  const [data, setData] = useState<StockRow[]>([]);
  const [sectorSummaries, setSectorSummaries] = useState<SectorSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  
  const loadData = useCallback(async () => {
  try {
    console.log("[Frontend] Fetching portfolio:", new Date().toLocaleTimeString());

    const portfolio = await fetchPortfolio();

    const hdfc = portfolio.stocks.find(
      (stock) => stock.exchangeCode === "HDFCBANK"
    );

    console.log("[Frontend] HDFCBANK CMP:", hdfc?.cmp);
    console.log("[Frontend] HDFCBANK Present Value:", hdfc?.presentValue);
    console.log("[Frontend] HDFCBANK Gain/Loss:", hdfc?.gainLoss);

    setData(portfolio.stocks);
    setSectorSummaries(portfolio.sectorSummaries);
    setError(null);
  } catch (err) {
    setError(err instanceof Error ? err.message : "Failed to load portfolio");
  } finally {
    setLoading(false);
  }
}, []);

  useEffect(() => {
    loadData(); // fetch immediately on mount

    // then keep refetching every 15 seconds
    const intervalId = setInterval(loadData, REFRESH_INTERVAL_MS);

    // cleanup: stop the interval when the component unmounts —
    // otherwise it keeps running in the background = memory leak
    return () => clearInterval(intervalId);
  }, [loadData]);

  return { data, sectorSummaries, loading, error };
}