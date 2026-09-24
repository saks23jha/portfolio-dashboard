# Technical Document

## 1. Project Overview

The Portfolio Dashboard is a full-stack application that displays stock portfolio information along with market data.

The application retrieves:

- Current Market Price (CMP) from Yahoo Finance
- P/E Ratio from Google Finance
- Latest Earnings from Google Finance

The retrieved data is combined with the locally maintained portfolio data and transformed into the structure required by the dashboard.

## 2. Architecture

The application follows a frontend-backend architecture.

```text
                Portfolio JSON
                     |
                     v
              Express Backend
                     |
          +----------+----------+
          |                     |
          v                     v
    Yahoo Finance          Google Finance
       CMP                 P/E / Earnings
          |                     |
          +----------+----------+
                     |
                     v
              Data Transformation
                     |
                     v
                   Cache
                     |
                     v
              Next.js Frontend
                     |
                     v
             Portfolio Dashboard
3. Frontend

The frontend is implemented using:

Next.js
React
TypeScript
Tailwind CSS

The main dashboard consumes the backend portfolio endpoint and displays the resulting stock and sector information.

A custom portfolio data hook is responsible for loading the portfolio and periodically requesting fresh data.

The frontend refresh interval is set to 15 seconds using setInterval, as required by the assignment.

4. Backend

The backend uses:

Node.js
Express
TypeScript

The backend is responsible for:

Reading portfolio information.
Fetching CMP data.
Fetching P/E Ratio and Latest Earnings.
Combining external data with portfolio data.
Calculating investment and portfolio percentage.
Calculating Present Value.
Calculating Gain/Loss.
Creating sector-wise summaries.
Caching the resulting portfolio response.
Returning structured JSON to the frontend.
5. Yahoo Finance Integration

Yahoo Finance is used as the source for Current Market Price.

The project uses the yahoo-finance2 package.

The implementation uses:

Quote requests
Retry attempts
Chart data as a fallback when quote retrieval fails
Batched requests
Delays between batches

This approach was selected because Yahoo Finance does not expose a public official API suitable for this assignment.

6. Google Finance Integration

Google Finance is used for:

P/E Ratio
Latest Earnings / EPS

The implementation uses Puppeteer to load Google Finance pages and extract the required fields from the rendered page.

The scraper:

Opens the relevant Google Finance page.
Waits for financial data to appear.
Reads P/E Ratio and EPS.
Validates the page where applicable.
Returns null when the required information cannot be obtained.

Because this relies on an unofficial browser/scraping approach, the implementation includes failure handling.

7. Rate Limiting and Request Control

External financial sources can restrict or throttle automated requests.

To reduce unnecessary request pressure:

Yahoo Finance

Requests are processed in batches rather than sending all requests simultaneously.

A delay is introduced between batches.

Individual Yahoo requests also have retry handling.

Google Finance

Google Finance requests are processed sequentially with a delay between requests.

This reduces the number of simultaneous browser requests.

8. Caching

The backend uses node-cache.

Portfolio responses are cached to avoid unnecessarily rebuilding the complete portfolio for every request.

The current cache TTL is 15 seconds.

The controller also keeps the latest successfully generated portfolio response available so that previously retrieved data can continue to be returned while a background refresh is running.

9. Data Transformation

The backend converts the original portfolio records and external market data into the dashboard's required structure.

For every stock:

Investment = Purchase Price × Quantity

Portfolio (%) =
Investment / Total Investment × 100

Present Value = CMP × Quantity

Gain/Loss = Present Value - Investment

The backend also creates sector-level aggregates:

Total Investment
Total Present Value
Total Gain/Loss
10. Error Handling

External APIs/data sources may fail or return incomplete information.

The implementation handles these cases by:

Retrying Yahoo Finance quote requests.
Using a Yahoo chart fallback.
Returning null for unavailable market data.
Logging external request failures.
Avoiding application crashes when an individual stock cannot be retrieved.
Displaying — in the UI for unavailable values.
Displaying a frontend error message when the backend cannot be reached.

This allows the remaining portfolio data to remain visible even if one external data source fails for a particular stock.

11. Data Validation

Google Finance results are validated against the expected company information where applicable.

If the returned Google Finance page does not match the expected company, the data is discarded instead of displaying potentially incorrect financial information.

This prevents unrelated company data from being displayed for a stock.

12. Dynamic Updates

The assignment requires live updates of:

CMP
Present Value
Gain/Loss

The frontend uses:

setInterval(..., 15000)

to request updated portfolio data approximately every 15 seconds.

The interval is cleared when the component is unmounted to avoid leaving unnecessary timers running.

13. Responsive UI

The dashboard is implemented using Tailwind CSS and was tested at desktop and mobile viewport sizes.

The portfolio table supports viewing the complete set of columns while maintaining usability on smaller screens.

14. Security Considerations

No external financial API credentials are exposed in the frontend.

The frontend communicates with the backend through the configured backend URL.

External financial data retrieval is handled by the server rather than directly exposing scraping logic to the browser.

15. Key Challenges and Solutions
Challenge 1: No Official Yahoo Finance API

Problem: The assignment requires CMP from Yahoo Finance, but there is no public official API for this use case.

Solution: yahoo-finance2 is used as an unofficial library-based integration, with retries and a chart fallback.

Challenge 2: Google Finance Data Extraction

Problem: P/E Ratio and Latest Earnings need to be obtained from Google Finance.

Solution: Puppeteer is used to load the Google Finance page and extract the required rendered values.

Challenge 3: External Request Limits

Problem: Sending many requests simultaneously can cause failures or throttling.

Solution: Yahoo requests are batched, while Google Finance requests are processed sequentially with delays.

Challenge 4: Incomplete External Data

Problem: A market-data source may fail for an individual stock.

Solution: The backend returns null for unavailable values and the frontend displays — instead of failing the complete dashboard.

Challenge 5: Repeated Data Requests

Problem: The frontend periodically requests updated data, which can cause repeated external API requests.

Solution: Backend caching and controlled refresh logic are used to reduce unnecessary external requests.

Challenge 6: Different Stock Identifiers

Problem: Stock identifiers from different sources do not always use the same symbol or code.

Solution: Separate exchange codes and Yahoo-specific symbols are maintained where required. Google Finance page information is also validated before accepting financial metadata.

16. Limitations

The application depends on unofficial Yahoo Finance and Google Finance integrations.

Consequently:

External endpoints or page structures can change.
Some individual stock values may temporarily be unavailable.
External services may apply rate limits.
Scraped Google Finance values depend on the current page structure.

The application is designed to handle these cases gracefully rather than assuming that external data will always be available.

17. Conclusion

The application implements the requested portfolio dashboard using a Next.js frontend and Node.js backend.

It combines locally maintained portfolio information with market data from Yahoo Finance and Google Finance, performs the required calculations, provides sector-wise summaries, handles external data failures, caches results, and refreshes portfolio information periodically.