const http = require('http');
const PORT = process.env.PORT || 10000;
const PAY_TO = '0x3d481FEB3d4afbE4a4E5fAf6Ff31CCdA0c9dd69';

// DATA (same as before)
const PRODUCTS = {}; const productNames = ["Milk","Bread","Eggs","Rice","Chicken","Apple","Beef","Cheese","Butter","Yoghurt","Tomato","Potato","Onion","Carrot","Banana","Orange","Pasta","Flour","Sugar","Salt","Oil","Coffee","Tea","Juice","Water","Cereal","Biscuits","Chocolate","Chips","Soap","Shampoo"];
productNames.forEach((n)=>{for(let j=1;j<=8;j++){let k=`${n.toLowerCase()}${j}`;PRODUCTS[k]={name:`${n} ${j}`,price:15+Math.floor(Math.random()*150)}}});
const HOTELS = {}; const hotelBase=[["The Oyster Box","Durban",8500],["One&Only","Cape Town",12500],["Saxon","Joburg",9800],["Royal Malewane","Kruger",28000],["12 Apostles","Cape Town",7800],["Palace Lost City","Sun City",6200],["The Silo","Cape Town",19500],["Beverly Hills","Durban",4200],["Mount Nelson","Cape Town",5500],["Four Seasons Westcliff","Joburg",8900],["Cape Grace","Cape Town",11000],["Singita Lebombo","Kruger",35000]];
hotelBase.forEach(h=>{for(let i=1;i<=15;i++){let k=`${h[0].toLowerCase().replace(/[^a-z]/g,'')}${i}`;HOTELS[k]={name:`${h[0]} ${i}`,city:h[1],price:h[2]+(i*100)}}});
const BNB={};for(let i=1;i<=150;i++){BNB[`bnb${i}`]={name:`Luxury BnB ${i}`,city:["Cape Town","Durban","Joburg","Stellenbosch"][i%4],price:800+(i*20)}}
const RESTAURANTS={};for(let i=1;i<=150;i++){RESTAURANTS[`rest${i}`]={name:`Restaurant ${i}`,city:"SA",price:250+i}}
const ACTIVITIES={};const acts=["Shark Cage","Safari","Wine Tasting","Table Mountain","Bungee","Paragliding","Whale Watching","Township Tour"];acts.forEach(a=>{for(let i=1;i<=20;i++){ACTIVITIES[`${a.toLowerCase().replace(/ /g,'')}${i}`]={name:`${a} ${i}`,price:500+i*50}}});
const CARS={};for(let i=1;i<=100;i++){CARS[`car${i}`]={name:`Rental Car ${i}`,price:450+i*10}}

function paywall(amount,q){return{error:"Payment Required",amount:`$${amount}`,asset:"USDC",network:"base",payTo:PAY_TO,query:q,how_to_pay:`Send $${amount} USDC on Base to ${PAY_TO}`}}

const discovery = {
 openapi:"3.0.0",
 info:{title:"SA MEGA X402 API",version:"1.0.0",description:"988 SA endpoints - hotels, BnBs, groceries, restaurants, cars, activities - all X402 paywalled"},
 servers:[{url:"https://sa-price-x402.onrender.com"}],
 paths:{
  "/":{get:{summary:"Stats",responses:{"200":{description:"OK"}}}},
  "/price":{get:{summary:"Get paid price",parameters:[{name:"type",in:"query",schema:{type:"string"}},{name:"id",in:"query",schema:{type:"string"}}],responses:{"402":{description:"Payment Required"}},"x-402":{price:"$0.10-$0.50",asset:"USDC",network:"base",payTo:PAY_TO}}}},
 "x-402":{asset:"USDC",network:"base",payTo:PAY_TO}
};

const server=http.createServer((req,res)=>{
 let url=new URL(req.url,`http://${req.headers.host}`); let path=url.pathname;
 let id=(url.searchParams.get('id')||'').toLowerCase(); let type=(url.searchParams.get('type')||'').toLowerCase();

 if(path==='/.well-known/x402' || path==='/openapi.json' || path==='/discovery'){
  res.writeHead(200,{'Content-Type':'application/json'}); res.end(JSON.stringify(discovery)); return;
 }
 if(path==='/'){
  res.writeHead(200,{'Content-Type':'application/json'});
  res.end(JSON.stringify({service:"SA MEGA X402 API",wallet:PAY_TO,stats:{products:Object.keys(PRODUCTS).length,hotels:Object.keys(HOTELS).length,bnb:Object.keys(BNB).length,restaurants:Object.keys(RESTAURANTS).length,activities:Object.keys(ACTIVITIES).length,cars:Object.keys(CARS).length,TOTAL:988},discovery:"/.well-known/x402"})); return;
 }
 if(path==='/all'){res.writeHead(200,{'Content-Type':'application/json'});res.end(JSON.stringify({PRODUCTS,HOTELS,BNB,RESTAURANTS,ACTIVITIES,CARS}));return;}
 if(path==='/products'){res.writeHead(200,{'Content-Type':'application/json'});res.end(JSON.stringify(PRODUCTS));return;}
 if(path==='/hotels'){res.writeHead(200,{'Content-Type':'application/json'});res.end(JSON.stringify(HOTELS));return;}
 if(path==='/bnb'){res.writeHead(200,{'Content-Type':'application/json'});res.end(JSON.stringify(BNB));return;}
 if(path==='/restaurants'){res.writeHead(200,{'Content-Type':'application/json'});res.end(JSON.stringify(RESTAURANTS));return;}
 if(path==='/activities'){res.writeHead(200,{'Content-Type':'application/json'});res.end(JSON.stringify(ACTIVITIES));return;}
 if(path==='/cars'){res.writeHead(200,{'Content-Type':'application/json'});res.end(JSON.stringify(CARS));return;}
 if(path==='/price'){
  let amount="0.25"; if(type==="product"||PRODUCTS[id])amount="0.10"; if(type==="hotel"||HOTELS[id])amount="0.25"; if(type==="bnb"||BNB[id])amount="0.15"; if(type==="restaurant"||RESTAURANTS[id])amount="0.15"; if(type==="activity"||ACTIVITIES[id])amount="0.35"; if(type==="car"||CARS[id])amount="0.50";
  res.writeHead(402,{'Content-Type':'application/json'}); res.end(JSON.stringify(paywall(amount,id||type))); return;
 }
 res.writeHead(404,{'Content-Type':'application/json'}); res.end(JSON.stringify({error:"Try /.well-known/x402 for discovery"}));
});
server.listen(PORT,()=>console.log("MEGA API LIVE"));
