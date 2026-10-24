const http = require('http');
const PORT = process.env.PORT || 10000;
const ORIGIN = 'https://sa-price-x402.onrender.com';
const PAY_TO = '0x3d481FEB3d4afbE4a4E5fAf6Ff31CCdA0c9dd69';
const EMAIL = 'tyronplaatjies74@gmail.com';
const USDC = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';

function x402Header(url){
  const data = {
    x402Version: 2,
    accepts: [{ scheme:"exact", network:"eip155:8453", amount:"10000", payTo:PAY_TO, asset:USDC, maxTimeoutSeconds:300 }],
    resource: { url: url, description:"SA Price", mimeType:"application/json" },
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
    'Access-Control-Expose-Headers':'PAYMENT-REQUIRED'
  };
  if(req.method==='OPTIONS'){res.writeHead(204,cors);return res.end();}

  if(u.includes('favicon')){res.writeHead(204,cors);return res.end();}
if(u.includes('x402')||u.includes('.well-known')){
res.writeHead(200,{...cors,'Content-Type':'application/json'});
res.end(JSON.stringify({x402Version:2,resources:[{url:ORIGIN+'/price',method:"GET",description:"SA prices"},{url:ORIGIN+'/products',method:"GET"}],ownershipProofs:["0x3d481FEB3d4afbE4a4E5fA1"]}));
return;
}
  if(u.includes('openapi.json')){
    const spec = {
      openapi:"3.1.0",
      info:{
        title:"SA MEGA X402 API",
        version:"1.0.15",
        description:"South Africa prices - hotels, products, BnB, restaurants",
        contact:{ name:"Tyron Plaatjie", email:EMAIL, url:ORIGIN }
      },
      servers:[{url:ORIGIN}],
      components:{
        securitySchemes:{ x402:{ type:"http", scheme:"bearer", description:"x402 payment" } }
      },
      paths:{
        "/":{ get:{ summary:"Stats FREE", security:[], responses:{"200":{description:"OK",content:{"application/json":{schema:{type:"object"}}}}}}},
        "/products":{ get:{ summary:"Products FREE", security:[], responses:{"200":{description:"OK",content:{"application/json":{schema:{type:"object"}}}}}}},
        "/hotels":{ get:{ summary:"Hotels FREE", security:[], responses:{"200":{description:"OK",content:{"application/json":{schema:{type:"object"}}}}}}},
        "/bnb":{ get:{ summary:"BnB FREE", security:[], responses:{"200":{description:"OK",content:{"application/json":{schema:{type:"object"}}}}}}},
        "/restaurants":{ get:{ summary:"Restaurants FREE", security:[], responses:{"200":{description:"OK",content:{"application/json":{schema:{type:"object"}}}}}}},
        "/activities":{ get:{ summary:"Activities FREE", security:[], responses:{"200":{description:"OK",content:{"application/json":{schema:{type:"object"}}}}}}},
        "/cars":{ get:{ summary:"Cars FREE", security:[], responses:{"200":{description:"OK",content:{"application/json":{schema:{type:"object"}}}}}}},
        "/all":{ get:{ summary:"All FREE", security:[], responses:{"200":{description:"OK",content:{"application/json":{schema:{type:"object"}}}}}}},
        "/price":{
          get:{
            summary:"Get price - PAID",
            operationId:"getPrice",
            security:[{x402:[]}],
            parameters:[
              { name:"type", in:"query", required:true, schema:{type:"string", example:"hotel"} },
              { name:"id", in:"query", required:true, schema:{type:"string", example:"theoysterbox1"} }
            ],
            responses:{
              "200":{
                description:"Price result",
                content:{
                  "application/json":{
                    schema:{
                      type:"object",
                     
