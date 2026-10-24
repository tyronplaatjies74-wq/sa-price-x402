const http = require('http');
const PORT = process.env.PORT || 10000;
const PAY_TO = '0x3d481FEB3d4afbE4a4E5fAf6Ff31CCdA0c9dd69';
const NETWORK = 'eip155:8453';
const ASSET = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';
const ORIGIN = 'https://sa-price-x402.onrender.com';
const EMAIL = 'tyronplaatjie74@gmail.com';

// DATA 988
const PRODUCTS={};["Milk","Bread","Eggs","Rice","Chicken","Apple","Beef","Cheese","Butter","Yoghurt","Tomato","Potato","Onion","Carrot","Banana","Orange","Pasta","Flour","Sugar","Salt","Oil","Coffee","Tea","Juice","Water","Cereal","Biscuits","Chocolate","Chips","Soap","Shampoo"].forEach(n=>{for(let j=1;j<=8;j++)PRODUCTS[`${n.toLowerCase()}${j}`]={name:`${n} ${j}`,price:15+Math.floor(Math.random()*150)}});
const HOTELS={};[["The Oyster Box","Durban",8500],["One&Only","Cape Town",12500],["Saxon","Joburg",9800],["Royal Malewane","Kruger",28000],["12 Apostles","Cape Town",7800],["Palace Lost City","Sun City",6200],["The Silo","Cape Town",19500],["Beverly Hills","Durban",4200],["Mount Nelson","Cape Town",5500],["Four Seasons Westcliff","Joburg",8900],["Cape Grace","Cape Town",11000],["Singita Lebombo","Kruger",35000]].forEach(h=>{for(let i=1;i<=15;i++)HOTELS[`${h[0].toLowerCase().replace(/[^a-z]/g,'')}${i}`]={name:`${h[0]} ${i}`,city:h[1],price:h[2]+i*100}});
const BNB={};for(let i=1;i<=150;i++)BNB[`bnb${i}`]={name:`Luxury BnB ${i}`,city:["Cape Town","Durban","Joburg","Stellenbosch"][i%4],price:800+i*20};
const REST={};for(let i=1;i<=150;i++)REST[`rest${i}`]={name:`Restaurant ${i}`,city:"SA",price:250+i};
const ACT={};["Shark Cage","Safari","Wine Tasting","Table Mountain","Bungee","Paragliding","Whale Watching","Township Tour"].forEach(a=>{for(let i=1;i<=20;i++)ACT[`${a.toLowerCase().replace(/ /g,'')}${i}`]={name:`${a} ${i}`,price:500+i*50}});
const CARS={};for(let i=1;i<=100;i++)CARS[`car${i}`]={name:`Rental Car ${i}`,price:450+i*10};

function make402(url, dollars){
  const atomic=(parseFloat(dollars)*1e6).toString();
  const payload={x402Version:2,error:"Payment Required",resource:{url,description:"SA MEGA X402 API - paid price data",mimeType:"application/json"},accepts:[{scheme:"exact",network:NETWORK,amount:atomic,payTo:PAY_TO,asset:ASSET,maxTimeoutSeconds:300,extra:{name:"USDC",version:"2"}}]};
  const json=JSON.stringify(payload); return {json,b64:Buffer.from(json).toString('base64')};
}

function openapi(){
  return {
    openapi:"3.1.0",
    info:{title:"SA MEGA X402 API",version:"1.0.1",description:"988 SA endpoints: 8 FREE catalog + 1 PAID price via x402 Base USDC. Probe with ?type=hotel&id=theoysterbox1",contact:{name:"Tyron Plaatjie",email:EMAIL,url:ORIGIN}},
    servers:[{url:ORIGIN}],
    "x-402":{asset:ASSET,network:NETWORK,payTo:PAY_TO},
    "x-discovery":{ownershipProofs:[PAY_TO]},
    x402Version:2,
    components:{
      securitySchemes:{x402:{type:"http",scheme:"bearer",bearerFormat:"x402"}},
      schemas:{
        PriceInput:{type:"object",required:["type","id"],properties:{type:{type:"string",enum:["product","hotel","bnb","restaurant","activity","car"],example:"hotel",description:"Category"},id:{type:"string",example:"theoysterbox1",description:"Item ID from free catalog"}}},
        PriceResponse:{type:"object",required:["id","type","price"],properties:{id:{type:"string",example:"theoysterbox1"},type:{type:"string",example:"hotel"},name:{type:"string",example:"The Oyster Box 1"},price:{type:"number",example:7800},currency:{type:"string",example:"ZAR"}}},
        PaymentRequired:{type:"object",properties:{x402Version:{type:"integer",example:2},resource:{type:"object"},accepts:{type:"array"}}}
      }
    },
    paths:{
      "/":{get:{operationId:"stats",summary:"Stats FREE",description:"Free",security:[],responses:{"200":{description:"OK"}}}},
      "/products":{get:{operationId:"products",summary:"Groceries FREE",security:[],responses:{"200":{description:"OK"}}}},
      "/hotels":{get:{operationId:"hotels",summary:"Hotels FREE",security:[],responses:{"200":{description:"OK"}}}},
      "/bnb":{get:{operationId:"bnb",summary:"BnB FREE",security:[],responses:{"200":{description:"OK"}}}},
      "/restaurants":{get:{operationId:"restaurants",summary:"Restaurants FREE",security:[],responses:{"200":{description:"OK"}}}},
      "/activities":{get:{operationId:"activities",summary:"Activities FREE",security:[],responses:{"200":{description:"OK"}}}},
      "/cars":{get:{operationId:"cars",summary:"Cars FREE",security:[],responses:{"200":{description:"OK"}}}},
      "/all":{get:{operationId:"all",summary:"All 988 FREE",security:[],responses:{"200":{description:"OK"}}}},
      "/price":{
        get:{
          operationId:"getPrice",
          summary:"Get price PAID x402",
          description:"PAID endpoint. Returns 402 with PAYMENT-REQUIRED header if no payment. Free catalog IDs from /hotels etc. Example: ?type=hotel&id=theoysterbox1",
          security:[{x402:[]}],
          "x-payment-info":{price:{mode:"fixed",currency:"USDC",amount:"25000000",network:NETWORK,asset:ASSET,payTo:PAY_TO},protocols:[{x402:{}}]},
          // FIX for "Missing input schema" - both param schema AND requestBody
          parameters:[
            {name:"type",in:"query",required:true,description:"Category",example:"hotel",schema:{type:"string",enum:["product","hotel","bnb","restaurant","activity","car"],example:"hotel",default:"hotel"}},
            {name:"id",in:"query",required:true,description:"Item ID from /hotels, /products etc",example:"theoysterbox1",schema:{type:"string",example:"theoysterbox1",default:"theoysterbox1"}}
          ],
          responses:{
            "200":{description:"Price after x402 payment",content:{"application/json":{schema:{"$ref":"#/components/schemas/PriceResponse"}}}},
            "402":{description:"Payment Required x402 v2",content:{"application/json":{schema:{"$ref":"#/components/schemas/PaymentRequired"}}}}
          }
        },
        post:{
          operationId:"getPricePost",
          summary:"Get price PAID x402 (POST)",
          description:"Same as GET but with JSON body - for agents that POST",
          security:[{x402:[]}],
          "x-payment-info":{price:{mode:"fixed",currency:"USDC",amount:"25000000",network:NETWORK,asset:ASSET,payTo:PAY_TO},protocols:[{x402:{}}]},
          requestBody:{required:true,content:{"application/json":{schema:{"$ref":"#/components/schemas/PriceInput"},examples:{example:{value:{type:"hotel",id:"theoysterbox1"}}}}}},
          responses:{
            "200":{description:"Price after payment",content:{"application/json":{schema:{"$ref":"#/components/schemas/PriceResponse"}}}},
            "402":{description:"Payment Required",content:{"application/json":{schema:{"$ref":"#/components/schemas/PaymentRequired"}}}}
          }
        }
      }
    }
  };
}

const server=http.createServer((req,res)=>{
  const url=new URL(req.url,`http://${req.headers.host}`);
  const path=url.pathname;
  const full=`${ORIGIN}${req.url}`;
  const cors={'Access-Control-Allow-Origin':'*','Access-Control-Allow-Methods':'GET, POST, OPTIONS','Access-Control-Allow-Headers':'*','Access-Control-Expose-Headers':'PAYMENT-REQUIRED, WWW-Authenticate'};
  if(req.method==='OPTIONS'){res.writeHead(204,cors);res.end();return;}

  if(path==='/openapi.json'||path==='/.well-known/openapi.json'){res.writeHead(200,{'Content-Type':'application/json',...cors});res.end(JSON.stringify(openapi()));return;}
  if(path==='/.well-known/x402'){res.writeHead(200,{'Content-Type':'application/json',...cors});res.end(JSON.stringify({version:1,x402Version:2,name:"SA MEGA X402 API",description:"988 endpoints",openapiUrl:`${ORIGIN}/openapi.json`,origin:ORIGIN,payTo:PAY_TO,network:NETWORK,asset:ASSET,ownershipProofs:[PAY_TO],contact:{email:EMAIL},resources:[{url:`${ORIGIN}/price`,method:"GET",description:"Paid price $10-$50",authMode:"paid"}]}));return;}

  if(path==='/'){res.writeHead(200,{'Content-Type':'application/json',...cors});res.end(JSON.stringify({service:"SA MEGA X402 API",wallet:PAY_TO,email:EMAIL,stats:{TOTAL:988},openapi:"/openapi.json",wellknown:"/.well-known/x402"}));return;}
  if(path==='/products'){res.writeHead(200,{'Content-Type':'application/json',...cors});res.end(JSON.stringify(PRODUCTS));return;}
  if(path==='/hotels'){res.writeHead(200,{'Content-Type':'application/json',...cors});res.end(JSON.stringify(HOTELS));return;}
  if(path==='/bnb'){res.writeHead(200,{'Content-Type':'application/json',...cors});res.end(JSON.stringify(BNB));return;}
  if(path==='/restaurants'){res.writeHead(200,{'Content-Type':'application/json',...cors});res.end(JSON.stringify(REST));return;}
  if(path==='/activities'){res.writeHead(200,{'Content-Type':'application/json',...cors});res.end(JSON.stringify(ACT));return;}
  if(path==='/cars'){res.writeHead(200,{'Content-Type':'application/json',...cors});res.end(JSON.stringify(CARS));return;}
  if(path==='/all'){res.writeHead(200,{'Content-Type':'application/json',...cors});res.end(JSON.stringify({PRODUCTS,HOTELS,BNB,REST,ACT,CARS}));return;}

  // PAID - RULE 1 & 2: ALWAYS 402 FIRST, NO VALIDATION BEFORE PAYWALL
  if(path==='/price'){
    const type=(url.searchParams.get('type')||'hotel').toLowerCase();
    let dollars="25"; if(type==="product")dollars="10"; if(type==="bnb")dollars="15"; if(type==="restaurant")dollars="15"; if(type==="activity")dollars="35"; if(type==="car")dollars="50";
    const {json,b64}=make402(full,dollars);
    res.writeHead(402,{'Content-Type':'application/json',...cors,'PAYMENT-REQUIRED':b64,'WWW-Authenticate':`x402 ${b64}`}); res.end(json); return;
  }

  res.writeHead(404,{'Content-Type':'application/json',...cors}); res.end(JSON.stringify({error:"Not found"}));
});
server.listen(PORT,()=>console.log(`MEGA v9 LIVE - email + input schema fixed`));
