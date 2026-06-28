import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const SellMobileModal = ({ mobile, customers, onClose, onSold }) => {
  const [formData, setFormData] = useState({
    soldTo: '',
    paymentType: 'Cash',
    sellingPrice: '',
    buyerCnic: '',
    buyerPhone: ''
  });
  const [loading, setLoading] = useState(false);

  if (!mobile) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.paymentType === 'Udhaar' && !formData.sellingPrice) {
      toast.error('Selling price is required for Udhaar sales.');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.put(`http://localhost:5000/api/mobiles/${mobile._id}/sell`, formData);
      toast.success('Mobile marked as sold!');
      // Backend now returns { mobile, person } (person = customer ledger entry, or null for Cash).
      const { mobile: soldMobile, person } = response.data;
      onSold(soldMobile, person);
      onClose();
    } catch (_error) {
      console.log('Mocking sale success in demo mode...');
      
      const updatedMobile = {
        ...mobile,
        status: 'Sold',
        soldTo: formData.soldTo,
        paymentType: formData.paymentType,
        sellingPrice: Number(formData.sellingPrice),
        buyerCnic: formData.buyerCnic,
        buyerPhone: formData.buyerPhone,
        soldAt: new Date().toISOString()
      };

      let newCustomerData = null;
      if (formData.paymentType === 'Udhaar' && formData.sellingPrice) {
        const existingCustomer = customers.find(c => c.name === formData.soldTo);
        if (existingCustomer) {
          newCustomerData = {
            ...existingCustomer,
            balance: existingCustomer.balance + Number(formData.sellingPrice),
            transactions: [
              ...existingCustomer.transactions,
              { 
                type: 'Purchase', 
                amount: Number(formData.sellingPrice), 
                description: `Bought ${mobile.model} on Udhaar (Demo Mode)`, 
                date: new Date().toISOString() 
              }
            ]
          };
        } else {
          newCustomerData = {
            _id: `cust-demo-${Date.now()}`,
            name: formData.soldTo,
            balance: Number(formData.sellingPrice),
            transactions: [
              { 
                type: 'Purchase', 
                amount: Number(formData.sellingPrice), 
                description: `Bought ${mobile.model} on Udhaar (Demo Mode)`, 
                date: new Date().toISOString() 
              }
            ]
          };
        }
      }

      toast.success('Mobile marked as sold! (Demo Mode)');
      onSold(updatedMobile, newCustomerData);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-lg bg-black/80 backdrop-blur-sm transition-opacity duration-300">
      <div className="glass-card w-full max-w-md rounded-2xl overflow-hidden shadow-2xl animate-float">
        <div className="p-lg bg-primary-container text-on-primary-container flex justify-between items-center">
          <h3 className="font-headline-md font-bold text-lg">Sell Device</h3>
          <button 
            type="button" 
            className="hover:bg-white/20 rounded-full p-1 transition-colors cursor-pointer flex items-center justify-center"
            onClick={onClose}
          >
            <span className="material-symbols-outlined text-[20px] text-on-primary-container">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-lg space-y-md text-left">
          <div className="bg-surface-container-low/50 p-md rounded-xl border border-white/5 space-y-1 mb-2">
            <p className="text-[10px] text-on-surface-variant uppercase tracking-wider">Device to Sell</p>
            <h4 className="font-headline-md text-on-surface font-bold text-md">{mobile.model}</h4>
            <p className="text-xs text-on-surface-variant font-mono-data">IMEI: {mobile.imei}</p>
            <p className="text-[11px] text-secondary font-medium">Cost Price: PKR {mobile.purchasingPrice?.toLocaleString()}</p>
          </div>

          <div className="space-y-1">
            <label className="text-label-md text-on-surface-variant font-semibold text-xs">Payment Method</label>
            <select 
              name="paymentType"
              className="w-full bg-surface-container-lowest border border-white/10 rounded-lg p-2 focus:ring-2 focus:ring-primary/50 outline-none text-on-surface text-sm"
              value={formData.paymentType}
              onChange={handleChange}
            >
              <option value="Cash">Cash (Full Payment)</option>
              <option value="Udhaar">Udhaar (Khata Ledger Account)</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-label-md text-on-surface-variant font-semibold text-xs">
              {formData.paymentType === 'Udhaar' ? 'Customer Account (Select or Type New)' : 'Buyer Name'}
            </label>
            <input 
              type="text"
              name="soldTo"
              className="w-full bg-surface-container-lowest border border-white/10 rounded-lg p-2 focus:ring-2 focus:ring-primary/50 outline-none text-on-surface text-sm"
              value={formData.soldTo}
              onChange={handleChange}
              required
              placeholder="e.g. M. Rizwan"
              list="ledger-customers"
            />
            {formData.paymentType === 'Udhaar' && (
              <datalist id="ledger-customers">
                {customers.map(c => (
                  <option key={c._id} value={c.name} />
                ))}
              </datalist>
            )}
          </div>

          <div className="grid grid-cols-2 gap-md">
            <div className="space-y-1">
              <label className="text-label-md text-on-surface-variant font-semibold text-xs">Selling Price (PKR)</label>
              <input 
                type="number"
                name="sellingPrice"
                className="w-full bg-surface-container-lowest border border-white/10 rounded-lg p-2 focus:ring-2 focus:ring-primary/50 outline-none text-on-surface text-sm font-mono-data"
                value={formData.sellingPrice}
                onChange={handleChange}
                required
                placeholder={`Cost: ${mobile.purchasingPrice}`}
              />
            </div>
            <div className="space-y-1">
              <label className="text-label-md text-on-surface-variant font-semibold text-xs">Buyer Phone Number</label>
              <input 
                type="tel"
                name="buyerPhone"
                className="w-full bg-surface-container-lowest border border-white/10 rounded-lg p-2 focus:ring-2 focus:ring-primary/50 outline-none text-on-surface text-sm font-mono-data"
                value={formData.buyerPhone}
                onChange={handleChange}
                required
                placeholder="e.g. 03xx-xxxxxxx"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-label-md text-on-surface-variant font-semibold text-xs">Buyer CNIC</label>
            <input 
              type="text"
              name="buyerCnic"
              className="w-full bg-surface-container-lowest border border-white/10 rounded-lg p-2 focus:ring-2 focus:ring-primary/50 outline-none text-on-surface text-sm font-mono-data"
              value={formData.buyerCnic}
              onChange={handleChange}
              required
              placeholder="35202-xxxxxxx-x"
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
              className="px-lg py-2 rounded-lg bg-secondary text-on-secondary font-bold hover:opacity-90 transition-opacity cursor-pointer text-sm flex items-center justify-center gap-1"
              disabled={loading}
            >
              <span className="material-symbols-outlined text-[18px]">check_circle</span>
              {loading ? 'Marking Sold...' : 'Confirm Sale'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SellMobileModal;
