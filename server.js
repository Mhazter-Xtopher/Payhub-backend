const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const userBalances = {}; // Temporary storage. Resets when server sleeps

app.post('/api/verify-payment', async (req, res) => {
  const { reference, email } = req.body;

  try {
    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.data.status && response.data.status === 'success') {
      const amount = response.data.amount / 100;

      if (!userBalances[email]) userBalances[email] = 0;
      userBalances[email] += amount;

      res.json({
        success: true,
        amount,
        newBalance: userBalances[email]
      });
    } else {
      res.json({ success: false, message: 'Payment not successful' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));





