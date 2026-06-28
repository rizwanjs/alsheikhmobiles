import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { API_URL } from '../config';

const AddMobileForm = ({ onMobileAdded, customers, onClose }) => {
  const [formData, setFormData] = useState({
    model: '',
    purchasingPrice: '',
    imei: '',
    details: '',
    sellerName: '',
    sellerCnic: '',
    sellerPhone: '',
    condition: 'Brand New (Box Packed)',
    purchasePaymentType: 'Cash'
  });
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const availableSlots = 4 - images.length;
    const filesToProcess = files.slice(0, availableSlots);

    filesToProcess.forEach(file => {
      if (file.size > 3 * 1024 * 1024) {
        toast.error(`${file.name} is too large. Max size is 3MB.`);
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImages(prev => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveImage = (indexToRemove) => {
    setImages(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/api/mobiles`, { ...formData, images });
      toast.success('Mobile added successfully!');
      // Backend now returns { mobile, person } (person = supplier ledger entry, or null for Cash).
      const { mobile, person } = response.data;
      if (onMobileAdded) onMobileAdded(mobile, person);
    } catch (_error) {
      console.log('Mocking mobile addition success...');
      const newMobile = {
        _id: `mobile-demo-${Date.now()}`,
        ...formData,
        purchasingPrice: Number(formData.purchasingPrice),
        status: 'Available',
        images
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
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center md:p-lg bg-black/80 backdrop-blur-sm">
      <div className="glass-card w-full md:max-w-2xl md:rounded-2xl rounded-t-2xl overflow-hidden shadow-2xl md:animate-float md:my-auto max-h-[95dvh] md:max-h-[90vh] flex flex-col">
        <div className="p-lg bg-primary-container text-on-primary-container flex justify-between items-center shrink-0">
          <h3 className="font-headline-md font-bold text-lg">New Inventory Entry</h3>
          <button 
            type="button" 
            className="hover:bg-white/20 rounded-full p-1 transition-colors cursor-pointer flex items-center justify-center"
            onClick={onClose}
          >
            <span className="material-symbols-outlined text-[20px] text-on-primary-container">close</span>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-lg space-y-md text-left overflow-y-auto custom-scrollbar flex-1">
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

          <div className="grid grid-cols-2 gap-md">
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
              <label className="text-label-md text-on-surface-variant font-semibold text-xs">Seller Phone Number</label>
              <input 
                type="tel" 
                name="sellerPhone"
                className="w-full bg-surface-container-lowest border border-white/10 rounded-lg p-2 focus:ring-2 focus:ring-primary/50 outline-none text-on-surface text-sm font-mono-data"
                value={formData.sellerPhone}
                onChange={handleChange}
                required
                placeholder="e.g. 03xx-xxxxxxx"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-md">
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

          <div className="space-y-1">
            <label className="text-label-md text-on-surface-variant font-semibold text-xs block mb-1">
              Upload Device Pictures (Max 4)
            </label>
            <div className="flex items-center gap-md">
              <label className={`flex flex-col items-center justify-center w-20 h-20 border border-dashed border-white/20 hover:border-primary/50 rounded-xl cursor-pointer bg-surface-container-lowest transition-colors group ${images.length >= 4 ? 'opacity-50 cursor-not-allowed' : ''}`}>
                <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors text-[20px]">add_a_photo</span>
                <span className="text-[9px] text-on-surface-variant mt-1">Add Photo</span>
                <input 
                  type="file" 
                  multiple 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleImageUpload} 
                  disabled={images.length >= 4}
                />
              </label>
              
              <div className="flex flex-1 gap-sm overflow-x-auto py-1">
                {images.map((img, idx) => (
                  <div key={idx} className="relative w-20 h-20 rounded-xl overflow-hidden border border-white/10 shrink-0 group">
                    <img src={img} alt="thumbnail" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-error cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
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
