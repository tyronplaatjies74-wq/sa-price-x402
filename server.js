const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 10000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

if (!fs.existsSync('uploads')) fs.mkdirSync('uploads');

const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

let prices = [];
const DATA_FILE = 'prices.json';

// Load
if (fs.existsSync(DATA_FILE)) {
  try { prices = JSON.parse(fs.readFileSync(DATA_FILE)); } catch(e) { prices = []; }
} else {
  prices = [
    { id: 1, item: "Huletts White Sugar 500g", store: "Shoprite South Africa - Whole Country", price: 19.99, photo: "", verified: true, updatedAt: new Date().toISOString() },
    { id: 2, item: "First Choice Full Cream Milk 1L", store: "Shoprite South Africa - Whole Country", price: 19.99, photo: "", verified: true, updatedAt: new Date().toISOString() },
    { id: 3, item: "SASKO Premium Slices White Bread 700g", store: "Shoprite South Africa - Whole Country", price: 19.99, photo: "", verified: true, updatedAt: new Date().toISOString() }
  ];
}

function save() {
  fs.writeFileSync(DATA_FILE, JSON.stringify(prices, null, 2));
}

// Home Page
app.get('/', (req, res) => {
  let html = `
  <html><head><meta name="viewport" content="width=device-width,initial-scale=1">
  <style>
    body{font-family:Arial;background:#f5f5f5;margin:0;padding:10px}
    .header{background:#d6f0f7;padding:12px;border-radius:12px;display:flex;justify-content:space-between;align-items:center;margin-bottom:12px}
    .badge{background:#0a8a3c;color:white;padding:6px 10px;border-radius:8px;font-size:12px;font-weight:bold}
    .card{background:white;border-radius:12px;padding:10px;display:flex;gap:10px;margin-bottom:10px;box-shadow:0 1px 2px rgba(0,0,0,0.1)}
    .card img{width:90px;height:90px;object-fit:contain;background:#f9f9f9;border-radius:8px}
    .info{flex:1}
    .item{font-weight:bold;font-size:15px}
    .store{font-size:13px;color:#555}
    .price{font-size:26px;font-weight:900;margin:4px 0}
    .edit{width:100%;background:#0a8a3c;color:white;border:none;padding:10px;border-radius:8px;font-weight:bold;font-size:14px}
    .delete{width:100%;background:#e63946;color:white;border:none;padding:6px;border-radius:8px;font-weight:bold;font-size:12px;margin-top:6px}
    .addbox{background:white;padding:12px;border-radius:12px;margin-top:15px}
    input{width:100%;padding:10px;margin:6px 0;border-radius:8px;border:1px solid #ccc;box-sizing:border-box}
    .addbtn{width:100%;background:black;color:white;padding:12px;border:none;border-radius:8px;font-weight:bold;margin-top:6px}
  </style></head><body>
  <div class="header"><b>Wellington Price<br>Oracle</b><span class="badge">VERIFIED • WHOLE COUNTRY</span></div>
  `;

  prices.forEach(p => {
    html += `
    <div class="card">
      <img src="${p.photo || ''}" onerror="this.style.background='#eee'">
      <div class="info">
        <div class="item">${p.item}</div>
        <div class="store">${p.store}</div>
        <div class="price">R${p.price}</div>
        <form method="POST" action="/update" style="margin:0">
          <input type="hidden" name="id" value="${p.id}">
          <input type="number" step="0.01" name="price" value="${p.price}" required>
          <button class="edit">EDIT PRICE</button>
        </form>
        <form method="POST" action="/delete" onsubmit="return confirm('Delete ${p.item}?')" style="margin:0">
          <input type="hidden" name="id" value="${p.id}">
          <button class="delete">DELETE</button>
        </form>
      </div>
    </div>`;
  });

  html += `
  <div class="addbox">
    <h3 style="margin:0 0 8px 0">ADD NEW PRODUCT (unlimited)</h3>
    <form method="POST" action="/add" enctype="multipart/form-data">
      <input name="store" placeholder="Shoprite / Pick n Pay / etc - Whole Country" required>
      <input name="item" placeholder="Product name e.g. Coca-Cola 2L" required>
      <input name="price" type="number" step="0.01" placeholder="Price e.g. 22.99" required>
      <input type="file" name="photo" accept="image/*">
      <button class="addbtn">+ ADD PRODUCT</button>
    </form>
  </div></body></html>`;
  res.send(html);
});

// API for AI
app.get('/prices', (req, res) => res.json(prices));

// ADD - update if same name exists (prevents duplicates)
app.post('/add', upload.single('photo'), (req, res) => {
  const { store, item, price } = req.body;
  let photo = req.file ? '/uploads/' + req.file.filename : '';
  
  // Check if item name already exists (case insensitive)
  let existing = prices.find(p => p.item.toLowerCase().trim() === item.toLowerCase().trim());
  if (existing) {
    existing.store = store;
    existing.price = parseFloat(price);
    if (photo) existing.photo = photo;
    existing.updatedAt = new Date().toISOString();
  } else {
    prices.push({
      id: Date.now(),
      store, item,
      price: parseFloat(price),
      photo, verified: true,
      updatedAt: new Date().toISOString()
    });
  }
  save();
  res.redirect('/');
});

// UPDATE PRICE only - keeps photo
app.post('/update', (req, res) => {
  const p = prices.find(x => x.id == req.body.id);
  if (p) {
    p.price = parseFloat(req.body.price);
    p.updatedAt = new Date().toISOString();
    save();
  }
  res.redirect('/');
});

// DELETE
app.post('/delete', (req, res) => {
  prices = prices.filter(x => x.id != req.body.id);
  save();
  res.redirect('/');
});

app.listen(PORT, () => console.log('Live on ' + PORT));
