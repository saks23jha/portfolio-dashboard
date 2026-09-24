import { PortfolioResponse } from "@/types/portfolio";

// This calls OUR Node.js backend (not Yahoo/Google directly) —
// the backend is the one that talks to Yahoo/Google and does the scraping.
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

export async function fetchPortfolio(): Promise<PortfolioResponse> {
  const res = await fetch(`${BACKEND_URL}/api/portfolio`, {
    cache: "no-store", // always get fresh data, never use Next.js's cached fetch
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch portfolio: ${res.status}`);
  }

  return res.json();
}