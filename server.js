const http = require('http');
const PORT = process.env.PORT || 10000;
const PAY_TO = '0x3d481FEB3d4afbE4a4E5fAf6Ff31CCdA0c9dd69';
const NETWORK = 'eip155:8453';
const ASSET = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';
const ORIGIN = 'https://sa-price-x402.onrender.com';
const EMAIL = 'tyronplaatjie74@gmail.com';

function make402(url, dollars) {
  const amount = (parseFloat(dollars) * 1e6).toString();
  const payload = {
    x402Version: 2,
    error: "Payment Required",
    resource: { url, description: "SA price endpoint - returns price after USDC payment", mimeType: "application/json" },
    accepts: [{ scheme: "exact", network: NETWORK, amount, payTo: PAY_TO, asset: ASSET, maxTimeoutSeconds: 300, extra: { name: "USDC", version: "2" } }]
  };
  const json = JSON.stringify(payload);
  return { json, b64: Buffer.from(json).toString('base64') };
}

function openapi() {
  const PriceResponse = {
    type: "object",
    required: ["id","type","price","currency"],
    properties: {
      id: { type: "string", example: "theoysterbox1" },
      type: { type: "string", example: "hotel" },
      name: { type: "string", example: "The Oyster Box" },
      price: { type: "number", example: 8500 },
      currency: { type: "string", example: "ZAR" },
      source: { type: "string", example: "sa-price-x402" }
    }
  };
  return {
    openapi: "3.1.0",
    info: { title: "SA MEGA X402 API", version: "1.0.8", description: "988 FREE items + PAID price via x402 Base USDC", contact: { name: "Tyron Plaatjie", email: EMAIL, url: ORIGIN } },
    servers: [{ url: ORIGIN }],
    "x-402": { asset: ASSET, network: NETWORK, payTo: PAY_TO },
    "x-discovery": { ownershipProofs: [PAY_TO] },
    x402Version: 2,
    components: {
      securitySchemes: { x402: { type: "http", scheme: "bearer", bearerFormat: "x402" } },
      schemas: {
        PriceInput: { type: "object", required: ["type","id"], properties: { type: { type: "string", enum: ["product","hotel","bnb","restaurant","activity","car"], default: "hotel", example: "hotel" }, id: { type: "string", default: "theoysterbox1", example: "theoysterbox1" } } },
        PriceResponse
      }
    },
    paths: {
      "/": { get: { summary: "Stats FREE", operationId: "getStats", security: [], responses: { "200": { description: "OK", content: { "application/json": { schema: { type: "object", properties: { ok: { type: "boolean" } } } } } } } } },
      "/products": { get: { summary: "Products FREE", security: [], responses: { "200": { description: "OK", content: { "application/json": { schema: { type: "object" } } } } } } },
      "/hotels": { get: { summary: "Hotels FREE", security: [], responses: { "200": { description: "OK", content: { "application/json": { schema: { type: "object" } } } } } } },
      "/bnb": { get: { summary: "BnB FREE", security: [], responses: { "200": { description: "OK", content: { "application/json": { schema: { type: "object" } } } } } } },
      "/restaurants": { get: { summary: "Restaurants FREE", security: [], responses: { "200": { description: "OK", content: { "application/json": { schema: { type: "object" } } } } } } },
      "/activities": { get: { summary: "Activities FREE", security: [], responses: { "200": { description: "OK", content: { "application/json": { schema: { type: "object" } } } } } } },
      "/cars": { get: { summary: "Cars FREE", security: [], responses: { "200": { description: "OK", content: { "application/json": { schema: { type: "object" } } } } } } },
      "/all": { get: { summary: "All FREE", security: [], responses: { "200": { description: "OK", content: { "application/json": { schema: { type: "object" } } } } } } } },
      "/price": {
        get: {
          summary: "Get price PAID x402", operationId: "getPrice", security: [{ x402: [] }],
          "x-payment-info": { price: { mode: "fixed", currency: "USDC", amount: "25000000", network: NETWORK, asset: ASSET, payTo: PAY_TO }, protocols: [{ x402: {} }] },
          parameters: [
            { name: "type", in: "query", required: true, schema: { type: "string", enum: ["product","hotel","bnb","restaurant","activity","car"], example: "hotel", default: "hotel" }, example: "hotel" },
            { name: "id", in: "query", required: true, schema: { type: "string", example: "theoysterbox1", default: "theoysterbox1" }, example: "theoysterbox1" }
          ],
          responses: {
            "200": { description: "Price after payment", content: { "application/json": { schema: { $ref: "#/components/schemas/PriceResponse" } } } },
            "402": { description: "Payment Required", content: { "application/json": { schema: { type: "object", properties: { x402Version: { type: "integer" }, error: { type: "string" } } } } } }
          }
        },
        post: {
          summary: "Get price POST PAID", operationId: "postPrice", security: [{ x402: [] }],
          "x-payment-info": { price: { mode: "fixed", currency: "USDC", amount: "25000000", network: NETWORK, asset: ASSET, payTo: PAY_TO }, protocols: [{ x402: {} }] },
          requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/PriceInput" }, examples: { ex: { value: { type: "hotel", id: "theoysterbox1" } } } } } },
          responses: {
            "200": { description: "Price after payment", content: { "application/json": { schema: { $ref: "#/components/schemas/PriceResponse" } } } },
            "402": { description: "Payment Required" }
          }
        }
      }
    }
  };
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  let path = url.pathname; const raw = req.url || ""; const fullUrl = `${ORIGIN}${url.pathname}${url.search}`;
  if (raw.includes("openapi.json")) path = "/openapi.json";
  if (raw.includes(".well-known")) path = "/.well-known/x402";
  if (raw.includes("/price")) path = "/price";
  if (raw.includes("favicon")) path = "/favicon.ico";

  const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS', 'Access-Control-Allow-Headers': '*', 'Access-Control-Expose-Headers': 'PAYMENT-REQUIRED, WWW-Authenticate' };
  if (req.method === 'OPTIONS') { res.writeHead(204, cors); res.end(); return; }

  if (path === '/openapi.json') { res.writeHead(200, { 'Content-Type': 'application/json', ...cors }); res.end(JSON.stringify(openapi())); return; }
  if (path === '/favicon.ico') { res.writeHead(204, cors); res.end(); return; }

  if (path === '/.well-known/x402') {
    res.writeHead(200, { 'Content-Type': 'application/json', ...cors });
    res.end(JSON.stringify({
      version: 1, x402Version: 2, name: "SA MEGA X402 API", origin: ORIGIN, openapiUrl: `${ORIGIN}/openapi.json`,
      payTo: PAY_TO, network: NETWORK, asset: ASSET, ownershipProofs: [PAY_TO],
      resources: [
        { url: `${ORIGIN}/`, method: "GET" }, { url: `${ORIGIN}/products`, method: "GET" },
        { url: `${ORIGIN}/hotels`, method: "GET" }, { url: `${ORIGIN}/bnb`, method: "GET" },
        { url: `${ORIGIN}/restaurants`, method: "GET" }, { url: `${ORIGIN}/activities`, method: "GET" },
        { url: `${ORIGIN}/cars`, method: "GET" }, { url: `${ORIGIN}/all`, method: "GET" },
        { url: `${ORIGIN}/price`, method: "GET" }, { url: `${ORIGIN}/price`, method: "POST" }
      ],
      contact: { email: EMAIL }
    }));
    return;
  }

  if (['/','/products','/hotels','/bnb','/restaurants','/activities','/cars','/all'].includes(path)) {
    res.writeHead(200, { 'Content-Type': 'application/json', ...cors });
    res.end(JSON.stringify({ ok: true, count: 100 }));
    return;
  }

  if (path === '/price') {
    let dollars = "25"; const t = (url.searchParams.get('type') || 'hotel').toLowerCase();
    if (t === 'product') dollars = "10"; if (t === 'bnb') dollars = "15"; if (t === 'restaurant') dollars = "15"; if (t === 'activity') dollars = "35"; if (t === 'car') dollars = "50";
    const { json, b64 } = make402(fullUrl, dollars);
    const expires = new Date(Date.now() + 300000).toISOString();
    const wwwAuth = `Payment id="price-${Date.now()}", method="GET", intent="pay", realm="${ORIGIN}", expires="${expires}", request="${fullUrl}"`;
    res.writeHead(402, { 'Content-Type': 'application/json', ...cors, 'PAYMENT-REQUIRED': b64, 'WWW-Authenticate': wwwAuth });
    res.end(json);
    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json', ...cors });
  res.end(JSON.stringify({ error: "not found" }));
});

server.listen(PORT, () => console.log("v17 LIVE - id method intent realm expires request + output schema"));
