const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());
app.get('/openapi.json',(req,res)=>{
 res.json({
  openapi:"3.0.0",
  info:{title:"SA Grocery Price API",version:"1.0.0",contact:{email:"tyron@test.com"}},
  servers:[{url:"https://sa-price-x402.onrender.com"}],
  paths:{"/price":{get:{parameters:[{name:"item",in:"query",required:false,schema:{type:"string"}}],responses:{"200":{description:"ok"}},"x-payment-info":{amount:"0.002",currency:"USD"}}}}}
 });
});
app.get('/price',(req,res)=>{
 if(!req.header('X-PAYMENT')){
  return res.status(402).json({
   x402Version:1,
   error:"X-PAYMENT required",
   accepts:[{scheme:"exact",network:"eip155:8453",maxAmountRequired:"2000",asset:"0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",payTo:"0x0000000000000000000000000000000000000000",resource:"https://sa-price-x402.onrender.com/price",maxTimeoutSeconds:300}]
  });
 }
 res.json({item:"bread",price:18.99});
});
app.listen(process.env.PORT||3000);
