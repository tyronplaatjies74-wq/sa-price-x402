const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors());
app.use(express.json());
app.get('/price', (req, res) => {
  res.json({
    pair: "ZAR/USD",
    price: 18.45,
    source: "SA Reserve Bank Mock",
    timestamp: new Date().toISOString(),
    x402: true,
    paymentRequired: "0.01 USDC"
  });
});
app.get('/', (req, res) => {
  res.json({ status: "SA Price x402 running", endpoints: ["/price"] });
});
app.listen(PORT, () => console.log(`Running on ${PORT}`));
