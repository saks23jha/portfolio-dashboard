import YahooFinance from "yahoo-finance2";

const yahooFinance = new YahooFinance();

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Fetch CMP from Yahoo Finance.
 *
 *
 * Google Finance is NOT used here.
 */
export async function getCMP(
  symbol: string,
  exchange: "NSE" | "BSE" = "NSE"
): Promise<number | null> {
  const suffix = exchange === "NSE" ? ".NS" : ".BO";
  const yahooSymbol = `${symbol}${suffix}`;

  const MAX_ATTEMPTS = 3;

  // --------------------------------------------------
  // 1. Primary source: Yahoo quote()
  // --------------------------------------------------

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const quote = (await yahooFinance.quote(yahooSymbol)) as {
        regularMarketPrice?: number;
      };

      if (
        typeof quote?.regularMarketPrice === "number" &&
        Number.isFinite(quote.regularMarketPrice)
      ) {
        console.log(
          `[yahooFinance] ${yahooSymbol} -> CMP=${quote.regularMarketPrice}`
        );

        return quote.regularMarketPrice;
      }
    } catch (error) {
      console.error(
        `[yahooFinance] Quote attempt ${attempt}/${MAX_ATTEMPTS} failed for ${yahooSymbol}`,
        error
      );
    }

    if (attempt < MAX_ATTEMPTS) {
      await delay(800);
    }
  }

  // --------------------------------------------------
  // 2. Fallback: Yahoo chart()
  // --------------------------------------------------

  console.log(
    `[yahooFinance] quote() failed for ${yahooSymbol}, trying chart() fallback...`
  );

  try {
    const chart = await yahooFinance.chart(yahooSymbol, {
      period1: new Date(Date.now() - 24 * 60 * 60 * 1000),
      interval: "1d",
    });

    const marketPrice = chart?.meta?.regularMarketPrice;

    if (
      typeof marketPrice === "number" &&
      Number.isFinite(marketPrice)
    ) {
      console.log(
        `[yahooFinance] ${yahooSymbol} -> CMP=${marketPrice} (chart fallback)`
      );

      return marketPrice;
    }

    console.error(
      `[yahooFinance] chart() returned no valid CMP for ${yahooSymbol}`
    );
  } catch (error) {
    console.error(
      `[yahooFinance] chart() fallback failed for ${yahooSymbol}`,
      error
    );
  }

  console.error(
    `[yahooFinance] Giving up on ${yahooSymbol} after quote + chart attempts`
  );

  return null;
}

/**
 * Fetch CMP for the complete portfolio.
 *
 * symbol:
 *   Original exchangeCode from portfolio.json.
 *
 * yahooSymbol:
 *   Optional Yahoo Finance ticker.
 *
 * For NSE:
 *   yahooSymbol is not required.
 *
 * For BSE:
 *   yahooSymbol is required because Yahoo Finance
 *   does not use the numeric BSE scrip code.
 */
export async function getCMPBatch(
  stocks: {
    symbol: string;
    yahooSymbol?: string;
    exchange: "NSE" | "BSE";
  }[]
): Promise<Record<string, number | null>> {
  const BATCH_SIZE = 4;
  const DELAY_BETWEEN_BATCHES_MS = 600;

  const resultMap: Record<string, number | null> = {};

  for (let i = 0; i < stocks.length; i += BATCH_SIZE) {
    const batch = stocks.slice(i, i + BATCH_SIZE);

    const batchResults = await Promise.all(
      batch.map(async (stock) => {
        // For NSE:
        //   HDFCBANK -> HDFCBANK.NS
        //
        // For BSE:
        //   532174 + ICICIBANK -> ICICIBANK.BO
        const yahooTicker =
          stock.yahooSymbol ?? stock.symbol;

        return {
          symbol: stock.symbol,
          cmp: await getCMP(
            yahooTicker,
            stock.exchange
          ),
        };
      })
    );

    batchResults.forEach((result) => {
      // IMPORTANT:
      // Keep the original exchangeCode as the key.
      //
      // Example:
      // 532174 -> CMP of ICICIBANK.BO
      resultMap[result.symbol] = result.cmp;
    });

    if (i + BATCH_SIZE < stocks.length) {
      await delay(DELAY_BETWEEN_BATCHES_MS);
    }
  }

  return resultMap;
}