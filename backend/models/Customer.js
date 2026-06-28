const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  phone: {
    type: String,
    trim: true,
  },
  balance: {
    type: Number,
    default: 0,
  },
  transactions: [{
    type: {
      type: String,
      enum: ['Purchase', 'Payment'],
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    date: {
      type: Date,
      default: Date.now
    },
    description: String,
    mobileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Mobile'
    }
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Customer', customerSchema);
