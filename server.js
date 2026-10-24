const e=require('express');
const c=require('cors');
const a=e();
a.use(c({origin:'*'}));
const U='https://sa-price-x402.onrender.com';
const R=U+'/price';
const A='0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';
const P='0x3d485A0007e23b94f9224f79507A0cbC08C3dd69';
const O={openapi:"3.0.0",info:{title:"SA Grocery Price API",version:"1.0.0"},servers:[{url:U}],paths:{"/price":{get:{summary:"Get bread price",responses:{"200":{description:"OK"}}}}}};
a.get('/openapi.json',(q,r)=>r.json(O));
a.get('/price',(q,r)=>{
const J={x402Version:2,resource:{url:R,description:"SA Grocery Price"},accepts:[{scheme:"exact",network:"base",maxAmountRequired:"100000",resource:R,description:"SA Grocery Price",mimeType:"application/json",payTo:P,maxTimeoutSeconds:60,asset:A,extra:{name:"USDC",version:"2"}}]};
const B=Buffer.from(JSON.stringify(J)).toString("base64");
if(!q.header('X-PAYMENT')&&!q.header('PAYMENT-SIGNATURE')){
r.set('PAYMENT-REQUIRED',B);
return r.status(402).json({error:"Payment Required",accepts:J.accepts});
}
r.json({item:"bread",price:18.99});
});
a.listen(process.env.PORT||3000);
