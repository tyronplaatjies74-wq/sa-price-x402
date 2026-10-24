const http = require('http');
const PORT = process.env.PORT || 10000;
const ORIGIN = 'https://sa-price-x402.onrender.com';
const PAY_TO = '0x3d481FEB3d4afbE4a4E5fA1';
const EMAIL = 'tyronplaatjies74@gmail.com';
const USDC = '0x833589fCD6eDb6E08f4c7C32';

function x402Header(url){
 const data = {
  x402Version: 2,
  accepts: [{ scheme:"exact", network:"base", price:"$0.01", payTo:PAY_TO, asset:USDC, maxTimeoutSeconds:300 }],
  resource: { url: url, description:"SA prices" },
  error:"Payment Required"
 };
 return Buffer.from(JSON.stringify(data)).toString('base64');
}

const server = http.createServer((req,res)=>{
 const u = req.url || '/';
 const full = ORIGIN + u;
 const cors = {
  'Access-Control-Allow-Origin':'*',
  'Access-Control-Allow-Methods':'GET,POST,OPTIONS',
  'Access-Control-Allow-Headers':'*',
  'Access-Control-Expose-Headers':'PAYMENT-REQUIRED,X-PAYMENT',
 };

 if(req.method==='OPTIONS'){res.writeHead(204,cors);res.end();return;}
 if(u.includes('favicon')){res.writeHead(204,cors);res.end();return;}

 // NEW for x402scan
 if(u.includes('x402')||u.includes('.well-known')){
  res.writeHead(200,{...cors,'Content-Type':'application/json'});
  res.end(JSON.stringify({x402Version:2,resources:[{url:ORIGIN+'/price',method:"GET"},{url:ORIGIN+'/products',method:"GET"}],ownershipProofs:[PAY_TO]}));
  return;
 }

 if(u.includes('openapi.json')){
  const spec = {
   openapi:"3.1.0",
   info:{title:"SA MEGA X402 API",version:"1.0.15",description:"South Africa prices",contact:{name:"Tyron Plaatjie",email:EMAIL}},
   servers:[{url:ORIGIN}],
   paths:{
    "/":{get:{summary:"Stats FREE"}},
    "/price":{get:{summary:"SA prices - 402"}},
    "/.well-known/x402":{get:{summary:"Discovery"}},
    "/openapi.json":{get:{summary:"OpenAPI"}}
   }
  };
  res.writeHead(200,{...cors,'Content-Type':'application/json'});
  res.end(JSON.stringify(spec));
  return;
 }

 if(u==="/"||u.startsWith("/?")){
  res.writeHead(200,{...cors,'Content-Type':'application/json'});
  res.end(JSON.stringify({ok:true, message:"SA MEGA X402 API LIVE", price:ORIGIN+"/price", discovery:ORIGIN+"/.well-known/x402"}));
  return;
 }

 if(u.startsWith("/price")){
  res.writeHead(402,{...cors,'Content-Type':'application/json','PAYMENT-REQUIRED':x402Header(full)});
  res.end(JSON.stringify({error:"Payment Required", payTo:PAY_TO, price:"$0.01"}));
  return;
 }

 res.writeHead(404,{...cors,'Content-Type':'application/json'});
 res.end(JSON.stringify({error:"Not found"}));
});

server.listen(PORT,()=>console.log("Listening "+PORT));
