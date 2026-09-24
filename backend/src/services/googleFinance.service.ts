import puppeteer, { Browser, Page } from "puppeteer";

interface GoogleFinanceData {
  price: number | null;
  peRatio: number | null;
  latestEarnings: string | null;
}

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
  "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

let browserInstance: Browser | null = null;
let browserLaunching: Promise<Browser> | null = null;

const PAGE_TIMEOUT_MS = 8000;
const DATA_WAIT_TIMEOUT_MS = 5000;
const DELAY_MS = 1000;

async function getBrowser(): Promise<Browser> {
  if (browserInstance) {
    return browserInstance;
  }

  if (!browserLaunching) {
    browserLaunching = puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
      ],
    });
  }

  browserInstance = await browserLaunching;
  return browserInstance;
}

export async function closeBrowser(): Promise<void> {
  if (browserInstance) {
    await browserInstance.close();
    browserInstance = null;
    browserLaunching = null;
  }
}

export async function getGoogleFinanceData(
  ticker: string,
  exchange: "NSE" | "BSE",
  companyLabel?: string
): Promise<GoogleFinanceData> {
  const googleExchange = exchange === "NSE" ? "NSE" : "BOM";

  const url = `https://www.google.com/finance/quote/${ticker}:${googleExchange}`;

  let page: Page | null = null;

  try {
    const browser = await getBrowser();

    page = await browser.newPage();

    await page.setUserAgent(USER_AGENT);

    const response = await page.goto(url, {
      waitUntil: "domcontentloaded",
      timeout: PAGE_TIMEOUT_MS,
    });

    if (!response || response.status() >= 400) {
      console.error(
        `[googleFinance] Bad response (${response?.status()}) for ${ticker}:${googleExchange}`
      );

      return {
        price: null,
        peRatio: null,
        latestEarnings: null,
      };
    }

    /*
     * We DO NOT wait for a price in the title.
     *
     * CMP comes from Yahoo Finance.
     *
     * Google is used only for:
     * - P/E ratio
     * - EPS / Latest Earnings
     */

    try {
      await page.waitForFunction(
        () => {
          const text =
            document.body?.innerText?.toLowerCase() || "";

          return (
            text.includes("p/e ratio") ||
            text.includes("eps")
          );
        },
        {
          timeout: DATA_WAIT_TIMEOUT_MS,
        }
      );
    } catch {
      console.error(
        `[googleFinance] P/E or EPS data not found for ${ticker}:${googleExchange}`
      );

      return {
        price: null,
        peRatio: null,
        latestEarnings: null,
      };
    }

    const data = await page.evaluate(() => {
      const title = document.title || "";

      const bodyText =
        document.body?.innerText?.toLowerCase() || "";

      /*
       * Detect Google blocking pages.
       */
      const isBlocked =
        bodyText.includes("unusual traffic") ||
        bodyText.includes("captcha") ||
        bodyText.includes("automated queries") ||
        title.toLowerCase().includes("sorry");

      if (isBlocked) {
        return {
          peRatio: null,
          latestEarnings: null,
          pageTitle: title,
          blocked: true,
        };
      }

      let peRatio: number | null = null;
      let latestEarnings: string | null = null;

      /*
       * Google Finance financial statistics.
       */
      document.querySelectorAll(".SwQK7").forEach((labelEl) => {
        const label = labelEl.textContent?.trim() || "";

        const valueEl = labelEl.nextElementSibling;

        const value =
          valueEl?.textContent?.trim() || "";

        if (label === "P/E ratio" && value) {
          const parsed = parseFloat(
            value.replace(/,/g, "")
          );

          peRatio = Number.isNaN(parsed)
            ? null
            : parsed;
        }

        if (label === "EPS" && value) {
          latestEarnings = value;
        }
      });

      return {
        peRatio,
        latestEarnings,
        pageTitle: title,
        blocked: false,
      };
    });

    if (data.blocked) {
      console.error(
        `[googleFinance] BLOCKED page for ${ticker}:${googleExchange} — title="${data.pageTitle}"`
      );

      return {
        price: null,
        peRatio: null,
        latestEarnings: null,
      };
    }

    /*
     * Verify that Google returned the expected company.
     */
    if (companyLabel) {
      const significantWords = companyLabel
        .toLowerCase()
        .split(/\s+/)
        .filter((word) => word.length > 3);

      const titleLower =
        data.pageTitle.toLowerCase();

      const matchesLabel =
        significantWords.some((word) =>
          titleLower.includes(word)
        );

      if (
        significantWords.length > 0 &&
        !matchesLabel
      ) {
        console.error(
          `[googleFinance] MISMATCH for ${ticker}:${googleExchange} ` +
            `(expected "${companyLabel}") — title="${data.pageTitle}"`
        );

        return {
          price: null,
          peRatio: null,
          latestEarnings: null,
        };
      }
    }

    console.log(
      `[googleFinance] ${ticker}:${googleExchange} -> ` +
        `P/E=${data.peRatio} | EPS=${data.latestEarnings}`
    );

    return {
      
      price: null,
      peRatio: data.peRatio,
      latestEarnings: data.latestEarnings,
    };
  } catch (error) {
    console.error(
      `[googleFinance] Failed for ${ticker}:${googleExchange}`,
      error
    );

    return {
      price: null,
      peRatio: null,
      latestEarnings: null,
    };
  } finally {
    if (page) {
      try {
        await page.close();
      } catch {
        // Ignore page-close errors.
      }
    }
  }
}

export async function getGoogleFinanceBatch(
  stocks: {
    ticker: string;
    exchange: "NSE" | "BSE";
    companyLabel?: string;
  }[]
): Promise<Record<string, GoogleFinanceData>> {
  const results: Record<string, GoogleFinanceData> = {};

  for (const stock of stocks) {
    results[stock.ticker] =
      await getGoogleFinanceData(
        stock.ticker,
        stock.exchange,
        stock.companyLabel
      );

    await new Promise((resolve) =>
      setTimeout(resolve, DELAY_MS)
    );
  }

  return results;
}