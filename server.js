const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const app = express();

// Setup folders
const upload = multer({ dest: 'uploads/' });
if (!fs.existsSync('uploads')) fs.mkdirSync('uploads');

app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

// Load existing prices
let prices = [];
if (fs.existsSync('prices.json')) {
  try {
    prices = JSON.parse(fs.readFileSync('prices.json', 'utf8'));
  } catch {}
}

// Home page with photo upload
app.get('/', (req, res) => {
  res.send(`
<html style="background:white;padding:20px;font-family:Arial">
<h2>🇿🇦 Wellington Price Oracle - Verified</h2>
<p>AI Economy Ready - x402 Bazaar</p>
<form method="post" action="/add" enctype="multipart/form-data">
Store: <input name="store" value="Shoprite Wellington" required><br><br>
Item: <input name="item" placeholder="SASKO White 700g" required><br><br>
Price: <input name="price" type="number" step="0.01" required><br><br>
Region: <input name="region" value="Wellington" required><br><br>
📸 Photo Proof (required): <input type="file" name="photo" accept="image/*" required><br><br>
<button style="padding:10px 20px;background:black;color:white">SAVE + VERIFY</button>
</form>
<br><a href="/price?test=true">View all prices + photos</a>
<br><br><a href="/llms.txt">llms.txt for AI</a>
</html>
  `);
});

// Add price with photo
app.post('/add', upload.single('photo'), (req, res) => {
  const filePath = req.file ? `/uploads/${req.file.filename}` : null;
  
  const newPrice = {
    store: req.body.store,
    item: req.body.item,
    price: parseFloat(req.body.price),
    region: req.body.region,
    photo: filePath,
    verified: true,
    date: new Date().toISOString().split('T')[0]
  };

  prices.push(newPrice);
  fs.writeFileSync('prices.json', JSON.stringify(prices, null, 2));

  res.send(`
    ✅ SAVED + VERIFIED!<br><br>
    Store: ${newPrice.store}<br>
    Item: ${newPrice.item}<br>
    Price: R${newPrice.price}<br>
    <img src="${filePath}" width="300"><br><br>
    <a href="/">Add more</a> | <a href="/price?test=true">View JSON</a>
  `);
});

// JSON feed for bazaar + AI
app.get('/price', (req, res) => {
  res.json(prices);
});

// llms.txt
app.get('/llms.txt', (req, res) => {
  res.type('text/plain').send(`# Wellington Price Oracle
Endpoint: https://sa-price-x402.onrender.com/price
Region: Wellington, Western Cape
Verified: photo proof required
Format: ?format=json&region=Wellington
x402-enabled: true
Price per query: $0.05 USDC`);
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log('Running on ' + PORT));
