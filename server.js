const e=require('express');
const c=require('cors');
const a=e();
a.use(c({origin:'*'}));
const U='https://sa-price-'+'x402.onrender.com';
const R=U+'/price';
const A='0x833589fCD6eD'+'b6E08f4c7C32D4f71b54bdA02913';
const P='0x00000000000000'+'000000000000000000000000';
const O={openapi:"3.0.0",info:{title:"SA Grocery Price API",version:"1.0.0",contact:{email:"tyron@test.com"}},servers:[{url:U}],paths:{"/price":{get:{parameters:[{name:"item",in:"query",required:false,schema:{type:"string"}}],responses:{"200":{description:"ok"}},"x-payment-info":{amount:"0.002",currency:"USD"}}}}};
a.get('/openapi.json',(q,r)=>r.json(O));
a.get('/price',(q,r)=>{
const J={x402Version:2,resource:{url:R,description:"SA Grocery Price",mimeType:"application/json"},accepts:[{scheme:"exact",network:"eip155:8453",amount:"2000",asset:A,payTo:P,maxTimeoutSeconds:300,extra:{name:"USD Coin",version:"2"}}]};
const B=Buffer.from(JSON.stringify(J)).toString('base64');
if(!q.header('X-PAYMENT')&&!q.header('PAYMENT-SIGNATURE'))return r.set('PAYMENT-REQUIRED',B).status(402).json(J);
r.json({item:"bread",price:18.99});
});
a.listen(process.env.PORT||3000);
