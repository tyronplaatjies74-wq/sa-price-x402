const express = require('express');
const app = express();
app.get('/', (req,res)=>res.json({ok:true}));
app.get('/.well-known/x402.json',(req,res)=>res.json({x402Version:1,resources:[{url:"https://sa-price-x402.onrender.com/price",method:"GET",accepts:[{scheme:"exact",network:"base",amount:"10000"}]}]}));
app.get('/openapi.json',(req,res)=>res.json({openapi:"3.0.0",info:{title:"SA Price"},servers:[{url:"https://sa-price-x402.onrender.com"}],paths:{"/price":{get:{summary:"price"}}}}));
app.get('/price',(req,res)=>{if(!req.header('X-PAYMENT')) return res.status(402).json({x402Version:1,accepts:[{scheme:"exact",network:"base",amount:"10000",description:"Pay"}]});res.json({price:18.45})});
app.listen(process.env.PORT||3000);
