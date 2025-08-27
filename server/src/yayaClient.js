// src/yayaClient.js
import crypto from "node:crypto";
import axios from "axios";
import { URL } from "node:url";

const BASE_URL = process.env.YAYA_BASE_URL || "https://sandbox.yayawallet.com";

// Extract HMAC secret from API_SECRET (JWT or plain string)
function getSecret() {
  if (!process.env.API_SECRET) throw new Error("API_SECRET required");
  try {
    const parts = process.env.API_SECRET.split(".");
    if (parts.length === 3) {
      const payload = JSON.parse(
        Buffer.from(parts[1], "base64url").toString("utf8")
      );
      if (payload.secret) return payload.secret;
    }
  } catch (e) {
    console.error("Failed to parse API_SECRET payload:", e.message);
  }
  return process.env.API_SECRET;
}

// Build YAYA auth headers
export function buildAuthHeaders({
  method,
  endpointPathWithQuery,
  bodyString,
}) {
  const timestamp = Date.now().toString(); // milliseconds
  const prehash =
    timestamp +
    method.toUpperCase() +
    endpointPathWithQuery +
    (bodyString || "");
  const signature = crypto
    .createHmac("sha256", getSecret())
    .update(prehash)
    .digest("base64");

  console.log("=== YAYA DEBUG ===");
  console.log("Method:", method.toUpperCase());
  console.log("Endpoint:", endpointPathWithQuery);
  console.log("Body:", bodyString || '""');
  console.log("Timestamp:", timestamp);
  console.log("Prehash:", prehash);
  console.log("Signature:", signature);

  return {
    "Content-Type": "application/json",
    "YAYA-API-KEY": process.env.API_KEY,
    "YAYA-API-TIMESTAMP": timestamp,
    "YAYA-API-SIGN": signature,
  };
}

// Perform request to YaYa API
export async function yayaRequest({
  method,
  endpointPath,
  query = null,
  body = null,
}) {
  const url = new URL(endpointPath, BASE_URL);

  if (query) {
    Object.entries(query).forEach(([k, v]) => {
      if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
    });
  }

  const endpointPathWithQuery = url.pathname + (url.search || "");
  const bodyString =
    method.toUpperCase() === "GET" ? "" : body ? JSON.stringify(body) : "";

  const headers = buildAuthHeaders({
    method,
    endpointPathWithQuery,
    bodyString,
  });

  try {
    const resp = await axios({
      method,
      url: url.toString(),
      headers,
      data: bodyString || undefined,
      timeout: 10000,
      validateStatus: () => true,
    });

    if (resp.status < 200 || resp.status >= 300) {
      throw new Error(
        `Upstream error ${resp.status}: ${JSON.stringify(resp.data)}`
      );
    }

    return resp.data;
  } catch (err) {
    console.error("=== YAYA REQUEST ERROR ===");
    console.error(err.response?.data || err.message);
    throw err;
  }
}
