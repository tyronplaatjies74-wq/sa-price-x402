const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());

const PAY_TO = '0x3d485A0007e23b94f9224f79507A0cbC08C3dd69';

// --- GROCERIES ( $0.10 ) ---
const PRODUCTS = {
  bread: { name:'Bread', price:18.5, shop:'Shoprite', unit:'loaf' },
  milk: { name:'Milk', price:32.99, shop:'Woolworths', unit:'1L' },
  eggs: { name:'Eggs', price:89.99, shop:'Checkers', unit:'30' },
  maize: { name:'Maize 10kg', price:125, shop:'Boxer', unit:'10kg' },
  oil: { name:'Cooking Oil', price:52.5, shop:'Pick n Pay', unit:'750ml' }
};

// --- 5-STAR HOTELS ( $0.25 ) ---
const HOTELS = {
  oysterbox: { name:'The Oyster Box', city:'Durban', price:8500, zar:'R8,500/night', stars:5 },
  onenonly: { name:'One&Only Cape Town', city:'Cape Town', price:12500, zar:'R12,500/night', stars:5 },
  saxon: { name:'Saxon Hotel', city:'Johannesburg', price:9800, zar:'R9,800/night', stars:5 },
  royalmalewane: { name:'Royal Malewane', city:'Kruger', price:28000, zar:'R28,000/night', stars:5 },
  twelveapostles: { name:'12 Apostles', city:'Cape Town', price:7800, zar:'R7,800/night', stars:5 },
  palace: { name:'Palace Lost City', city:'Sun City', price:6200, zar:'R6,200/night', stars:5 },
  silo: { name:'The Silo', city:'Cape Town', price:19500, zar:'R19,500/night', stars:5 }
};

app.get('/', (req,res)=>{
  res.json({
    message:'SA X402 API - Groceries + 5-Star Hotels + BnB',
    groceries: { list:'/products', price:'/price?item=milk ($0.10)' },
    hotels: { list:'/hotels', price:'/price?hotel=oysterbox ($0.25)' },
    bnb: '/bnb ($0.35)',
    payTo: PAY_TO,
    network: 'Base - USDC'
  });
});

app.get('/products', (req,res)=> res.json(PRODUCTS));
app.get('/hotels', (req,res)=> res.json(HOTELS));

app.get('/price', (req,res)=>{
  const q = (req.query.item || req.query.hotel || 'bread').toLowerCase();
  const hotel = HOTELS[q];
  
  if(hotel){
    res.status(402).json({
      error:'Payment Required - 5-Star Hotel',
      x402:{ amount:'0.25', currency:'USDC', network:'base', chainId:8453, payTo:PAY_TO, hotel:q, data:hotel }
    });
  } else {
    const product = PRODUCTS[q] || PRODUCTS['bread'];
    res.status(402).json({
      error:'Payment Required - Grocery',
      x402:{ amount:'0.10', currency:'USDC', network:'base', chainId:8453, payTo:PAY_TO, product:q, data:product }
    });
  }
});

app.get('/bnb', (req,res)=>{
  res.status(402).json({
    error:'Payment Required - Luxury BnB',
    x402:{ amount:'0.35', currency:'USDC', network:'base', chainId:8453, payTo:PAY_TO, category:'BnB', note:'R2,500-R8,000/night - Wellington & Cape Town' }
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=>console.log('SA COMBINED X402 LIVE - '+PAY_TO));
