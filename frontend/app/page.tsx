"use client";

import { usePortfolioData } from "@/hooks/usePortfolioData";
import PortfolioTable from "@/components/PortfolioTable";
import ErrorBanner from "@/components/ErrorBanner";

export default function DashboardPage() {
  const { data, sectorSummaries, loading, error } = usePortfolioData();

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Portfolio Dashboard</h1>
        <p className="text-slate-500 mt-1">
          Live holdings, sector-wise summary, and real-time gain/loss tracking
        </p>
      </header>

      {error && <ErrorBanner message={error} />}

      {loading ? (
        <div className="rounded-lg border border-slate-200 bg-white p-6 text-slate-400">
          Loading portfolio...
        </div>
      ) : (
        <PortfolioTable data={data} sectorSummaries={sectorSummaries} />
      )}
    </main>
  );
}