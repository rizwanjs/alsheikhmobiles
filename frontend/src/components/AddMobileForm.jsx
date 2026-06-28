import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const AddMobileForm = ({ onMobileAdded, customers, onClose }) => {
  const [formData, setFormData] = useState({
    model: '',
    purchasingPrice: '',
    imei: '',
    details: '',
    sellerName: '',
    sellerCnic: '',
    condition: 'Brand New (Box Packed)',
    purchasePaymentType: 'Cash'
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/mobiles', formData);
      toast.success('Mobile added successfully!');
      if (onMobileAdded) onMobileAdded(response.data);
    } catch (error) {
      console.log('Mocking mobile addition success...');
      const newMobile = {
        _id: `mobile-demo-${Date.now()}`,
        ...formData,
        purchasingPrice: Number(formData.purchasingPrice),
        status: 'Available'
      };

      let newSupplierData = null;
      if (formData.purchasePaymentType === 'Udhaar' && formData.sellerName) {
        const amount = Number(formData.purchasingPrice) || 0;
        const existingSupplier = customers.find(c => c.name === formData.sellerName);
        if (existingSupplier) {
          newSupplierData = {
            ...existingSupplier,
            balance: existingSupplier.balance - amount, // Subtract from balance because we owe them
            transactions: [
              ...existingSupplier.transactions,
              { type: 'Purchase', amount: amount, description: `Supplied ${formData.model} on Udhaar (Demo)`, date: new Date().toISOString() }
            ]
          };
        } else {
          newSupplierData = {
            _id: `supplier-demo-${Date.now()}`,
            name: formData.sellerName,
            balance: -amount,
            transactions: [
              { type: 'Purchase', amount: amount, description: `Supplied ${formData.model} on Udhaar (Demo)`, date: new Date().toISOString() }
            ]
          };
        }
      }

      toast.success('Mobile added successfully! (Demo Mode)');
      if (onMobileAdded) onMobileAdded(newMobile, newSupplierData);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-lg bg-black/80 backdrop-blur-sm transition-opacity duration-300">
      <div className="glass-card w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl animate-float">
        <div className="p-lg bg-primary-container text-on-primary-container flex justify-between items-center">
          <h3 className="font-headline-md font-bold text-lg">New Inventory Entry</h3>
          <button 
            type="button" 
            className="hover:bg-white/20 rounded-full p-1 transition-colors cursor-pointer flex items-center justify-center"
            onClick={onClose}
          >
            <span className="material-symbols-outlined text-[20px] text-on-primary-container">close</span>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-lg space-y-md text-left">
          <div className="grid grid-cols-2 gap-md">
            <div className="space-y-1">
              <label className="text-label-md text-on-surface-variant font-semibold text-xs">Model Name</label>
              <input 
                type="text" 
                name="model"
                className="w-full bg-surface-container-lowest border border-white/10 rounded-lg p-2 focus:ring-2 focus:ring-primary/50 outline-none text-on-surface text-sm"
                value={formData.model}
                onChange={handleChange}
                required
                placeholder="e.g. iPhone 15 Pro Max"
              />
            </div>
            <div className="space-y-1">
              <label className="text-label-md text-on-surface-variant font-semibold text-xs">IMEI Number</label>
              <input 
                type="text" 
                name="imei"
                className="w-full bg-surface-container-lowest border border-white/10 rounded-lg p-2 focus:ring-2 focus:ring-primary/50 outline-none text-on-surface text-sm font-mono-data"
                value={formData.imei}
                onChange={handleChange}
                required
                placeholder="15-digit IMEI"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-md">
            <div className="space-y-1">
              <label className="text-label-md text-on-surface-variant font-semibold text-xs">Buying Price (PKR)</label>
              <input 
                type="number" 
                name="purchasingPrice"
                className="w-full bg-surface-container-lowest border border-white/10 rounded-lg p-2 focus:ring-2 focus:ring-primary/50 outline-none text-on-surface text-sm font-mono-data"
                value={formData.purchasingPrice}
                onChange={handleChange}
                required
                placeholder="e.g. 350000"
              />
            </div>
            <div className="space-y-1">
              <label className="text-label-md text-on-surface-variant font-semibold text-xs">Condition</label>
              <select 
                name="condition"
                className="w-full bg-surface-container-lowest border border-white/10 rounded-lg p-2 focus:ring-2 focus:ring-primary/50 outline-none text-on-surface text-sm"
                value={formData.condition}
                onChange={handleChange}
              >
                <option value="Brand New (Box Packed)">Brand New (Box Packed)</option>
                <option value="Like New (10/10)">Like New (10/10)</option>
                <option value="Good (9/10)">Good (9/10)</option>
                <option value="Fair (8/10)">Fair (8/10)</option>
                <option value="Rough">Rough</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-md">
            <div className="space-y-1">
              <label className="text-label-md text-on-surface-variant font-semibold text-xs">Seller Name</label>
              <input 
                type="text" 
                name="sellerName"
                className="w-full bg-surface-container-lowest border border-white/10 rounded-lg p-2 focus:ring-2 focus:ring-primary/50 outline-none text-on-surface text-sm"
                value={formData.sellerName}
                onChange={handleChange}
                required
                placeholder="Seller Name"
              />
            </div>
            <div className="space-y-1">
              <label className="text-label-md text-on-surface-variant font-semibold text-xs">Seller CNIC</label>
              <input 
                type="text" 
                name="sellerCnic"
                className="w-full bg-surface-container-lowest border border-white/10 rounded-lg p-2 focus:ring-2 focus:ring-primary/50 outline-none text-on-surface text-sm font-mono-data"
                value={formData.sellerCnic}
                onChange={handleChange}
                required
                placeholder="35202-xxxxxxx-x"
              />
            </div>
            <div className="space-y-1">
              <label className="text-label-md text-on-surface-variant font-semibold text-xs">Purchase Payment Type</label>
              <select 
                name="purchasePaymentType"
                className="w-full bg-surface-container-lowest border border-white/10 rounded-lg p-2 focus:ring-2 focus:ring-primary/50 outline-none text-on-surface text-sm"
                value={formData.purchasePaymentType}
                onChange={handleChange}
              >
                <option value="Cash">Cash</option>
                <option value="Udhaar">Udhaar (We Owe)</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-label-md text-on-surface-variant font-semibold text-xs">Additional Details</label>
            <textarea 
              name="details"
              className="w-full bg-surface-container-lowest border border-white/10 rounded-lg p-2 focus:ring-2 focus:ring-primary/50 outline-none text-on-surface text-sm min-h-[60px]"
              value={formData.details}
              onChange={handleChange}
              placeholder="e.g. Color: Natural Titanium, PTA Approved, Box and Charging Cable available..."
            />
          </div>

          <div className="pt-lg flex justify-end gap-md">
            <button 
              type="button" 
              className="px-lg py-2 rounded-lg border border-white/10 hover:bg-white/5 transition-colors cursor-pointer text-sm font-semibold" 
              onClick={onClose}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="px-lg py-2 rounded-lg bg-primary-container text-on-primary-container font-bold hover:opacity-90 transition-opacity cursor-pointer text-sm flex items-center gap-1"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Mobile Entry'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddMobileForm;
