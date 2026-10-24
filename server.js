const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const app = express();
const PORT = process.env.PORT || 10000;

// CONFIG
const PRICE_FOR_API = "R2.00";
const PAYMENT_ADDRESS = process.env.PAYMENT_ADDRESS || "0xYourWalletHere"; // change to your wallet later
const PAYMENTS_ENABLED = true; // TRUE = paid API, FALSE = free API

const DATA_FILE = path.join(__dirname, 'prices.json');

// Load prices - if file missing, start EMPTY (not 3 defaults)
let prices = [];
if (fs.existsSync(DATA_FILE)) {
  try { prices = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')); } catch(e){ prices = []; }
}

function save() {
  fs.writeFileSync(DATA_FILE, JSON.stringify(prices, null, 2));
}

// Middleware
app.use(express.json({limit: '20mb'}));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5*1024*1024 } });

function imageToBase64(file) {
  if (!file) return null;
  return `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
}

// x402 Payment Middleware for /prices
function requirePayment(req, res, next) {
  if (!PAYMENTS_ENABLED) return next();
  
  const payment = req.headers['x-payment'] || req.headers['x402-payment'] || req.query.payment;
  // In real x402 you verify crypto here. For now we accept any payment header OR ?payment=paid for testing
  if (payment) {
    return next();
  }
  
  // No payment -> 402
  return res.status(402).json({
    x402: {
      version: 1,
      price: PRICE_FOR_API,
      network: "base", // or polygon, solana
      payTo: PAYMENT_ADDRESS,
      asset: "USDC",
      description: "Pay R2 to access Wellington Price Oracle - 6-100 live products",
      endpoint: "/prices"
    },
    error: "PAYMENT_REQUIRED",
    message: `This API is PAID. Send X-PAYMENT header or add ?payment=paid for test. Price: ${PRICE_FOR_API}. Website for humans is FREE at /`,
    how_to_pay: "Include header X-PAYMENT: <tx_hash> or test with /prices?payment=paid",
    free_alternative: "Visit / for free human view"
  });
}

// ROUTES
app.get('/prices', requirePayment, (req, res) => {
  res.json(prices);
});

app.get('/export', (req, res) => {
  res.setHeader('Content-Disposition', 'attachment; filename=prices-backup.json');
  res.json(prices);
});

// MAIN PAGE
app.get('/', (req, res) => {
  const html = `
  <!DOCTYPE html><html><head><meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Wellington Price Oracle - PAID API</title>
  <style>
    body{font-family:Arial;background:#f5f5f5;margin:0;padding:10px}
    .header{background:#000;color:#fff;padding:15px;text-align:center;border-radius:10px}
    .paid-badge{background:gold;color:#000;padding:5px 10px;border-radius:20px;font-weight:bold}
    .card{background:#fff;border-radius:12px;padding:12px;margin:10px 0;display:flex;gap:12px;box-shadow:0 2px 5px #ccc}
    .card img{width:90px;height:90px;object-fit:cover;border-radius:8px;background:#eee}
    .btn{border:none;padding:8px 12px;border-radius:6px;font-weight:bold;cursor:pointer;margin:2px}
    .del{background:#ff4444;color:#fff} .edit{background:#22c55e;color:#fff} .add{background:#000;color:#fff;width:100%;padding:12px;margin-top:10px}
    .export{background:#3b82f6;color:#fff} .import{background:#f59e0b;color:#000}
    input{width:100%;padding:10px;margin:5px 0;border:1px solid #ccc;border-radius:6px;box-sizing:border-box}
  </style></head><body>
  <div class="header">
    <h2>🇿🇦 Wellington Price Oracle</h2>
    <span class="paid-badge">API PAID R2/call • Website FREE</span>
    <p>Humans FREE • AIs / Bots PAY at /prices</p>
    <p><a href="/prices?payment=paid" style="color:gold">Test PAID API (click)</a> | <a href="/export" style="color:#0ff">EXPORT Backup</a></p>
  </div>

  <form action="/import" method="post" enctype="multipart/form-data" style="background:#fff;padding:10px;border-radius:10px;margin:10px 0">
    <b>RESTORE Backup:</b> <input type="file" name="backup" accept=".json" required>
    <button class="btn import">IMPORT RESTORE</button>
  </form>

  <form action="/add" method="post" enctype="multipart/form-data" style="background:#fff;padding:15px;border-radius:10px">
    <h3>Add Product</h3>
    <input name="name" placeholder="Product Name (e.g. Huletts Sugar)" required>
    <input name="price" placeholder="Price (e.g. 19.99)" type="number" step="0.01" required>
    <input name="shop" placeholder="Shop (e.g. Checkers)" required>
    <input type="file" name="image" accept="image/*" required>
    <button class="btn add">+ ADD Product</button>
  </form>

  <h3>Products (${prices.length})</h3>
  ${prices.map((p,i) => `
    <div class="card">
      <img src="${p.image || ''}" onerror="this.src='https://via.placeholder.com/90'">
      <div style="flex:1">
        <b>${p.name}</b><br>Shop: ${p.shop}<br>R${p.price} • ${p.date || ''}
        <div style="margin-top:6px">
          <form action="/delete" method="post" style="display:inline"><input type="hidden" name="index" value="${i}"><button class="btn del">DELETE</button></form>
          <form action="/edit" method="post" enctype="multipart/form-data" style="display:inline">
            <input type="hidden" name="index" value="${i}">
            <input name="price" placeholder="New Price" type="number" step="0.01" style="width:100px;display:inline" required>
            <input type="file" name="image" accept="image/*" style="width:140px;display:inline">
            <button class="btn edit">EDIT PRICE</button>
          </form>
        </div>
      </div>
    </div>
  `).join('')}

  <div style="background:#000;color:#fff;padding:15px;border-radius:10px;margin-top:20px;text-align:center">
    <p>💰 API: <b>/prices = PAID R2</b> (402 if no payment)</p>
    <p>Test: /prices?payment=paid</p>
    <p>Human site: / = FREE</p>
    <p><a href="/export" style="color:gold">📥 EXPORT BACKUP NOW!</a></p>
  </div>
  </body></html>
  `;
  res.send(html);
});

app.post('/add', upload.single('image'), (req, res) => {
  const img = imageToBase64(req.file);
  prices.push({ name: req.body.name, price: req.body.price, shop: req.body.shop, image: img, date: new Date().toLocaleDateString() });
  save(); res.redirect('/');
});

app.post('/delete', (req, res) => {
  const idx = parseInt(req.body.index);
  if (!isNaN(idx)) { prices.splice(idx,1); save(); }
  res.redirect('/');
});

app.post('/edit', upload.single('image'), (req, res) => {
  const idx = parseInt(req.body.index);
  if (!isNaN(idx) && prices[idx]) {
    if (req.body.price) prices[idx].price = req.body.price;
    const img = imageToBase64(req.file);
    if (img) prices[idx].image = img;
    prices[idx].date = new Date().toLocaleDateString();
    save();
  }
  res.redirect('/');
});

app.post('/import', upload.single('backup'), (req, res) => {
  try {
    const data = JSON.parse(req.file.buffer.toString());
    if (Array.isArray(data)) { prices = data; save(); }
  } catch(e){}
  res.redirect('/');
});

app.listen(PORT, () => console.log(`Wellington PAID Oracle live on ${PORT}`));
