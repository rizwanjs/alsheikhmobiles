const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { connectDB, Mobile, Customer, Accessory, AccessorySale } = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB (or local JSON fallback)
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/alsheikh_mobiles';
connectDB(MONGODB_URI);

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

    let supplier = null;

    // If bought on Udhaar, subtract from supplier's balance (negative balance = we owe them)
    if (req.body.purchasePaymentType === 'Udhaar' && req.body.sellerName) {
      const amount = Number(req.body.purchasingPrice) || 0;
      supplier = await Customer.findOne({ name: req.body.sellerName });

      if (supplier) {
        supplier.balance -= amount;
        supplier.transactions.push({
          type: 'Purchase',
          amount: amount,
          description: `Supplied ${req.body.model} on Udhaar`
        });
        await supplier.save();
      } else {
        supplier = new Customer({
          name: req.body.sellerName,
          balance: -amount, // Negative means Payable
          transactions: [{
            type: 'Purchase',
            amount: amount,
            description: `Supplied ${req.body.model} on Udhaar`
          }]
        });
        await supplier.save();
      }
    }

    // Return BOTH the mobile and the (possibly updated/created) supplier ledger entry
    // so the frontend can keep its local state in sync in real mode.
    res.status(201).json({ mobile, person: supplier });
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
        sellingPrice: Number(sellingPrice) || 0,
        buyerCnic,
        soldAt: new Date()
      },
      { new: true, runValidators: true } // runValidators enforces buyerCnic required-on-sold
    );
    if (!mobile) return res.status(404).json({ message: 'Mobile not found' });

    let customer = null;

    // Handle Ledger Logic for Udhaar
    // NOTE: coerce sellingPrice to Number before comparing — previously a string like "0"
    // still passed the `> 0` check could misbehave; Number() makes it deterministic.
    if (paymentType === 'Udhaar' && Number(sellingPrice) > 0) {
      // Find or create customer
      customer = await Customer.findOne({ name: soldTo });
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

    // Return BOTH the updated mobile and the customer ledger entry so the
    // frontend can sync its Khata state in real mode (not just demo mode).
    res.json({ mobile, person: customer });
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

app.post('/api/customers', async (req, res) => {
  try {
    const { name, phone, type, balance } = req.body;

    const existing = await Customer.findOne({ name });
    if (existing) {
      return res.status(400).json({ message: 'A ledger account with this name already exists.' });
    }

    const balNum = Math.abs(Number(balance) || 0);
    const actualBalance = type === 'supplier' ? -balNum : balNum;

    const customer = new Customer({
      name: name.trim(),
      phone: phone ? phone.trim() : '',
      balance: actualBalance,
      transactions: balNum !== 0 ? [{
        type: 'Purchase',
        amount: balNum,
        description: `Opening Balance (${type === 'supplier' ? 'You Owe Them' : 'They Owe You'})`,
        date: new Date()
      }] : []
    });

    await customer.save();
    res.status(201).json(customer);
  } catch (error) {
    res.status(400).json({ message: error.message });
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

// --- Accessories & POS ---

app.get('/api/accessories', async (req, res) => {
  try {
    const accessories = await Accessory.find().sort({ createdAt: -1 });
    res.json(accessories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/accessories', async (req, res) => {
  try {
    const accessory = new Accessory(req.body);
    await accessory.save();
    res.status(201).json(accessory);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.put('/api/accessories/:id', async (req, res) => {
  try {
    const accessory = await Accessory.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!accessory) return res.status(404).json({ message: 'Accessory not found' });
    res.json(accessory);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.post('/api/pos/checkout', async (req, res) => {
  try {
    const { items, totalAmount, soldTo, paymentType, buyerPhone, discount, discountType } = req.body;
    
    // 1. Deduct stock for each item
    for (const item of items) {
      const acc = await Accessory.findById(item.accessoryId);
      if (acc) {
        acc.stock = Math.max(0, acc.stock - item.quantity);
        await acc.save();
      }
    }

    // 2. Create AccessorySale record
    const sale = new AccessorySale({
      items,
      totalAmount: Number(totalAmount),
      discount: Number(discount) || 0,
      discountType: discountType || 'Flat',
      soldTo,
      paymentType,
      buyerPhone,
      soldAt: new Date()
    });
    await sale.save();

    let customer = null;

    // 3. Ledger Logic for Udhaar
    if (paymentType === 'Udhaar' && Number(totalAmount) > 0) {
      customer = await Customer.findOne({ name: soldTo });
      if (!customer) {
        customer = new Customer({ name: soldTo, balance: 0, phone: buyerPhone || '' });
      }
      customer.balance += Number(totalAmount);
      customer.transactions.push({
        type: 'Purchase',
        amount: Number(totalAmount),
        description: `Bought Accessories (POS Sale #${sale._id.toString().slice(-6)}) on Udhaar`,
        date: new Date()
      });
      await customer.save();
    }

    res.status(201).json({ sale, person: customer });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
