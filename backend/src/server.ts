import express from "express";
import cors from "cors";
import portfolioRoutes from "./routes/portfolio.routes";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors()); // allow frontend (localhost:3000) to call this backend
app.use(express.json());

app.use("/api", portfolioRoutes); // so the final route becomes /api/portfolio

app.get("/", (req, res) => {
  res.send("Portfolio Dashboard Backend is running");
});

app.listen(PORT, () => {
  console.log(`✅ Backend running at http://localhost:${PORT}`);
});