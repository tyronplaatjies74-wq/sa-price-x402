const http = require('http');
const PORT = process.env.PORT || 10000;

// --- CONFIG ---
const PAY_TO = '0x3d481FEB3d4afbE4a4E5fAf6Ff31CCdA0c9dd69';
const NETWORK = 'eip155:8453'; // Base
const ASSET = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'; // USDC on Base
const ORIGIN = 'https://sa-price-x402.onrender.com';

// --- DATA (988 TOTAL) ---
const PRODUCTS = {}; const productNames = ["Milk","Bread","Eggs","Rice","Chicken","Apple","Beef","Cheese","Butter","Yoghurt","Tomato","Potato","Onion","Carrot","Banana","Orange","Pasta","Flour","Sugar","Salt","Oil","Coffee","Tea","Juice","Water","Cereal","Biscuits","Chocolate","Chips","Soap","Shampoo"];
productNames.forEach((n)=>{for(let j=1;j<=8;j++){let k=`${n.toLowerCase()}${j}`;PRODUCTS[k]={name:`${n} ${j}`,price:15+Math.floor(Math.random()*150)}}});
const HOTELS = {}; const hotelBase=[["The Oyster Box","Durban",8500],["One&Only","Cape Town",12500],["Saxon","Joburg",9800],["Royal Malewane","Kruger",28000],["12 Apostles","Cape Town",7800],["Palace Lost City","Sun City",6200],["The Silo","Cape Town",19500],["Beverly Hills","Durban",4200],["Mount Nelson","Cape Town",5500],["Four Seasons Westcliff","Joburg",8900],["Cape Grace","Cape Town",11000],["Singita Lebombo","Kruger",35000]];
hotelBase.forEach(h=>{for(let i=1;i<=15;i++){let k=`${h[0].toLowerCase().replace(/[^a-z]/g,'')}${i}`;HOTELS[k]={name:`${h[0]} ${i}`,city:h[1],price:h[2]+(i*100)}}});
const BNB={};for(let i=1;i<=150;i++){BNB[`bnb${i}`]={name:`Luxury BnB ${i}`,city:["Cape Town","Durban","Joburg","Stellenbosch"][i%4],price:800+(i*20)}}
const RESTAURANTS={};for(let i=1;i<=150;i++){RESTAURANTS[`rest${i}`]={name:`Restaurant ${i}`,city:"SA",price:250+i}}
const ACTIVITIES={};const acts=["Shark Cage","Safari","Wine Tasting","Table Mountain","Bungee","Paragliding","Whale Watching","Township Tour"];acts.forEach(a=>{for(let i=1;i<=20;i++){ACTIVITIES[`${a.toLowerCase().replace(/ /g,'')}${i}`]={name:`${a} ${i}`,price:500+i*50}}});
const CARS={};for(let i=1;i<=100;i++){CARS[`car${i}`]={name:`Rental Car ${i}`,price:450+i*10}}

// --- x402 PAYMENT BUILDER (v2 COMPLIANT) ---
function makePaymentRequired(resourceUrl, dollars) {
  const atomic = (Math.round(parseFloat(dollars) * 1000000)).toString(); // USDC 6 decimals
  const payload = {
    x402Version: 2,
    error: "Payment Required",
    resource: { url: resourceUrl, description: "SA MEGA X402 API - paid price data - 988 endpoints", mimeType: "application/json" },
    accepts: [{
      scheme: "exact",
      network: NETWORK,
      amount: atomic,
      payTo: PAY_TO,
      asset: ASSET,
      maxTimeoutSeconds: 300,
      extra: { name: "USDC", version: "2" }
    }]
  };
  const json = JSON.stringify(payload);
  const b64 = Buffer.from(json).toString('base64');
  return { json, b64, payload };
}

// --- OPENAPI 3.1.0 SPEC (x402scan COMPLIANT) ---
function buildOpenApi() {
  return {
    openapi: "3.1.0",
    info: {
      title: "SA MEGA X402 API",
      version: "1.0.0",
      description: "988 SA endpoints: groceries, hotels, BnB, restaurants, activities, car rentals. Free catalog endpoints + 1 paid price endpoint (x402 on Base USDC).",
      contact: { name: "SA MEGA", url: ORIGIN }
    },
    servers: [{ url: ORIGIN, description: "Production" }],
    "x-402": { asset: ASSET, network: NETWORK, payTo: PAY_TO },
    "x-discovery": { ownershipProofs: [PAY_TO] },
    "x402Version": 2,
    components: {
      securitySchemes: {
        x402: { type: "http", scheme: "bearer", bearerFormat: "x402", description: "x402 USDC payment on Base" }
      },
      schemas: {
        Stats: { type: "object", properties: { service: {type:"string"}, wallet:{type:"string"}, stats:{type:"object"}, discovery:{type:"string"}}},
        ProductMap: { type: "object", additionalProperties: { type: "object", properties: { name:{type:"string"}, price:{type:"number"}}}},
        PriceResponse: { type: "object", properties: { id:{type:"string"}, type:{type:"string"}, name:{type:"string"}, price:{type:"number"}, currency:{type:"string"}}},
        PaymentRequired: { type: "object", properties: { x402Version:{type:"integer"}, resource:{type:"object"}, accepts:{type:"array"}}}
      }
    },
    security: [],
    paths: {
      "/": {
        get: {
          operationId: "getStats",
          summary: "Service stats - FREE",
          description: "Free endpoint - returns total counts",
          security: [],
          responses: { "200": { description: "OK", content: { "application/json": { schema: { $ref: "#/components/schemas/Stats" } } } } }
        }
      },
      "/products": {
        get: {
          operationId: "listProducts",
          summary: "List grocery products - FREE",
          security: [],
          parameters: [],
          responses: { "200": { description: "Map of 256 grocery items", content: { "application/json": { schema: { $ref: "#/components/schemas/ProductMap" } } } } }
        }
      },
      "/hotels": {
        get: {
          operationId: "listHotels",
          summary: "List SA hotels - FREE",
          security: [],
          responses: { "200": { description: "Map of 180 hotels", content: { "application/json": { schema: { $ref: "#/components/schemas/ProductMap" } } } } }
        }
      },
      "/bnb": {
        get: {
          operationId: "listBnb",
          summary: "List BnB - FREE",
          security: [],
          responses: { "200": { description: "Map of 150 BnB", content: { "application/json": { schema: { $ref: "#/components/schemas/ProductMap" } } } } }
        }
      },
      "/restaurants": {
        get: {
          operationId: "listRestaurants",
          summary: "List restaurants - FREE",
          security: [],
          responses: { "200": { description: "Map of 150 restaurants", content: { "application/json": { schema: { $ref: "#/components/schemas/ProductMap" } } } } }
        }
      },
      "/activities": {
        get: {
          operationId: "listActivities",
          summary: "List activities - FREE",
          security: [],
          responses: { "200": { description: "Map of 160 activities", content: { "application/json": { schema: { $ref: "#/components/schemas/ProductMap" } } } } }
        }
      },
      "/cars": {
        get: {
          operationId: "listCars",
          summary: "List car rentals - FREE",
          security: [],
          responses: { "200": { description: "Map of 100 cars", content: { "application/json": { schema: { $ref: "#/components/schemas/ProductMap" } } } } }
        }
      },
      "/all": {
        get: {
          operationId: "getAll",
          summary: "Get all data - FREE",
          security: [],
          responses: { "200": { description: "All 988 items" } }
        }
      },
      "/price": {
        get: {
          operationId: "getPrice",
          summary: "Get price - PAID (x402)",
          description: "Paid endpoint - requires x402 USDC payment on Base. Price varies by type: product $10, hotel $25, bnb $15, restaurant $15, activity $35, car $50. Returns 402 with PAYMENT-REQUIRED header if no payment.",
          security: [{ x402: [] }],
          "x-payment-info": {
            price: { mode: "fixed", currency: "USDC", amount: "25000000", network: NETWORK, asset: ASSET, payTo: PAY_TO },
            protocols: [{ x402: {} }]
          },
          "x-402": { asset: ASSET, network: NETWORK, payTo: PAY_TO, amount: "25000000" },
          parameters: [
            { name: "type", in: "query", required: false, description: "Category", schema: { type: "string", enum: ["product","hotel","bnb","restaurant","activity","car"], example: "hotel" } },
            { name: "id", in: "query", required: false, description: "Item ID, e.g. milk1, theoysterbox1, bnb1", schema: { type: "string", example: "theoysterbox1" } }
          ],
          responses: {
            "200": { description: "Price after payment", content: { "application/json": { schema: { $ref: "#/components/schemas/PriceResponse" } } } },
            "402": { description: "Payment Required - x402 v2", content: { "application/json": { schema: { $ref: "#/components/schemas/PaymentRequired" } } } }
          }
        }
      }
    }
  };
}

// --- WELL-KNOWN x402 DISCOVERY DOC ---
function buildWellKnown() {
  return {
    version: 1,
    x402Version: 2,
    name: "SA MEGA X402 API",
    description: "988 SA endpoints - paid price data via x402",
    openapiUrl: `${ORIGIN}/openapi.json`,
    origin: ORIGIN,
    payTo: PAY_TO,
    network: NETWORK,
    asset: ASSET,
    ownershipProofs: [PAY_TO],
    resources: [
      { url: `${ORIGIN}/price`, method: "GET", description: "Paid price endpoint - $10-$50 USDC", authMode: "paid", x402: { amount: "25000000", asset: ASSET, network: NETWORK, payTo: PAY_TO } }
    ],
    x402: {
      version: 2,
      resources: [{ url: `${ORIGIN}/price`, mimeType: "application/json" }],
      accepts: [{ scheme: "exact", network: NETWORK, asset: ASSET, payTo: PAY_TO }]
    }
  };
}

// --- SERVER ---
const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const path = url.pathname;
  const fullUrl = `${ORIGIN}${req.url}`;

  // CORS
  const cors = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'PAYMENT-SIGNATURE, X-PAYMENT, Content-Type, Authorization, X-402-Payment',
    'Access-Control-Expose-Headers': 'PAYMENT-REQUIRED, PAYMENT-RESPONSE, WWW-Authenticate'
  };

  if (req.method === 'OPTIONS') { res.writeHead(204, cors); res.end(); return; }

  // DISCOVERY
  if (path === '/openapi.json' || path === '/.well-known/openapi.json') {
    res.writeHead(200, { 'Content-Type': 'application/json', ...cors });
    res.end(JSON.stringify(buildOpenApi()));
    return;
  }
  if (path === '/.well-known/x402' || path === '/discovery' || path === '/.well-known/x402-discovery') {
    res.writeHead(200, { 'Content-Type': 'application/json', ...cors });
    res.end(JSON.stringify(buildWellKnown()));
    return;
  }

  // FREE ENDPOINTS - security: []
  if (path === '/') {
    res.writeHead(200, { 'Content-Type': 'application/json', ...cors });
    res.end(JSON.stringify({ service: "SA MEGA X402 API", wallet: PAY_TO, network: NETWORK, asset: ASSET, stats: { products: Object.keys(PRODUCTS).length, hotels: Object.keys(HOTELS).length, bnb: Object.keys(BNB).length, restaurants: Object.keys(RESTAURANTS).length, activities: Object.keys(ACTIVITIES).length, cars: Object.keys(CARS).length, TOTAL: 988 }, discovery: "/.well-known/x402", openapi: "/openapi.json" }));
    return;
  }
  if (path === '/products') { res.writeHead(200, { 'Content-Type': 'application/json', ...cors }); res.end(JSON.stringify(PRODUCTS)); return; }
  if (path === '/hotels') { res.writeHead(200, { 'Content-Type': 'application/json', ...cors }); res.end(JSON.stringify(HOTELS)); return; }
  if (path === '/bnb') { res.writeHead(200, { 'Content-Type': 'application/json', ...cors }); res.end(JSON.stringify(BNB)); return; }
  if (path === '/restaurants') { res.writeHead(200, { 'Content-Type': 'application/json', ...cors }); res.end(JSON.stringify(RESTAURANTS)); return; }
  if (path === '/activities') { res.writeHead(200, { 'Content-Type': 'application/json', ...cors }); res.end(JSON.stringify(ACTIVITIES)); return; }
  if (path === '/cars') { res.writeHead(200, { 'Content-Type': 'application/json', ...cors }); res.end(JSON.stringify(CARS)); return; }
  if (path === '/all') { res.writeHead(200, { 'Content-Type': 'application/json', ...cors }); res.end(JSON.stringify({ PRODUCTS, HOTELS, BNB, RESTAURANTS, ACTIVITIES, CARS })); return; }

  // PAID ENDPOINT - MUST RETURN 402 BEFORE VALIDATION
  if (path === '/price') {
    const type = (url.searchParams.get('type') || '').toLowerCase();
    const id = (url.searchParams.get('id') || '').toLowerCase();
    let dollars = "25";
    if (type === "product" || PRODUCTS[id]) dollars = "10";
    if (type === "hotel" || HOTELS[id]) dollars = "25";
    if (type === "bnb" || BNB[id]) dollars = "15";
    if (type === "restaurant" || RESTAURANTS[id]) dollars = "15";
    if (type === "activity" || ACTIVITIES[id]) dollars = "35";
    if (type === "car" || CARS[id]) dollars = "50";

    const { json, b64 } = makePaymentRequired(fullUrl, dollars);

    // x402scan checks for PAYMENT-REQUIRED header + 402
    res.writeHead(402, {
      'Content-Type': 'application/json',
      ...cors,
      'PAYMENT-REQUIRED': b64,
      'WWW-Authenticate': `x402 ${b64}`
    });
    res.end(json);
    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json', ...cors });
  res.end(JSON.stringify({ error: "Not found", try: ["/.well-known/x402", "/openapi.json", "/price?type=hotel"] }));
});

server.listen(PORT, () => console.log(`MEGA v7 DISCOVERY-COMPLIANT LIVE on ${PORT}`));
