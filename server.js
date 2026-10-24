const http = require('http');
const fs = require('fs');
const PORT = process.env.PORT || 10000;
const ORIGIN = 'https://sa-price-x402.onrender.com';
const PAY_TO = '0x3d481feb3d4afbe4a4e5fa100000000000000000000000000000000';
const USDC = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';
const EMAIL = 'tyronplaatjies74@gmail.com';
const SECRET_KEY = 'tyron2026';
const FILE = './prices.json';

let REAL_PRICES = [];
try{
 if(fs.existsSync(FILE)){ REAL_PRICES = JSON.parse(fs.readFileSync(FILE,'utf8')); }
 else {
  REAL_PRICES = [{store:"Shoprite",item:"Bread White",price:"R22.50",region:"Wellington",added:"2026-10-24",by:"Tyron"}];
  fs.writeFileSync(FILE, JSON.stringify(REAL_PRICES,null,2));
 }
}catch(e){ REAL_PRICES = []; }
function save(){ try{ fs.writeFileSync(FILE, JSON.stringify(REAL_PRICES,null,2)); }catch(e){} }

function x402Header(url){
 return Buffer.from(JSON.stringify({
  x402Version:2,
  resource:{url:url, description:"SA prices live Wellington REAL", mimeType:"application/json"},
  accepts:[{scheme:"exact",network:"eip155:8453",amount:"10000",asset:USDC,payTo:PAY_TO,maxTimeoutSeconds:300,extra:{name:"USDC",version:"2"}}],
  error:"Payment Required"
 })).toString('base64');
}

const server = http.createServer((req,res)=>{
 const u = req.url || '/';
 const full = ORIGIN + u;
 const cors = {'Access-Control-Allow-Origin':'*','Access-Control-Allow-Methods':'GET,POST,OPTIONS','Access-Control-Allow-Headers':'*','Access-Control-Expose-Headers':'PAYMENT-REQUIRED,PAYMENT-RESPONSE'};
 if(req.method==='OPTIONS'){res.writeHead(204,cors);res.end();return;}

 // NEW FORM PAGE
 if(u==="/add" || u.startsWith("/add?")){
  const html = `
  <!DOCTYPE html><html><head><meta name="viewport" content="width=device-width,initial-scale=1">
  <title>SA Price LIVE Form</title>
  <style>body{font-family:sans-serif;padding:20px;background:#f5f5f5} .card{background:white;padding:20px;border-radius:12px;max-width:400px;margin:auto;box-shadow:0 2px 10px rgba(0,0,0,.1)} input,select,button{width:100%;padding:12px;margin:8px 0;border-radius:8px;border:1px solid #ccc;font-size:16px} button{background:#0a7a3f;color:white;font-weight:bold;border:none} h2{color:#0a7a3f}</style>
  </head><body><div class="card">
  <h2>🛒 SA Price LIVE Update</h2>
  <p>Forever saves to prices.json</p>
  <form action="/add-price" method="GET">
    <input type="hidden" name="key" value="tyron2026">
    <label>Store</label>
    <select name="store"><option>Shoprite</option><option>Pick n Pay</option><option>Boxer</option><option>Woolworths</option><option>Checkers</option><option>Spar</option></select>
    <label>Item</label><input name="item" placeholder="Bread White" required>
    <label>Price (just number e.g. 22.50)</label><input name="price" type="number" step="0.01" placeholder="22.50" required>
    <label>Region</label><input name="region" value="Wellington" required>
    <button type="submit">SAVE FOREVER 💾</button>
  </form>
  <p><a href="/price?test=true">View all prices</a> | Count: ${REAL_PRICES.length}</p>
  </div></body></html>`;
  res.writeHead(200,{...cors,'Content-Type':'text/html'});
  res.end(html);
  return;
 }

 if(u.startsWith('/add-price')){
   const urlObj = new URL(full);
   const key = urlObj.searchParams.get('key');
   if(key !== SECRET_KEY){ res.writeHead(403,{...cors,'Content-Type':'application/json'}); res.end(JSON.stringify({error:"Wrong key"})); return; }
   const store = urlObj.searchParams.get('store') || "Unknown";
   const item = urlObj.searchParams.get('item') || "Unknown";
   const priceRaw = urlObj.searchParams.get('price') || "0";
   const region = urlObj.searchParams.get('region') || "Wellington";
   const entry = {store,item,price:"R"+priceRaw.toString().replace('R',''),region,added:new Date().toISOString().split('T')[0],by:"Tyron"};
   REAL_PRICES.unshift(entry); save();
   // If from form, show nice HTML
   if(req.headers.accept && req.headers.accept.includes('text/html') || u.includes('store=')){
     if(u.includes('add-price?key=')){
       const isBrowserForm = true;
       if(isBrowserForm){
         res.writeHead(200,{...cors,'Content-Type':'text/html'});
         res.end(`<html><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{font-family:sans-serif;padding:20px;background:#e8f5e9} .card{background:white;padding:20px;border-radius:12px;max-width:400px;margin:auto;text-align:center}</style></head><body><div class="card"><h2>✅ Saved FOREVER!</h2><p><b>${entry.store} - ${entry.item}</b><br>${entry.price} - ${entry.region}<br>${entry.added}</p><p>Total prices: ${REAL_PRICES.length}</p><a href="/add"><button style="padding:12px 20px;background:#0a7a3f;color:white;border:none;border-radius:8px">Add Another</button></a><br><br><a href="/price?test=true">View All</a></div></body></html>`);
         return;
       }
     }
   }
   res.writeHead(200,{...cors,'Content-Type':'application/json'});
   res.end(JSON.stringify({ok:true,message:"Price SAVED FOREVER!",total:REAL_PRICES.length,latest:entry}));
   return;
 }

 if(u.includes('.well-known/x402')){ res.writeHead(200,{...cors,'Content-Type':'application/json'}); res.end(JSON.stringify({x402Version:2,name:"SA Price API REAL",description:"Real SA prices forever",contact:{email:EMAIL},resources:[{url:ORIGIN+'/price',method:"GET",description:"Real prices",input:{queryParams:{product:{type:"string",required:true},region:{type:"string",required:true}}},output:{product:{type:"string"},price:{type:"number"}}}],ownershipProofs:[PAY_TO]})); return; }
 if(u.includes('openapi.json')){ res.writeHead(200,{...cors,'Content-Type':'application/json'}); res.end(JSON.stringify({openapi:"3.0.0",info:{title:"SA MEGA X402 API REAL",version:"4.0.0",contact:{email:EMAIL}},servers:[{url:ORIGIN}],paths:{"/":{get:{summary:"Stats FREE",security:[],responses:{"200":{description:"ok"}}}},"/add":{get:{summary:"Form to add price FREE",security:[],responses:{"200":{description:"ok"}}}},"/price":{get:{summary:"SA prices REAL paid",parameters:[{name:"product",in:"query",required:true,schema:{type:"string"}},{name:"region",in:"query",required:true,schema:{type:"string"}}],responses:{"402":{description:"Payment"},"200":{description:"ok"}}}},"/.well-known/x402":{get:{summary:"Discovery",security:[],responses:{"200":{description:"ok"}}}},"/openapi.json":{get:{summary:"OpenAPI",security:[],responses:{"200":{description:"ok"}}}}}})); return; }
 if(u==="/"||u.startsWith("/?")){res.writeHead(200,{...cors,'Content-Type':'application/json'});res.end(JSON.stringify({ok:true,message:"SA API LIVE v5 FORM + FOREVER "+REAL_PRICES.length+" prices",form:ORIGIN+"/add",price:ORIGIN+"/price",test:ORIGIN+"/price?test=true"}));return;}
 if(u.startsWith("/price") && u.includes("test=true")){res.writeHead(200,{...cors,'Content-Type':'application/json'});res.end(JSON.stringify({ok:true,region:"Wellington",count:REAL_PRICES.length,prices:REAL_PRICES,saved_to:"prices.json"}));return;}
 if(u.startsWith("/price")){res.writeHead(402,{...cors,'Content-Type':'application/json','PAYMENT-REQUIRED':x402Header(full)});res.end(JSON.stringify({error:"Payment Required"}));return;}
 res.writeHead(404,{...cors,'Content-Type':'application/json'});res.end(JSON.stringify({error:"Not found"}));
});
server.listen(PORT,()=>console.log("FORM LIVE "+PORT));
