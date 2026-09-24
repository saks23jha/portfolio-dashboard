# Portfolio Dashboard

A full-stack portfolio dashboard built with Next.js, React, TypeScript, Tailwind CSS, and Node.js.

The dashboard displays portfolio holdings along with market data such as Current Market Price (CMP), Present Value, Gain/Loss, P/E Ratio, and Latest Earnings.

## Features

- Portfolio holdings displayed in a structured table
- Purchase Price and Quantity tracking
- Automatic Investment calculation
- Portfolio percentage calculation
- CMP fetched from Yahoo Finance
- P/E Ratio and Latest Earnings fetched from Google Finance
- Present Value calculation
- Gain/Loss calculation
- Green/red visual indicators for gains and losses
- Sector-wise grouping
- Sector-level investment, present value, and gain/loss totals
- Automatic portfolio refresh every 15 seconds
- Backend caching
- API failure handling
- Responsive dashboard UI

## Tech Stack

### Frontend

- Next.js 16.3.6
- React 19.2.8
- TypeScript
- Tailwind CSS 4

### Backend

- Node.js
- Express 5.2.1
- TypeScript
- Yahoo Finance 2
- Puppeteer
- Node Cache
- Axios
- Cheerio
- CORS

## Project Structure

```text
portfolio-dashboard/
├── backend/
│   ├── src/
│   │   ├── cache/
│   │   ├── data/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── server.ts
│   │   └── types.ts
│   └── package.json
│
├── frontend/
│   ├── app/
│   ├── components/
│   ├── hooks/
│   ├── lib/
│   ├── public/
│   └── package.json
│
├── README.md
└── TECHNICAL_DOCUMENT.md
Data Flow
Portfolio JSON
      |
      v
Node.js / Express Backend
      |
      +----------------------+
      |                      |
      v                      v
Yahoo Finance          Google Finance
      |                      |
      | CMP                  | P/E Ratio
      |                      | Latest Earnings
      +----------+-----------+
                 |
                 v
        Portfolio Transformation
                 |
                 v
           Cached Response
                 |
                 v
       Next.js Frontend
                 |
                 v
        Portfolio Dashboard
Calculations
Investment
Investment = Purchase Price × Quantity
Portfolio Percentage
Portfolio (%) =
Investment / Total Portfolio Investment × 100
Present Value
Present Value = CMP × Quantity
Gain/Loss
Gain/Loss = Present Value - Investment
Market Data Sources
Yahoo Finance

CMP is retrieved using the yahoo-finance2 package.

Yahoo Finance does not provide a public official API for this use case, so the project uses an unofficial library-based approach.

Google Finance

P/E Ratio and Latest Earnings are retrieved from Google Finance pages using Puppeteer.

This is an unofficial browser-automation/scraping approach.

Because these sources are not guaranteed APIs, the application includes error handling and allows unavailable values to be represented as —.

Refresh Strategy

The frontend automatically requests updated portfolio data every 15 seconds using setInterval.

The backend also uses caching to reduce unnecessary repeated external requests.

Yahoo Finance requests are processed in batches with delays between batches to reduce request pressure.

Google Finance requests are processed sequentially with a delay between requests.

Error Handling

External market-data requests may fail or return unavailable data.

In such cases:

The backend logs the failure.
The affected market-data field is returned as null.
The frontend displays — instead of breaking the entire table.
Backend responses are cached where available.
The frontend displays an error message when the backend cannot be reached.
Getting Started
Prerequisites
Node.js
npm
Backend

Open a terminal:

cd backend
npm install
npm run dev

The backend runs on:

http://localhost:5000

For a production build:

npm run build
npm start
Frontend

Open another terminal:

cd frontend
npm install
npm run dev

The frontend runs on:

http://localhost:3000
Production Build
Frontend
cd frontend
npm run build
npm start
Backend
cd backend
npm run build
npm start
Important Notes

The application depends on external Yahoo Finance and Google Finance data sources. Their availability, page structure, rate limits, and returned data may change.

Therefore, market values may occasionally be unavailable for individual stocks. The dashboard handles these cases without stopping the complete portfolio from being displayed.

Assignment Requirements Covered

The implementation covers:

Portfolio table
Investment calculation
Portfolio percentage
CMP retrieval
Present Value
Gain/Loss
P/E Ratio
Latest Earnings
Sector grouping
Sector totals
Dynamic refresh
Error handling
Caching
Request throttling/batching
Responsive UI