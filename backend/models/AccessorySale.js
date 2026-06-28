const mongoose = require('mongoose');

const accessorySaleSchema = new mongoose.Schema({
  items: [{
    accessoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Accessory',
      required: true
    },
    name: {
      type: String,
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    sellingPrice: {
      type: Number,
      required: true
    }
  }],
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  discount: {
    type: Number,
    default: 0
  },
  discountType: {
    type: String,
    enum: ['Flat', 'Percentage'],
    default: 'Flat'
  },
  soldTo: {
    type: String,
    required: true,
    trim: true
  },
  paymentType: {
    type: String,
    enum: ['Cash', 'Udhaar'],
    required: true
  },
  buyerPhone: {
    type: String,
    trim: true
  },
  soldAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('AccessorySale', accessorySaleSchema);
