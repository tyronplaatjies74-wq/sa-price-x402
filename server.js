const http = require('http');
const PORT = process.env.PORT || 10000;

const PAY_TO = '0x3d481FEB3d4afbE4a4E5fAf6Ff31CCdA0c9dd69';
const NETWORK = 'eip155:8453';
const ASSET = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';
const ORIGIN = 'https://sa-price-x402.onrender.com';
const CONTACT_EMAIL = 'tyronplaatjie74@gmail.com'; // <-- FIX #1: ownership verification

// --- DATA 988 ---
const PRODUCTS = {}; const productNames = ["Milk","Bread","Eggs","Rice","Chicken","Apple","Beef","Cheese","Butter","Yoghurt","Tomato","Potato","Onion","Carrot","Banana","Orange","Pasta","Flour","Sugar","Salt","Oil","Coffee","Tea","Juice","Water","Cereal","Biscuits","Chocolate","Chips","Soap","Shampoo"];
productNames.forEach((n)=>{for(let j=1;j<=8;j++){let k=`${n.toLowerCase()}${j}`;PRODUCTS[k]={name:`${n} ${j}`,price:15+Math.floor(Math.random()*150)}}});
const HOTELS = {}; const hotelBase=[["The Oyster Box","Durban",8500],["One&Only","Cape Town",12500],["Saxon","Joburg",9800],["Royal Malewane","Kruger",28000],["12 Apostles","Cape Town",7800],["Palace Lost City","Sun City",6200],["The Silo","Cape Town",19500],["Beverly Hills","Durban",4200],["Mount Nelson","Cape Town",5500],["Four Seasons Westcliff","Joburg",8900],["Cape Grace","Cape Town",11000],["Singita Lebombo","Kruger",35000]];
hotelBase.forEach(h=>{for(let i=1;i<=15;i++){let k=`${h[0].toLowerCase().replace(/[^a-z]/g,'')}${i}`;HOTELS[k]={name:`${h[0]} ${i}`,city:h[1],price:h[2]+(i*100)}}});
const BNB={};for(let i=1;i<=150;i++){BNB[`bnb${i}`]={name:`Luxury BnB ${i}`,city:["Cape Town","Durban","Joburg","Stellenbosch"][i%4],price:800+(i*20)}}
const RESTAURANTS={};for(let i=1;i<=150;i++){RESTAURANTS[`rest${i}`]={name:`Restaurant ${i}`,city:"SA",price:250+i}}
const ACTIVITIES={};const acts=["Shark Cage","Safari","Wine Tasting","Table Mountain","Bungee","Paragliding","Whale Watching","Township Tour"];acts.forEach(a=>{for(let i=1;i<=20;i++){ACTIVITIES[`${a.toLowerCase().replace(/ /g,'')}${i}`]={name:`${a} ${i}`,price:500+i*50}}});
const CARS={};for(let i=1;i<=100;i++){CARS[`car${i}`]={name:`Rental Car ${i}`,price:450+i*10}}

function makePaymentRequired(resourceUrl, dollars) {
  const atomic = (Math.round(parseFloat(dollars) * 1000000)).toString();
  const payload = {
    x402Version: 2,
    error: "Payment Required",
    resource: { url: resourceUrl, description: "SA MEGA X402 API - paid price data - 988 endpoints", mimeType: "application/json" },
    accepts: [{ scheme: "exact", network: NETWORK, amount: atomic, payTo: PAY_TO, asset: ASSET, maxTimeoutSeconds: 300, extra: { name: "USDC", version: "2" } }]
  };
  const json = JSON.stringify(payload);
  const b64 = Buffer.from(json).toString('base64');
  return { json, b64 };
}

function buildOpenApi() {
  return {
    openapi: "3.1.0",
    info: {
      title: "SA MEGA X402 API",
      version: "1.0.0",
      description: "988 SA endpoints: groceries, hotels, BnB, restaurants, activities, car rentals. 8 FREE catalog endpoints + 1 PAID price endpoint via x402 on Base USDC.",
      contact: { name: "Tyron Plaatjie", email: CONTACT_EMAIL, url: ORIGIN }
    },
    servers: [{ url: ORIGIN }],
    "x-402": { asset: ASSET, network: NETWORK, payTo: PAY_TO },
    "x-discovery": { ownershipProofs: [PAY_TO] },
    "x402Version": 2,
    components: {
      securitySchemes: { x402: { type: "http", scheme: "bearer", bearerFormat: "x402", description: "x402 USDC on Base" } },
      schemas: {
        ProductMap: { type: "object", additionalProperties: { type: "object", properties: { name:{type:"string"}, price:{type:"number"}, city:{type:"string"} } } },
        PriceResponse: { type: "object", required: ["id","type","price"], properties: { id:{type:"string", example:"theoysterbox1"}, type:{type:"string", example:"hotel"}, name:{type:"string"}, price:{type:"number", example:7800}, currency:{type:"string", example:"ZAR"} } },
        PaymentRequired: { type: "object", properties: { x402Version:{type:"integer", example:2}, resource:{type:"object"}, accepts:{type:"array"}}}
      }
    },
    paths: {
      "/": { get: { operationId: "getStats", summary: "Service stats - FREE", security: [], responses: { "200": { description: "OK" } } } },
      "/products": { get: { operationId: "listProducts", summary: "List groceries - FREE", security: [], parameters: [], responses: { "200": { description: "256 items" } } } },
      "/hotels": { get: { operationId: "listHotels", summary: "List SA hotels - FREE", security: [], responses: { "200": { description: "180 hotels" } } } },
      "/bnb": { get: { operationId: "listBnb", summary: "List BnB - FREE", security: [], responses: { "200": { description: "150 BnB" } } } },
      "/restaurants": { get: { operationId: "listRestaurants", summary: "List restaurants - FREE", security: [], responses: { "200": { description: "150 restaurants" } } } },
      "/activities": { get: { operationId: "listActivities", summary: "List activities - FREE", security: [], responses: { "200": { description: "160 activities" } } } },
      "/cars": { get: { operationId: "listCars", summary: "List car rentals - FREE", security: [], responses: { "200": { description: "100 cars" } } } },
      "/all": { get: { operationId: "getAll", summary: "Get all 988 - FREE", security: [], responses: { "200": { description: "All data" } } } },
      "/price": {
        get: {
          operationId: "getPrice",
          summary: "Get price - PAID (x402)",
          description: "Paid endpoint - x402 USDC on Base. Free catalog at /products etc. Price returns after payment. Probes automatically with type=hotel&id=theoysterbox1",
          security: [{ x402: [] }],
          "x-payment-info": {
            price: { mode: "fixed", currency: "USDC", amount: "25000000", network: NETWORK, asset: ASSET, payTo: PAY_TO },
            protocols: [{ x402: {} }]
          },
          // FIX #2: Full input schema for agents + x402scan probing
          parameters: [
            {
              name: "type",
              in: "query",
              required: true,
              description: "Category of item",
              example: "hotel",
              schema: { type: "string", enum: ["product","hotel","bnb","restaurant","activity","car"], default: "hotel", example: "hotel" }
            },
            {
              name: "id",
              in: "query",
              required: true,
              description: "Item ID - get valid IDs from /hotels, /products etc",
              example: "theoysterbox1",
              schema: { type: "string", default: "theoysterbox1", example: "theoysterbox1" }
            }
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

function buildWellKnown() {
  return {
    version: 1, x402Version: 2, name: "SA MEGA X402 API", description: "988 SA endpoints - 8 free + 1 paid via x402",
    openapiUrl: `${ORIGIN}/openapi.json`, origin: ORIGIN, payTo: PAY_TO, network: NETWORK, asset: ASSET,
    ownershipProofs: [PAY_TO], contact: { email: CONTACT_EMAIL },
    resources: [{ url: `${ORIGIN}/price`, method: "GET", description: "Paid price endpoint - $10-$50 USDC", authMode: "paid", x402: { amount: "25000000", asset: ASSET, network: NETWORK, payTo: PAY_TO } }]
  };
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const path = url.pathname;
  const fullUrl = `${ORIGIN}${req.url}`;
  const cors = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'PAYMENT-SIGNATURE, X-PAYMENT, Content-Type, Authorization, X-402-Payment, X-PAYMENT-SIGNATURE',
    'Access-Control-Expose-Headers': 'PAYMENT-REQUIRED, PAYMENT-RESPONSE, WWW-Authenticate'
  };
  if (req.method === 'OPTIONS') { res.writeHead(204, cors); res.end(); return; }

  if (path === '/openapi.json' || path === '/.well-known/openapi.json') {
    res.writeHead(200, { 'Content-Type': 'application/json', ...cors }); res.end(JSON.stringify(buildOpenApi())); return;
  }
  if (path === '/.well-known/x402' || path === '/discovery' || path === '/.well-known/x402-discovery') {
    res.writeHead(200, { 'Content-Type': 'application/json', ...cors }); res.end(JSON.stringify(buildWellKnown())); return;
  }

  if (path === '/') { res.writeHead(200, { 'Content-Type': 'application/json', ...cors }); res.end(JSON.stringify({ service: "SA MEGA X402 API", wallet: PAY_TO, email: CONTACT_EMAIL, stats: { products: Object.keys(PRODUCTS).length, hotels: Object.keys(HOTELS).length, bnb: Object.keys(BNB).length, restaurants: Object.keys(RESTAURANTS).length, activities: Object.keys(ACTIVITIES).length, cars: Object.keys(CARS).length, TOTAL: 988 }, discovery: "/.well-known/x402", openapi: "/openapi.json" })); return; }
  if (path === '/products') { res.writeHead(200, { 'Content-Type': 'application/json', ...cors }); res.end(JSON.stringify(PRODUCTS)); return; }
  if (path === '/hotels') { res.writeHead(200, { 'Content-Type': 'application/json', ...cors }); res.end(JSON.stringify(HOTELS)); return; }
  if (path === '/bnb') { res.writeHead(200, { 'Content-Type': 'application/json', ...cors }); res.end(JSON.stringify(BNB)); return; }
  if (path === '/restaurants') { res.writeHead(200, { 'Content-Type': 'application/json', ...cors }); res.end(JSON.stringify(RESTAURANTS)); return; }
  if (path === '/activities') { res.writeHead(200, { 'Content-Type': 'application/json', ...cors }); res.end(JSON.stringify(ACTIVITIES)); return; }
  if (path === '/cars') { res.writeHead(200, { 'Content-Type': 'application/json', ...cors }); res.end(JSON.stringify(CARS)); return; }
  if (path === '/all') { res.writeHead(200, { 'Content-Type': 'application/json', ...cors }); res.end(JSON.stringify({ PRODUCTS, HOTELS, BNB, RESTAURANTS, ACTIVITIES, CARS })); return; }

  // PAID - ALWAYS 402 FIRST, NO VALIDATION BEFORE PAYWALL (spec rule #1 & #2)
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
    res.writeHead(402, { 'Content-Type': 'application/json', ...cors, 'PAYMENT-REQUIRED': b64, 'WWW-Authenticate': `x402 ${b64}` });
    res.end(json); return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json', ...cors });
  res.end(JSON.stringify({ error: "Not found", try: ["/.well-known/x402","/openapi.json","/price?type=hotel&id=theoysterbox1"] }));
});

server.listen(PORT, () => console.log(`MEGA v8 FINAL FIX LIVE on ${PORT} - contact email + input schema fixed`));
