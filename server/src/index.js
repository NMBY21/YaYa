
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import { yayaRequest } from "./yayaClient.js";
import { normalizeList } from "./normalize.js";
import mock from "./mock.json" assert { type: "json" };

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:5173";
const USE_MOCK = String(process.env.USE_MOCK || "false").toLowerCase() === "true";

app.use(express.json({ limit: "1mb" }));
app.use(helmet());
app.use(
  cors({
    origin: CORS_ORIGIN.split(",").map(s => s.trim()),
    credentials: false,
  })
);
app.use(morgan("dev"));

const limiter = rateLimit({ windowMs: 60_000, max: 120 });
app.use("/api/", limiter);

app.get("/api/health", (_req, res) => res.json({ ok: true, time: new Date().toISOString() }));

// Mock-only endpoint (always available)
app.get("/api/transactions/mock", (req, res) => {
  const p = Number.parseInt(req.query.p ?? "1", 10) || 1;
  res.json({ page: p, items: mock.items });
});

app.get("/api/transactions", async (req, res) => {
  try {
    const p = Number.parseInt(req.query.p ?? "1", 10) || 1;

    if (USE_MOCK) {
      return res.json({ page: p, items: mock.items });
    }

    const data = await yayaRequest({
      method: "GET",
      endpointPath: "/api/en/transaction/find-by-user",
      query: { p },
    });

    const list = normalizeList(data);
    res.json({ page: p, items: list, raw: data });
  } catch (err) {
    res.status(err.status || 502).json({ error: "UpstreamError", status: err.status || 502, details: err.data || String(err) });
  }
});

app.post("/api/transactions/search", async (req, res) => {
  try {
    const p = Number.parseInt(req.query.p ?? "1", 10) || 1;
    const { query } = req.body || {};
    if (!query || String(query).trim().length === 0) {
      return res.status(400).json({ error: "BadRequest", details: "query is required" });
    }

    if (USE_MOCK) {
      const q = String(query).toLowerCase();
      const filtered = mock.items.filter(tx =>
        (tx.id || "").toLowerCase().includes(q) ||
        (tx.sender || "").toLowerCase().includes(q) ||
        (tx.receiver || "").toLowerCase().includes(q) ||
        (tx.cause || "").toLowerCase().includes(q)
      );
      return res.json({ page: p, items: filtered });
    }

    const data = await yayaRequest({
      method: "POST",
      endpointPath: "/api/en/transaction/search",
      query: { p },
      body: { query: String(query) },
    });

    const list = normalizeList(data);
    res.json({ page: p, items: list, raw: data });
  } catch (err) {
    res.status(err.status || 502).json({ error: "UpstreamError", status: err.status || 502, details: err.data || String(err) });
  }
});

app.listen(PORT, () => console.log(`Server listening on http://localhost:${PORT}`));
