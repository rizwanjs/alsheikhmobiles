const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const Mobile = require('./models/Mobile');
const Customer = require('./models/Customer');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/alsheikh_mobiles';
mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes

// --- Mobiles ---

app.get('/api/mobiles', async (req, res) => {
  try {
    const mobiles = await Mobile.find().sort({ createdAt: -1 });
    res.json(mobiles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/mobiles', async (req, res) => {
  try {
    const mobile = new Mobile(req.body);
    await mobile.save();

    // If bought on Udhaar, subtract from supplier's balance (negative balance = we owe them)
    if (req.body.purchasePaymentType === 'Udhaar' && req.body.sellerName) {
      let supplier = await Customer.findOne({ name: req.body.sellerName });
      const amount = Number(req.body.purchasingPrice) || 0;
      
      if (supplier) {
        supplier.balance -= amount;
        supplier.transactions.push({
          type: 'Purchase',
          amount: amount,
          description: `Supplied ${req.body.model} on Udhaar`
        });
        await supplier.save();
      } else {
        const newSupplier = new Customer({
          name: req.body.sellerName,
          balance: -amount, // Negative means Payable
          transactions: [{
            type: 'Purchase',
            amount: amount,
            description: `Supplied ${req.body.model} on Udhaar`
          }]
        });
        await newSupplier.save();
      }
    }

    res.status(201).json(mobile);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.put('/api/mobiles/:id/sell', async (req, res) => {
  try {
    const { soldTo, paymentType, sellingPrice, buyerCnic } = req.body;
    
    const mobile = await Mobile.findByIdAndUpdate(
      req.params.id,
      {
        status: 'Sold',
        soldTo,
        paymentType,
        sellingPrice,
        buyerCnic,
        soldAt: new Date()
      },
      { new: true }
    );
    if (!mobile) return res.status(404).json({ message: 'Mobile not found' });

    // Handle Ledger Logic for Udhaar
    if (paymentType === 'Udhaar' && sellingPrice > 0) {
      // Find or create customer
      let customer = await Customer.findOne({ name: soldTo });
      if (!customer) {
        customer = new Customer({ name: soldTo, balance: 0 });
      }

      // Add to balance (they owe this money)
      customer.balance += Number(sellingPrice);
      
      // Record transaction
      customer.transactions.push({
        type: 'Purchase',
        amount: Number(sellingPrice),
        description: `Bought ${mobile.model} (IMEI: ${mobile.imei}) on Udhaar`,
        mobileId: mobile._id
      });

      await customer.save();
    }

    res.json(mobile);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// --- Customers / Ledger ---

app.get('/api/customers', async (req, res) => {
  try {
    const customers = await Customer.find().sort({ updatedAt: -1 });
    res.json(customers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/customers/:id/payment', async (req, res) => {
  try {
    const { amount, description, direction } = req.body;
    const customer = await Customer.findById(req.params.id);
    
    if (!customer) return res.status(404).json({ message: 'Customer not found' });
    
    // If direction is OUT, we are paying them (increases their balance towards 0)
    // If direction is IN (default), they are paying us (decreases their balance towards 0)
    if (direction === 'OUT') {
      customer.balance += Number(amount);
    } else {
      customer.balance -= Number(amount);
    }

    customer.transactions.push({
      type: 'Payment',
      amount: Number(amount),
      description: description || (direction === 'OUT' ? 'Paid to Supplier' : 'Payment Received')
    });
    
    await customer.save();
    res.json(customer);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
