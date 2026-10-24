const http = require('http');
const PORT = process.env.PORT || 10000;
const ORIGIN = 'https://sa-price-x402.onrender.com';
const PAY_TO = '0x3d481feb3d4afbe4a4e5fa100000000000000000000000000';
const USDC = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';
const EMAIL = 'tyronplaatjies74@gmail.com';

function x402Header(url){
 return Buffer.from(JSON.stringify({
  x402Version: 2,
  resource: { url: url, description:"SA prices live Wellington", mimeType:"application/json" },
  accepts: [{ scheme:"exact", network:"eip155:8453", amount:"10000", asset:USDC, payTo:PAY_TO, maxTimeoutSeconds:300, extra:{name:"USDC", version:"2"}}],
  error:"Payment Required"
 })).toString('base64');
}

const server = http.createServer((req,res)=>{
 const u = req.url || '/';
 const full = ORIGIN + u;
 const cors = {'Access-Control-Allow-Origin':'*','Access-Control-Allow-Methods':'GET,POST,OPTIONS','Access-Control-Allow-Headers':'*','Access-Control-Expose-Headers':'PAYMENT-REQUIRED,PAYMENT-RESPONSE'};
 if(req.method==='OPTIONS'){res.writeHead(204,cors);res.end();return;}
 if(u.includes('favicon')){res.writeHead(204,cors);res.end();return;}
 
 if(u.includes('.well-known/x402')){
  res.writeHead(200,{...cors,'Content-Type':'application/json'});
  res.end(JSON.stringify({
    x402Version:2,
    name:"SA Price API",
    description:"SA prices API Wellington",
    contact:{email:EMAIL},
    resources:[{
      url:ORIGIN+'/price',
      method:"GET",
      description:"SA prices - product and region query",
      input: { queryParams: { product:{type:"string", description:"Product e.g. apples", required:true}, region:{type:"string", description:"Region e.g. Wellington", required:true} } },
      output: { product:{type:"string"}, price:{type:"number"} }
    }],
    ownershipProofs:[PAY_TO]
  }));
  return;
 }

 if(u.includes('openapi.json')){
  const spec = {
   openapi:"3.0.0",
   info:{title:"SA MEGA X402 API",version:"2.0.0", contact:{email:EMAIL}},
   servers:[{url:ORIGIN}],
   paths:{
    "/":{get:{summary:"Stats FREE", security:[], responses:{"200":{description:"ok"}}}},
    "/price":{
     get:{
      summary:"SA prices - paid",
      parameters:[
        {name:"product", in:"query", required:true, schema:{type:"string"}, description:"Product name e.g. apples"},
        {name:"region", in:"query", required:true, schema:{type:"string"}, description:"Region e.g. Wellington"}
      ],
      responses:{
        "402":{description:"Payment Required"},
        "200":{description:"ok", content:{"application/json":{schema:{type:"object", properties:{product:{type:"string"}, price:{type:"number"}}}}}}
      }
     }
    },
    "/.well-known/x402":{get:{summary:"Discovery", security:[], responses:{"200":{description:"ok"}}}},
    "/openapi.json":{get:{summary:"OpenAPI", security:[], responses:{"200":{description:"ok"}}}}
   }
  };
  res.writeHead(200,{...cors,'Content-Type':'application/json'});
  res.end(JSON.stringify(spec));
  return;
 }

 if(u==="/"||u.startsWith("/?")){res.writeHead(200,{...cors,'Content-Type':'application/json'});res.end(JSON.stringify({ok:true, message:"SA MEGA X402 API LIVE v3", price:ORIGIN+"/price"}));return;}
 if(u.startsWith("/price")){res.writeHead(402,{...cors,'Content-Type':'application/json','PAYMENT-REQUIRED':x402Header(full)});res.end(JSON.stringify({error:"Payment Required"}));return;}
 res.writeHead(404,{...cors,'Content-Type':'application/json'});res.end(JSON.stringify({error:"Not found"}));
});
server.listen(PORT,()=>console.log("Listening "+PORT));
