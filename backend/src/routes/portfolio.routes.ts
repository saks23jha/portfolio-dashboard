
import { Router } from "express";
import { getPortfolio } from "../controllers/portfolio.controller";

const router = Router();

// Final route becomes /api/portfolio (the "/api" prefix is added in server.ts)
router.get("/portfolio", getPortfolio);

export default router;