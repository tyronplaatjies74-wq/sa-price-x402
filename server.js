const http = require('http');
const PORT = process.env.PORT || 10000;
const ORIGIN = 'https://sa-price-x402.onrender.com';
const PAY_TO = '0x3d481FEB3d4afbE4a4E5fAf6Ff31CCdA0c9dd69';

function openapi(){
 return {
  openapi:"3.1.0",
  info:{title:"SA MEGA X402",version:"1.0.10",contact:{email:"tyronplaatjie74@gmail.com",url:ORIGIN}},
  servers:[{url:ORIGIN}],
  components:{
   securitySchemes:{x402:{type:"http",scheme:"bearer"}},
   schemas:{
    PriceResponse:{type:"object",required:["id","price"],properties:{id:{type:"string"},price:{type:"number"}}},
    PriceInput:{type:"object",required:["id"],properties:{id:{type:"string"},type:{type:"string"}}}
   }
  },
  paths:{
   "/":{get:{security:[],responses:{"200":{description:"ok",content:{"application/json":{schema:{type:"object"}}}}}}}},
   "/products":{get:{security:[],responses:{"200":{description:"ok",content:{"application/json":{schema:{type:"object"}}}}}}}},
   "/hotels":{get:{security:[],responses:{"200":{description:"ok",content:{"application/json":{schema:{type:"object"}}}}}}}},
   "/bnb":{get:{security:[],responses:{"200":{description:"ok",content:{"application/json":{schema:{type:"object"}}}}}}}},
   "/restaurants":{get:{security:[],responses:{"200":{description:"ok",content:{"application/json":{schema:{type:"object"}}}}}}}},
   "/activities":{get:{security:[],responses:{"200":{description:"ok",content:{"application/json":{schema:{type:"object"}}}}}}}},
   "/cars":{get:{security:[],responses:{"200":{description:"ok",content:{"application/json":{schema:{type:"object"}}}}}}}},
   "/all":{get:{security:[],responses:{"200":{description:"ok",content:{"application/json":{schema:{type:"object"}}}}}}}},
   "/price":{
    get:{
     security:[{x402:[]}],
     parameters:[{name:"type",in:"query",required:true,schema:{type:"string"}},{name:"id",in:"query",required:true,schema:{type:"string"}}],
     responses:{"200":{description:"ok",content:{"application/json":{schema:{"$ref":"#/components/schemas/PriceResponse"}}}},"402":{description:"pay"}}
    },
    post:{
     security:[{x402:[]}],
     requestBody:{required:true,content:{"application/json":{schema:{"$ref":"#/components/schemas/PriceInput"}}}},
     responses:{"200":{description:"ok",content:{"application/json":{schema:{"$ref":"#/components/schemas/PriceResponse"}}}},"402":{description:"pay"}}
    }
   }
  }
 };
}

const server = http.createServer((req,res)=>{
 const raw = req.url || "";
 const full = ORIGIN + raw;
 const cors = {'Access-Control-Allow-Origin':'*','Access-Control-Allow-Methods':'GET, POST, OPTIONS','Access-Control-Allow-Headers':'*','Access-Control-Expose-Headers':'PAYMENT-REQUIRED, WWW-Authenticate'};
 if(req.method==='OPTIONS'){res.writeHead(204,cors);res.end();return;}
 if(raw.includes('openapi.json')){res.writeHead(200,{'Content-Type':'application/json',...cors});res.end(JSON.stringify(openapi()));return;}
 if(raw.includes('.well-known')){res.writeHead(200,{'Content-Type':'application/json',...cors});res.end(JSON.stringify({version:1,origin:ORIGIN,openapiUrl:ORIGIN+'/openapi.json'}));return;}
 if(raw.includes('favicon')){res.writeHead(204,cors);res.end();return;}
 if(raw.includes('/price')){
  const b64 = Buffer.from(JSON.stringify({x402Version:2,error:"Payment Required",accepts:[{scheme:"exact",network:"eip155:8453",amount:"25000000",payTo:PAY_TO}]})).toString('base64');
  const exp = new Date(Date.now()+300000).toISOString();
  const wa = 'Payment id="price-1", method="GET", intent="pay", realm="'+ORIGIN+'", expires="'+exp+'", request="e30"';
  res.writeHead(402,{'Content-Type':'application/json',...cors,'PAYMENT-REQUIRED':b64,'WWW-Authenticate':wa});
  res.end(JSON.stringify({x402Version:2,error:"Payment Required"}));
  return;
 }
 res.writeHead(200,{'Content-Type':'application/json',...cors});
 res.end(JSON.stringify({ok:true}));
});

server.listen(PORT,()=>console.log('v21 LIVE e30'));
