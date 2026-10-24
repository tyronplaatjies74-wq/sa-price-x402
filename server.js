const http = require('http');
const fs = require('fs');
const FILE = './prices.json';
function load(){ try { return JSON.parse(fs.readFileSync(FILE,'utf8')); } catch(e){ return []; } }
function save(data){ fs.writeFileSync(FILE, JSON.stringify(data,null,2)); }
function x402Header(){ return { "Content-Type":"text/plain", "X-402-Pay-To":"0x3d481feb3d4afbe4a4e5fa123456789", "X-402-Price":"$0.01", "Access-Control-Expose-Headers":"X-402-Pay-To, X-402-Price" }; }
const server = http.createServer((req,res)=>{
  const u = req.url.split('?')[0];
  res.setHeader("Access-Control-Allow-Origin","*");
  if(u==="/.well-known/x402"){ res.writeHead(200,{"Content-Type":"application/json"}); return res.end(JSON.stringify({x402:{payTo:"0x3d481feb", price:"$0.01", network:"base", endpoint:"/price"}})); }
  if(u==="/add"){
    if(req.method==="POST"){
      let body=""; req.on("data",c=>body+=c);
      req.on("end",()=>{
        const p = new URLSearchParams(body);
        const entry = { store: p.get("store")||"Shoprite", item: p.get("item")||"Bread", price: p.get("price")||"0", region: p.get("region")||"Wellington", added: new Date().toISOString().slice(0,10), by: "Tyron" };
        const all = load(); all.push(entry); save(all);
        res.writeHead(200,{"Content-Type":"text/html"}); return res.end(`<body style="font-family:sans-serif;background:#fff;padding:20px;text-align:center"><h2 style="color:green">Saved FOREVER!</h2><p>${entry.item} - R${entry.price} - ${entry.region}</p><a href="/add" style="display:inline-block;padding:12px 20px;background:#16a34a;color:#fff;border-radius:8px;text-decoration:none;margin:8px">+ Add Another</a><a href="/price?test=true" style="display:inline-block;padding:12px 20px;background:#111;color:#fff;border-radius:8px;text-decoration:none">View All Prices (${all.length})</a></body>`);
      }); return;
    }
    res.writeHead(200,{"Content-Type":"text/html"});
    return res.end(`<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{font-family:sans-serif;background:#f9fafb;margin:0;padding:16px} .card{max-width:420px;margin:auto;background:#fff;border:1px solid #e5e7eb;border-radius:16px;padding:20px} input,select{width:100%;padding:12px;margin:8px 0;border:1px solid #ddd;border-radius:8px;box-sizing:border-box} button{width:100%;padding:14px;background:#16a34a;color:#fff;border:none;border-radius:8px;font-weight:bold;font-size:16px;margin-top:12px}</style></head><body><div class="card"><h2 style="margin:0">Add SA Price</h2><p style="color:#666;font-size:13px">Saves FOREVER to prices.json</p><form method="POST"><label>Store</label><select name="store"><option>Shoprite</option><option>Pick n Pay</option><option>Checkers</option><option>Woolworths</option><option>Boxer</option></select><label>Item</label><input name="item" value="Bread White" required><label>Price</label><input name="price" value="22.50" required><label>Region</label><input name="region" value="Wellington" required><button type="submit">SAVE FOREVER</button></form><div style="text-align:center;margin-top:16px"><a href="/price?test=true">View all prices</a></div></div></body></html>`);
  }
  if(u==="/price" || u.startsWith("/price?")){
    let q = {}; try { const urlObj = new URL(req.url, 'http://x'); urlObj.searchParams.forEach((v,k)=>q[k]=v); } catch(e){}
    if(q.format === 'json'){ let data = load(); if(q.region) data = data.filter(p=>p.region.toLowerCase()===q.region.toLowerCase()); res.writeHead(200,{"Content-Type":"application/json","Access-Control-Allow-Origin":"*"}); return res.end(JSON.stringify({ok:true, region:q.region||"All", count:data.length, prices:data})); }
    if(q.test !== 'true'){ const hasPay = req.headers['x-payment'] || req.headers['payment-signature']; if(!hasPay){ res.writeHead(402, x402Header()); return res.end("402 Payment Required - Pay $0.01 USDC. Use ?test=true for free preview"); } }
    let data = load(); if(q.region) data = data.filter(p=>p.region.toLowerCase()===q.region.toLowerCase());
    let rows = data.map(p=>`<tr style="border-bottom:1px solid #eee"><td style="padding:12px">${p.store}</td><td style="padding:12px"><b>${p.item}</b></td><td style="padding:12px;color:green;font-weight:bold">R${p.price.replace('R','')}</td><td style="padding:12px">${p.region}</td><td style="padding:12px;font-size:12px;color:#888">${p.added}</td></tr>`).join('') || `<tr><td colspan=5 style="padding:20px;text-align:center;color:#888">No prices yet - Go to /add</td></tr>`;
    const html = `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{font-family:sans-serif;background:#fff;margin:0;padding:16px} .card{max-width:700px;margin:auto;border:1px solid #e5e7eb;border-radius:16px;overflow:hidden} .head{background:#111;color:#fff;padding:16px 20px;display:flex;justify-content:space-between} table{width:100%;border-collapse:collapse} a.btn{display:inline-block;padding:10px 14px;background:#111;color:#fff;border-radius:8px;text-decoration:none;margin:4px}</style></head><body><div class="card"><div class="head"><div><b>SA PRICE X402</b><br><span style="font-size:12px;opacity:.7">${data.length} prices</span></div><div><a href="/add" style="color:#fff;text-decoration:none;background:#16a34a;padding:8px 12px;border-radius:8px">+ Add Price</a></div></div><div style="overflow-x:auto"><table><tr style="background:#f9fafb;text-align:left;font-size:12px;color:#666"><th style="padding:12px">Store</th><th style="padding:12px">Item</th><th style="padding:12px">Price</th><th style="padding:12px">Region</th><th style="padding:12px">Date</th></tr>${rows}</table></div><div style="padding:12px;background:#f9fafb;display:flex;gap:8px;flex-wrap:wrap"><a class="btn" href="/add">Add Price Form</a><a class="btn" href="/price?test=true">Refresh</a><a class="btn" href="/price?format=json&test=true" style="background:#e5e7eb;color:#111">JSON</a></div></div></body></html>`;
    res.writeHead(200,{"Content-Type":"text/html"}); return res.end(html);
  }
  res.writeHead(200,{"Content-Type":"text/html"}); res.end(`<body style="font-family:sans-serif;padding:20px"><h2>SA Price x402 API</h2><p><a href="/add">Add Form</a> | <a href="/price?test=true">White List</a></p></body>`);
});
server.listen(process.env.PORT||3000);
