const express = require('express');
const multer = require('multer');
const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

let prices = [
  { id: 1, item: "Huletts White Sugar 500g", store: "Shoprite South Africa - Whole Country", price: 19.99, photo: "", verified: true, updatedAt: new Date().toISOString() },
  { id: 2, item: "First Choice Full Cream Milk 1L", store: "Shoprite South Africa - Whole Country", price: 19.99, photo: "", verified: true, updatedAt: new Date().toISOString() },
  { id: 3, item: "SASKO Premium Slices White Bread 700g", store: "Shoprite South Africa - Whole Country", price: 19.99, photo: "", verified: true, updatedAt: new Date().toISOString() }
];

app.get('/', (req, res) => {
 res.send(`<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{font-family:sans-serif;background:#f6f7f8;margin:0}.h{background:#d6f0f8;margin:12px;border-radius:16px;padding:14px;display:flex;justify-content:space-between}.b{background:#0a9e4d;color:#fff;padding:5px 10px;border-radius:8px;font-size:11px;font-weight:bold}.c{background:#fff;border-radius:16px;margin:10px;padding:12px;display:flex;gap:10px}.c img{width:80px;height:100px;object-fit:contain;background:#f9f9f9;border-radius:10px}.price{font-size:30px;font-weight:900}.btn{background:#0a9e4d;color:#fff;border:none;padding:11px;border-radius:10px;font-weight:bold;width:100%}input{padding:10px;border:1px solid #ddd;border-radius:10px;width:100%;box-sizing:border-box}</style></head><body>
 <div class="h"><b>Wellington Price Oracle</b><span class="b">VERIFIED • WHOLE COUNTRY</span></div><div id="L"></div>
 <div style="background:#fff;border-radius:16px;margin:20px 10px;padding:16px"><h3 style="margin:0 0 10px">ADD NEW PRODUCT (unlimited)</h3><form action="/prices" method="POST" enctype="multipart/form-data" style="display:grid;gap:8px"><input name="store" placeholder="Shoprite / Pick n Pay / etc - Whole Country" required><input name="item" placeholder="Product name e.g. Coca-Cola 2L" required><input name="price" type="number" step="0.01" placeholder="Price e.g. 22.99" required><input name="photo" type="file" accept="image/*"><button type="submit" style="background:#000;color:#fff;border:none;padding:12px;border-radius:10px;font-weight:bold">+ ADD PRODUCT</button></form></div>
 <script>async function load(){const r=await fetch('/prices');const d=await r.json();document.getElementById('L').innerHTML=d.map(p=>'<div class=c><img src="'+p.photo+'" onerror=this.src="" ><div style=flex:1><h3 style=margin:0;font-size:14px>'+p.item+'</h3><small>'+p.store+'</small><div class=price>R'+p.price+'</div><div id=a-'+p.id+'><button class=btn onclick=ed('+p.id+','+p.price+')>EDIT PRICE</button></div></div></div>').join('')}function ed(id,o){document.getElementById('a-'+id).innerHTML='<div style=display:flex;gap:6px><input id=i-'+id+' type=number step=0.01 value='+o+' style=flex:1;padding:10px;border:2px solid #0a9e4d;border-radius:10px><button onclick=save('+id+') style=background:#0a9e4d;color:#fff;border:none;padding:10px 14px;border-radius:10px>Save</button><button onclick=load() style=background:#eee;border:none;padding:10px;border-radius:10px>X</button></div>'}async function save(id){const v=document.getElementById('i-'+id).value;await fetch('/prices/'+id,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({price:v})});load()}load();</script></body></html>`);
});

app.get('/prices', (req,res)=>res.json(prices));
app.put('/prices/:id', (req,res)=>{const p=prices.find(x=>x.id==req.params.id);if(p){p.price=parseFloat(req.body.price);p.updatedAt=new Date().toISOString();res.json({ok:true})}else res.status(404).json({e:'not found'})});
app.post('/prices', upload.single('photo'), (req,res)=>{const {store,item,price}=req.body;const ex=prices.find(p=>p.item.toLowerCase()===item.toLowerCase()&&p.store.toLowerCase()===store.toLowerCase());if(ex){ex.price=parseFloat(price);ex.updatedAt=new Date().toISOString();if(req.file)ex.photo='/uploads/'+req.file.filename}else{prices.push({id:Date.now(),store,item,price:parseFloat(price),photo:req.file?'/uploads/'+req.file.filename:'',verified:true,updatedAt:new Date().toISOString()})}res.redirect('/')});

const PORT=process.env.PORT||3000;app.listen(PORT,()=>console.log('live'));
