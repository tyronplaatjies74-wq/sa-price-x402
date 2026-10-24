const http = require('http');
const PORT = process.env.PORT || 10000;
const ORIGIN = 'https://sa-price-x402.onrender.com';
const PAY_TO = '0x3d481FEB3d4afbE4a4E5fAf6Ff31CCdA0c9dd69';

function make402(fullUrl){
  const payload = {
    x402Version: 2,
    accepts: [{
      scheme: "exact",
      network: "eip155:8453",
      amount: "25000000",
      payTo: PAY_TO,
      asset: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
      maxTimeoutSeconds: 300
    }],
    resource: { url: fullUrl, description: "price", mimeType: "application/json" },
    error: "Payment Required"
  };
  return Buffer.from(JSON.stringify(payload)).toString('base64');
}

const server = http.createServer((req,res)=>{
  const url = req.url || '/';
  const full = ORIGIN + url;
  const cors = {
    'Access-Control-Allow-Origin':'*',
    'Access-Control-Allow-Methods':'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers':'*',
    'Access-Control-Expose-Headers':'PAYMENT-REQUIRED'
  };
  if(req.method==='OPTIONS'){res.writeHead(204,cors);res.end();return;}

  if(url.includes('openapi.json')){
    res.writeHead(200,{'Content-Type':'application/json',...cors});
    res.end(JSON.stringify({
      openapi:"3.1.0",
      info:{title:"SA MEGA X402",version:"1.0.12"},
      servers:[{url:ORIGIN}],
      paths:{
        "/":{get:{security:[],responses:{"200":{description:"OK"}}}},
        "/products":{get:{security:[],responses:{"200":{description:"OK"}}}},
        "/hotels":{get:{security:[],responses:{"200":{description:"OK"}}}},
        "/bnb":{get:{security:[],responses:{"200":{description:"OK"}}}},
        "/restaurants":{get:{security:[],responses:{"200":{description:"OK"}}}},
        "/activities":{get:{security:[],responses:{"200":{description:"OK"}}}},
        "/cars":{get:{security:[],responses:{"200":{description:"OK"}}}},
        "/all":{get:{security:[],responses:{"200":{description:"OK"}}}},
        "/price":{
          get:{
            security:[{x402:[]}],
            parameters:[
              {name:"type",in:"query",required:true,schema:{type:"string"}},
              {name:"id",in:"query",required:true,schema:{type:"string"}}
            ],
            responses:{
              "200":{description:"OK",content:{"application/json":{schema:{type:"object"}}}},
              "402":{description:"Payment Required"}
            }
          },
          post:{
            security:[{x402:[]}],
            requestBody:{required:true,content:{"application/json":{schema:{type:"object",required:["id"],properties:{id:{type:"string"},type:{type:"string"}}}}}},
            responses:{"200":{description:"OK"},"402":{description:"Payment Required"}}
          }
        }
      }
    }));
    return;
  }

  if(url.includes('.well-known')){res.writeHead(200,{'Content-Type':'application/json',...cors});res.end(JSON.stringify({origin:ORIGIN}));return;}
  if(url.includes('favicon')){res.writeHead(204,cors);res.end();return;}

  if(url.includes('/price')){
    const b64 = make402(full);
    res.writeHead(402,{'Content-Type':'application/json',...cors,'PAYMENT-REQUIRED':b64});
    res.end(JSON.stringify({x402Version:2,error:"Payment Required"}));
    return;
  }

  res.writeHead(200,{'Content-Type':'application/json',...cors});
  res.end(JSON.stringify({ok:true}));
});

server.listen(PORT,()=>console.log('v24-final NO Payment challenge - only PAYMENT-REQUIRED'));
