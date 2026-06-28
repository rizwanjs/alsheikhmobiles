const mongoose = require('mongoose');

const mobileSchema = new mongoose.Schema({
  model: {
    type: String,
    required: true,
    trim: true,
  },
  purchasingPrice: {
    type: Number,
    required: true,
  },
  sellingPrice: {
    type: Number,
  },
  imei: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  details: {
    type: String,
    trim: true,
  },
  status: {
    type: String,
    enum: ['Available', 'Sold'],
    default: 'Available',
  },
  purchasePaymentType: {
    type: String,
    enum: ['Cash', 'Udhaar'],
    default: 'Cash',
  },
  sellerName: {
    type: String,
    trim: true,
    required: true,
  },
  sellerCnic: {
    type: String,
    trim: true,
    required: true,
  },
  condition: {
    type: String,
    trim: true,
  },
  soldTo: {
    type: String,
    trim: true,
  },
  paymentType: {
    type: String,
    enum: ['Cash', 'Udhaar', ''],
    default: '',
  },
  buyerCnic: {
    type: String,
    trim: true,
    required: function() { return this.status === 'Sold'; }
  },
  soldAt: {
    type: Date
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Mobile', mobileSchema);
