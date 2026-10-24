const http = require('http');
const PORT = process.env.PORT || 10000;
const PAY_TO = '0x3d481FEB3d4afbE4a4E5fAf6Ff31CCdA0c9dd69';
const NETWORK = 'eip155:8453'; // Base
const ASSET = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'; // USDC Base
const ORIGIN = 'https://sa-price-x402.onrender.com';

function make402(url, dollars) {
  const amount = (parseFloat(dollars) * 1e6).toString(); // $25 -> 25000000
  const body = {
    x402Version: 2,
    error: "Payment Required",
    resource: { url: url, description: "SA price - paid", mimeType: "application/json" },
    accepts: [{
      scheme: "exact",
      network: NETWORK,
      amount: amount,
      payTo: PAY_TO,
      asset: ASSET,
      maxTimeoutSeconds: 300,
      extra: { name: "USDC", version: "2" }
    }]
  };
  const json = JSON.stringify(body);
  const b64 = Buffer.from(json).toString('base64');
  return { json, b64 };
}

function openapi() {
  return {
    openapi: "3.1.0",
    info: { title: "SA MEGA X402 API", version: "1.0.5", description: "FREE catalog + PAID price via x402 Base USDC" },
    servers: [{ url: ORIGIN }],
    "x-402": { asset: ASSET, network: NETWORK, payTo: PAY_TO },
    "x-discovery": { ownershipProofs: [PAY_TO] },
    x402Version: 2,
    components: {
      securitySchemes: { x402: { type: "http", scheme: "bearer", bearerFormat: "x402" } },
      schemas: {
        PriceInput: {
          type: "object",
          required: ["type", "id"],
          properties: {
            type: { type: "string", enum: ["product", "hotel", "bnb", "restaurant", "activity", "car"], example: "hotel", default: "hotel" },
            id: { type: "string", example: "theoysterbox1", default: "theoysterbox1" }
          }
        },
        PriceResponse: { type: "object", properties: { id: { type: "string" }, type: { type: "string" }, price: { type: "number" }, currency: { type: "string" } } }
      }
    },
    paths: {
      "/": { get: { summary: "Stats FREE", operationId: "stats", security: [], responses: { "200": { description: "OK" } } } },
      "/products": { get: { summary: "Products FREE", security: [], responses: { "200": { description: "OK" } } } },
      "/hotels": { get: { summary: "Hotels FREE", security: [], responses: { "200": { description: "OK" } } } },
      "/bnb": { get: { summary: "BnB FREE", security: [], responses: { "200": { description: "OK" } } } },
      "/restaurants": { get: { summary: "Restaurants FREE", security: [], responses: { "200": { description: "OK" } } } },
      "/activities": { get: { summary: "Activities FREE", security: [], responses: { "200": { description: "OK" } } } },
      "/cars": { get: { summary: "Cars FREE", security: [], responses: { "200": { description: "OK" } } } },
      "/all": { get: { summary: "All FREE", security: [], responses: { "200": { description: "OK" } } } },
      "/price": {
        get: {
          summary: "Get price PAID x402 - $10-$50 USDC",
          description: "Paid endpoint - always returns 402 without payment. Example: ?type=hotel&id=theoysterbox1",
          operationId: "getPrice",
          security: [{ x402: [] }],
          "x-payment-info": { price: { mode: "fixed", currency: "USDC", amount: "25000000", network: NETWORK, asset: ASSET, payTo: PAY_TO }, protocols: [{ x402: {} }] },
          parameters: [
            { name: "type", in: "query", required: true, schema: { type: "string", enum: ["product", "hotel", "bnb", "restaurant", "activity", "car"], example: "hotel", default: "hotel" }, example: "hotel" },
            { name: "id", in: "query", required: true, schema: { type: "string", example: "theoysterbox1", default: "theoysterbox1" }, example: "theoysterbox1" }
          ],
          responses: { "200": { description: "Price", content: { "application/json": { schema: { $ref: "#/components/schemas/PriceResponse" } } } }, "402": { description: "Payment Required" } }
        },
        post: {
          summary: "Get price POST PAID x402",
          operationId: "postPrice",
          security: [{ x402: [] }],
          "x-payment-info": { price: { mode: "fixed", currency: "USDC", amount: "25000000", network: NETWORK, asset: ASSET, payTo: PAY_TO }, protocols: [{ x402: {} }] },
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/PriceInput" },
                examples: { example: { value: { type: "hotel", id: "theoysterbox1" } } }
              }
            }
          },
          responses: { "200": { description: "Price", content: { "application/json": { schema: { $ref: "#/components/schemas/PriceResponse" } } } }, "402": { description: "Payment Required" } }
        }
      }
    }
  };
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  let path = url.pathname;
  const raw = req.url || "";
  const fullUrl = `${ORIGIN}${url.pathname}${url.search}`;

  // Robust routing for ?v= cache-busters
  if (raw.includes("openapi.json")) path = "/openapi.json";
  if (raw.includes(".well-known")) path = "/.well-known/x402";
  if (raw.includes("/price")) path = "/price";
  if (raw.includes("favicon")) path = "/favicon.ico";

  const cors = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': '*',
    'Access-Control-Expose-Headers': 'PAYMENT-REQUIRED, WWW-Authenticate'
  };

  if (req.method === 'OPTIONS') { res.writeHead(204, cors); res.end(); return; }
  if (path === '/openapi.json') { res.writeHead(200, { 'Content-Type': 'application/json', ...cors }); res.end(JSON.stringify(openapi())); return; }
  if (path === '/favicon.ico') { res.writeHead(204, cors); res.end(); return; }
  if (path === '/.well-known/x402') {
    res.writeHead(200, { 'Content-Type': 'application/json', ...cors });
    res.end(JSON.stringify({
      version: 1, x402Version: 2, name: "SA MEGA X402 API", origin: ORIGIN,
      openapiUrl: `${ORIGIN}/openapi.json`, payTo: PAY_TO, network: NETWORK, asset: ASSET,
      ownershipProofs: [PAY_TO],
      resources: [
        { url: `${ORIGIN}/`, method: "GET" }, { url: `${ORIGIN}/products`, method: "GET" },
        { url: `${ORIGIN}/hotels`, method: "GET" }, { url: `${ORIGIN}/bnb`, method: "GET" },
        { url: `${ORIGIN}/restaurants`, method: "GET" }, { url: `${ORIGIN}/activities`, method: "GET" },
        { url: `${ORIGIN}/cars`, method: "GET" }, { url: `${ORIGIN}/all`, method: "GET" },
        { url: `${ORIGIN}/price`, method: "GET", description: "Paid price" },
        { url: `${ORIGIN}/price`, method: "POST", description: "Paid price POST" }
      ]
    }));
    return;
  }

  // FREE endpoints - must have security: [] in openapi
  if (path === '/' || path === '/products' || path === '/hotels' || path === '/bnb' || path === '/restaurants' || path === '/activities' || path === '/cars' || path === '/all') {
    res.writeHead(200, { 'Content-Type': 'application/json', ...cors });
    res.end(JSON.stringify({ ok: true, free: true }));
    return;
  }

  // PAID - ALWAYS return 402 BEFORE any validation (spec point #2)
  if (path === '/price') {
    let dollars = "25";
    try {
      const t = (url.searchParams.get('type') || 'hotel').toLowerCase();
      if (t === 'product') dollars = "10";
      if (t === 'bnb') dollars = "15";
      if (t === 'restaurant') dollars = "15";
      if (t === 'activity') dollars = "35";
      if (t === 'car') dollars = "50";
    } catch {}
    const { json, b64 } = make402(fullUrl, dollars);
    res.writeHead(402, { 'Content-Type': 'application/json', ...cors, 'PAYMENT-REQUIRED': b64, 'WWW-Authenticate': `x402 ${b64}` });
    res.end(json);
    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json', ...cors });
  res.end(JSON.stringify({ error: "not found" }));
});

server.listen(PORT, () => console.log(`v13 LIVE - 402 fix`));
