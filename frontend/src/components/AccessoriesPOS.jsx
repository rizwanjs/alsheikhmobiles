import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { API_URL } from '../config';

const AccessoryCategories = ['All', 'Charger', 'Cable', 'Glass', 'Cover', 'Earphones', 'Powerbank', 'Other'];

const AccessoriesPOS = ({ customers, onAddPerson, onPayment }) => {
  const [accessories, setAccessories] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showReceipt, setShowReceipt] = useState(null); // stores the successful sale object for receipt display
  const [editingAccessory, setEditingAccessory] = useState(null);

  // Form states for new/edit accessory
  const [accessoryForm, setAccessoryForm] = useState({
    name: '',
    category: 'Charger',
    costPrice: '',
    sellingPrice: '',
    stock: '',
    details: ''
  });

  // POS Checkout form state
  const [checkoutForm, setCheckoutForm] = useState({
    soldTo: '',
    paymentType: 'Cash',
    buyerPhone: ''
  });
  const [discount, setDiscount] = useState('');
  const [discountType, setDiscountType] = useState('Flat'); // 'Flat' | 'Percentage'
  const [processingCheckout, setProcessingCheckout] = useState(false);

  // Fetch accessories
  const fetchAccessories = () => {
    setLoading(true);
    axios.get(`${API_URL}/api/accessories`)
      .then(res => setAccessories(res.data))
      .catch(() => generateDemoAccessories())
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAccessories();
  }, []);

  // Demo fallback data if offline or backend empty
  const generateDemoAccessories = () => {
    const demoData = [
      { _id: 'acc-1', name: 'Anker PowerPort III 20W', category: 'Charger', costPrice: 1500, sellingPrice: 2200, stock: 12, details: 'USB-C Fast Charger' },
      { _id: 'acc-2', name: 'Samsung USB-C to USB-C 1m', category: 'Cable', costPrice: 600, sellingPrice: 999, stock: 25, details: 'Original cable black' },
      { _id: 'acc-3', name: 'iPhone 15 Pro Max Privacy Glass', category: 'Glass', costPrice: 400, sellingPrice: 850, stock: 8, details: '9H hardness full glue' },
      { _id: 'acc-4', name: 'Spigen Ultra Hybrid Case iPhone 15', category: 'Cover', costPrice: 1800, sellingPrice: 2800, stock: 5, details: 'Clear back cover' },
      { _id: 'acc-5', name: 'Redmi Buds 5 Pro', category: 'Earphones', costPrice: 6500, sellingPrice: 8990, stock: 6, details: 'Active Noise Cancellation' }
    ];
    setAccessories(demoData);
  };

  // Filter products
  const filteredAccessories = useMemo(() => {
    return accessories.filter(a => {
      const matchSearch = a.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (a.details && a.details.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchCategory = activeCategory === 'All' || a.category === activeCategory;
      return matchSearch && matchCategory;
    });
  }, [accessories, searchQuery, activeCategory]);

  // Cart operations
  const addToCart = (accessory) => {
    if (accessory.stock <= 0) {
      toast.error('Product is out of stock!');
      return;
    }

    const existingIndex = cart.findIndex(item => item._id === accessory._id);
    if (existingIndex >= 0) {
      const currentQty = cart[existingIndex].quantity;
      if (currentQty >= accessory.stock) {
        toast.error(`Only ${accessory.stock} units available in stock.`);
        return;
      }
      const newCart = [...cart];
      newCart[existingIndex].quantity += 1;
      setCart(newCart);
    } else {
      setCart([...cart, { ...accessory, quantity: 1 }]);
    }
  };

  const updateQuantity = (accessoryId, change) => {
    const item = cart.find(i => i._id === accessoryId);
    const original = accessories.find(a => a._id === accessoryId);
    if (!item || !original) return;

    const newQty = item.quantity + change;
    if (newQty <= 0) {
      setCart(cart.filter(i => i._id !== accessoryId));
    } else if (newQty > original.stock) {
      toast.error(`Only ${original.stock} units available in stock.`);
    } else {
      setCart(cart.map(i => i._id === accessoryId ? { ...i, quantity: newQty } : i));
    }
  };

  const cartTotal = useMemo(() => {
    return cart.reduce((acc, item) => acc + (item.sellingPrice * item.quantity), 0);
  }, [cart]);

  const finalTotal = useMemo(() => {
    const subtotal = cartTotal;
    const discVal = Number(discount) || 0;
    if (discVal <= 0) return subtotal;
    if (discountType === 'Percentage') {
      return Math.max(0, subtotal - (subtotal * (discVal / 100)));
    } else {
      return Math.max(0, subtotal - discVal);
    }
  }, [cartTotal, discount, discountType]);

  // Add or Edit Accessory Submit
  const handleAccessorySubmit = async (e) => {
    e.preventDefault();
    const payload = {
      name: accessoryForm.name,
      category: accessoryForm.category,
      costPrice: Number(accessoryForm.costPrice),
      sellingPrice: Number(accessoryForm.sellingPrice),
      stock: Number(accessoryForm.stock),
      details: accessoryForm.details
    };

    try {
      if (editingAccessory) {
        const res = await axios.put(`${API_URL}/api/accessories/${editingAccessory._id}`, payload);
        toast.success('Accessory updated successfully!');
        setAccessories(accessories.map(a => a._id === editingAccessory._id ? res.data : a));
      } else {
        const res = await axios.post(`${API_URL}/api/accessories`, payload);
        toast.success('Accessory added successfully!');
        setAccessories([res.data, ...accessories]);
      }
      setEditingAccessory(null);
      setShowAddModal(false);
      setAccessoryForm({ name: '', category: 'Charger', costPrice: '', sellingPrice: '', stock: '', details: '' });
    } catch (err) {
      // Fallback/Mock Mode
      const mockResult = {
        _id: editingAccessory ? editingAccessory._id : `acc-demo-${Date.now()}`,
        ...payload
      };
      if (editingAccessory) {
        setAccessories(accessories.map(a => a._id === editingAccessory._id ? mockResult : a));
        toast.success('Accessory updated (Demo Mode)');
      } else {
        setAccessories([mockResult, ...accessories]);
        toast.success('Accessory added (Demo Mode)');
      }
      setEditingAccessory(null);
      setShowAddModal(false);
      setAccessoryForm({ name: '', category: 'Charger', costPrice: '', sellingPrice: '', stock: '', details: '' });
    }
  };

  // Checkout
  const handleCheckoutSubmit = async (e) => {
    e.preventDefault();
    if (cart.length === 0) {
      toast.error('Cart is empty!');
      return;
    }
    if (!checkoutForm.soldTo) {
      toast.error('Customer name is required!');
      return;
    }
    if (checkoutForm.paymentType === 'Udhaar' && !checkoutForm.soldTo) {
      toast.error('Udhaar requires a customer name!');
      return;
    }

    setProcessingCheckout(true);
    const checkoutItems = cart.map(item => ({
      accessoryId: item._id,
      name: item.name,
      quantity: item.quantity,
      sellingPrice: item.sellingPrice
    }));

    const payload = {
      items: checkoutItems,
      totalAmount: finalTotal,
      discount: Number(discount) || 0,
      discountType,
      soldTo: checkoutForm.soldTo,
      paymentType: checkoutForm.paymentType,
      buyerPhone: checkoutForm.buyerPhone
    };

    try {
      const res = await axios.post(`${API_URL}/api/pos/checkout`, payload);
      toast.success('POS Sale completed successfully!');
      
      // Update local accessories stock
      fetchAccessories();
      
      // If backend returned updated Ledger profile, notify parent
      if (res.data.person && onPayment) {
        onPayment(res.data.person);
      }
      
      // Reset cart and show printable receipt
      setShowReceipt(res.data.sale || { ...payload, _id: `sale-demo-${Date.now()}` });
      setCart([]);
      setDiscount('');
      setDiscountType('Flat');
      setCheckoutForm({ soldTo: '', paymentType: 'Cash', buyerPhone: '' });
    } catch (err) {
      // Mock Mode complete sale
      toast.success('POS Sale completed! (Demo Mode)');
      
      // Deduct stock locally
      const updatedAccessories = accessories.map(a => {
        const cartItem = cart.find(i => i._id === a._id);
        if (cartItem) {
          return { ...a, stock: Math.max(0, a.stock - cartItem.quantity) };
        }
        return a;
      });
      setAccessories(updatedAccessories);

      // Trigger local Ledger update if Udhaar
      if (checkoutForm.paymentType === 'Udhaar') {
        const existing = customers.find(c => c.name === checkoutForm.soldTo);
        const amountNum = finalTotal;
        let updatedCust;

        if (existing) {
          updatedCust = {
            ...existing,
            balance: existing.balance + amountNum,
            transactions: [
              ...existing.transactions,
              { type: 'Purchase', amount: amountNum, description: `Bought Accessories (POS Sale Demo)`, date: new Date().toISOString() }
            ]
          };
        } else {
          updatedCust = {
            _id: `cust-demo-${Date.now()}`,
            name: checkoutForm.soldTo,
            phone: checkoutForm.buyerPhone,
            balance: amountNum,
            transactions: [{ type: 'Purchase', amount: amountNum, description: `Bought Accessories (POS Sale Demo)`, date: new Date().toISOString() }]
          };
        }
        if (onAddPerson) {
          onAddPerson(updatedCust);
        }
      }

      setShowReceipt({ ...payload, _id: `sale-demo-${Date.now()}` });
      setCart([]);
      setDiscount('');
      setDiscountType('Flat');
      setCheckoutForm({ soldTo: '', paymentType: 'Cash', buyerPhone: '' });
    } finally {
      setProcessingCheckout(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-full overflow-hidden text-left bg-background text-on-surface">
      
      {/* LEFT PANEL: PRODUCT SELECTOR & STOCK VIEW */}
      <div className="flex-1 flex flex-col border-r border-white/10 overflow-hidden bg-surface-container-lowest/30">
        
        {/* Search and Manage Header */}
        <div className="p-md md:p-lg border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-md shrink-0 bg-surface-container-lowest/80 backdrop-blur-md">
          <div className="flex-1 relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
            <input 
              type="text"
              className="w-full bg-surface-container border border-white/10 rounded-full py-1.5 pl-10 pr-4 text-xs text-on-surface outline-none focus:ring-1 focus:ring-primary/50"
              placeholder="Search accessories by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-md">
            <button
              onClick={() => {
                setEditingAccessory(null);
                setAccessoryForm({ name: '', category: 'Charger', costPrice: '', sellingPrice: '', stock: '', details: '' });
                setShowAddModal(true);
              }}
              className="px-md py-1.5 bg-primary text-on-primary rounded-full text-xs font-bold flex items-center gap-1 hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">add_circle</span> Add Item
            </button>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 px-md py-3 overflow-x-auto shrink-0 bg-surface-container-lowest/40 border-b border-white/5 no-scrollbar">
          {AccessoryCategories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                activeCategory === cat 
                  ? 'bg-primary-container text-on-primary-container font-bold' 
                  : 'bg-surface-container-low text-on-surface-variant hover:text-on-surface'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Product Cards Grid */}
        <div className="flex-1 overflow-y-auto p-md grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-md custom-scrollbar">
          {loading ? (
            <div className="col-span-full text-center py-20 text-on-surface-variant">
              <span className="material-symbols-outlined animate-spin text-4xl text-primary">sync</span>
              <p className="mt-2 text-xs">Loading accessories inventory...</p>
            </div>
          ) : filteredAccessories.length === 0 ? (
            <div className="col-span-full text-center py-20 text-on-surface-variant text-xs">
              <span className="material-symbols-outlined text-4xl mb-2 opacity-40">inventory_2</span>
              <p>No accessories found.</p>
            </div>
          ) : (
            filteredAccessories.map(item => {
              const inCart = cart.find(c => c._id === item._id);
              const remainingStock = item.stock - (inCart ? inCart.quantity : 0);
              
              return (
                <div 
                  key={item._id}
                  className="frosted-metal p-md rounded-xl flex flex-col justify-between border border-white/5 hover:border-primary/30 transition-all shadow-md group relative"
                >
                  {/* Category Tag */}
                  <span className="absolute top-3 right-3 bg-white/5 text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider text-on-surface-variant">
                    {item.category}
                  </span>

                  <div>
                    <h4 className="font-bold text-sm text-on-surface group-hover:text-primary transition-colors pr-10 line-clamp-2">
                      {item.name}
                    </h4>
                    {item.details && (
                      <p className="text-[10px] text-on-surface-variant mt-1 line-clamp-1 italic">{item.details}</p>
                    )}
                  </div>

                  <div className="mt-lg pt-md border-t border-white/5 flex items-end justify-between">
                    <div>
                      <p className="text-[10px] text-on-surface-variant uppercase tracking-wider">Retail Price</p>
                      <h5 className="font-mono-data font-black text-sm text-secondary">PKR {item.sellingPrice.toLocaleString()}</h5>
                    </div>

                    <div className="text-right flex flex-col items-end gap-1">
                      <span className={`text-[10px] font-bold ${
                        remainingStock <= 0 ? 'text-error bg-error/10' : 'text-on-surface-variant'
                      } px-1.5 py-0.5 rounded`}>
                        {remainingStock <= 0 ? 'Out of Stock' : `${remainingStock} Available`}
                      </span>
                      
                      <div className="flex gap-2 mt-1">
                        <button
                          onClick={() => {
                            setEditingAccessory(item);
                            setAccessoryForm(item);
                            setShowAddModal(true);
                          }}
                          className="w-7 h-7 rounded-lg bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
                          title="Edit Product"
                        >
                          <span className="material-symbols-outlined text-[16px]">edit</span>
                        </button>
                        <button
                          disabled={remainingStock <= 0}
                          onClick={() => addToCart(item)}
                          className="px-3 h-7 bg-primary-container text-on-primary-container disabled:opacity-40 disabled:pointer-events-none rounded-lg text-xs font-bold flex items-center gap-1 active:scale-95 transition-all cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[16px]">add_shopping_cart</span> Add
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* RIGHT PANEL: CART & POS SYSTEM */}
      <div className="w-full lg:w-[400px] flex flex-col bg-surface-container-low border-t lg:border-t-0 border-white/10 overflow-hidden">
        
        {/* Header */}
        <div className="p-md md:p-lg bg-surface-container-lowest/70 backdrop-blur-md border-b border-white/5 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[22px]">point_of_sale</span>
            <h2 className="font-headline-md text-base font-bold text-on-surface">POS Checkout</h2>
          </div>
          <span className="bg-primary/20 text-primary px-2.5 py-0.5 rounded-full text-xs font-mono font-bold">
            {cart.reduce((qty, i) => qty + i.quantity, 0)} Items
          </span>
        </div>

        {/* Cart Item List */}
        <div className="flex-1 overflow-y-auto p-md space-y-md custom-scrollbar">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-on-surface-variant/40 py-20 text-center select-none">
              <span className="material-symbols-outlined text-[64px] mb-2">shopping_cart</span>
              <p className="text-xs font-medium uppercase tracking-widest text-on-surface-variant">Cart is Empty</p>
              <p className="text-[10px] mt-1 text-on-surface-variant/60 max-w-[200px]">Add accessories from the left side panel to start checking out.</p>
            </div>
          ) : (
            cart.map(item => (
              <div 
                key={item._id}
                className="bg-surface-container-lowest border border-white/5 p-md rounded-xl flex items-center justify-between gap-md"
              >
                <div className="min-w-0 flex-1">
                  <h5 className="font-bold text-xs text-on-surface line-clamp-1">{item.name}</h5>
                  <p className="text-[10px] text-secondary font-mono-data mt-0.5">PKR {item.sellingPrice.toLocaleString()} each</p>
                </div>
                
                <div className="flex items-center gap-3 shrink-0">
                  <div className="flex items-center bg-surface-container border border-white/10 rounded-lg overflow-hidden">
                    <button 
                      onClick={() => updateQuantity(item._id, -1)}
                      className="w-6 h-6 flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
                    >
                      -
                    </button>
                    <span className="text-xs px-2 font-mono font-bold text-on-surface">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item._id, 1)}
                      className="w-6 h-6 flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => setCart(cart.filter(i => i._id !== item._id))}
                    className="text-on-surface-variant/40 hover:text-error transition-colors cursor-pointer"
                    title="Remove from cart"
                  >
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Totals & Checkout Form Panel */}
        <div className="p-md md:p-lg bg-surface-container-lowest/80 border-t border-white/10 space-y-md shrink-0">
          
          {/* Discount Section */}
          <div className="flex items-center justify-between gap-md border-t border-white/5 pt-md">
            <div className="space-y-1 text-xs flex-1">
              <label className="text-[10px] text-on-surface-variant uppercase tracking-wider font-semibold">Apply Discount</label>
              <div className="flex bg-surface-container rounded-lg overflow-hidden border border-white/10 items-center">
                <input 
                  type="number"
                  min="0"
                  className="w-full bg-transparent py-2 px-3 text-xs text-on-surface outline-none"
                  placeholder={discountType === 'Percentage' ? "Enter %" : "Enter PKR amount"}
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                />
                <div className="flex border-l border-white/10 shrink-0">
                  <button 
                    type="button"
                    onClick={() => setDiscountType('Flat')}
                    className={`px-2.5 py-2 text-[10px] font-bold transition-colors cursor-pointer ${
                      discountType === 'Flat' ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    PKR
                  </button>
                  <button 
                    type="button"
                    onClick={() => setDiscountType('Percentage')}
                    className={`px-2.5 py-2 text-[10px] font-bold transition-colors cursor-pointer ${
                      discountType === 'Percentage' ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    %
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-1 text-xs border-t border-white/10 pt-md">
            {Number(discount) > 0 && (
              <>
                <div className="flex justify-between items-center text-on-surface-variant">
                  <span>Subtotal:</span>
                  <span className="font-mono-data">PKR {cartTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-error">
                  <span>Discount:</span>
                  <span className="font-mono-data">
                    {discountType === 'Percentage' 
                      ? `-${discount}% (PKR ${(cartTotal * (Number(discount) / 100)).toLocaleString()})`
                      : `-PKR ${Number(discount).toLocaleString()}`
                    }
                  </span>
                </div>
              </>
            )}
            <div className="flex justify-between items-center text-sm font-bold text-on-surface pt-1">
              <span className="text-on-surface-variant">Grand Total:</span>
              <span className="font-mono-data text-secondary text-lg font-black">PKR {finalTotal.toLocaleString()}</span>
            </div>
          </div>

          <form onSubmit={handleCheckoutSubmit} className="space-y-md">
            {/* Customer select / write-in */}
            <div className="space-y-1 text-xs">
              <label className="text-[10px] text-on-surface-variant uppercase tracking-wider font-semibold">Sold To (Customer Name)</label>
              <div className="relative">
                <input 
                  type="text"
                  required
                  className="w-full bg-surface-container border border-white/10 rounded-lg py-2 px-3 text-xs text-on-surface placeholder:text-on-surface-variant/45 outline-none focus:ring-1 focus:ring-primary/50"
                  placeholder="Type name (Cash or Ledger Account)"
                  list="ledger-customers"
                  value={checkoutForm.soldTo}
                  onChange={(e) => setCheckoutForm({ ...checkoutForm, soldTo: e.target.value })}
                />
                <datalist id="ledger-customers">
                  {customers.map(c => <option key={c._id} value={c.name} />)}
                </datalist>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-md">
              {/* Payment Type */}
              <div className="space-y-1 text-xs">
                <label className="text-[10px] text-on-surface-variant uppercase tracking-wider font-semibold">Payment</label>
                <select 
                  className="w-full bg-surface-container border border-white/10 rounded-lg py-2 px-3 text-xs text-on-surface outline-none focus:ring-1 focus:ring-primary/50 cursor-pointer"
                  value={checkoutForm.paymentType}
                  onChange={(e) => setCheckoutForm({ ...checkoutForm, paymentType: e.target.value })}
                >
                  <option value="Cash">Cash Sale</option>
                  <option value="Udhaar">Udhaar (Ledger)</option>
                </select>
              </div>

              {/* Phone */}
              <div className="space-y-1 text-xs">
                <label className="text-[10px] text-on-surface-variant uppercase tracking-wider font-semibold">Buyer Phone</label>
                <input 
                  type="text"
                  className="w-full bg-surface-container border border-white/10 rounded-lg py-2 px-3 text-xs text-on-surface placeholder:text-on-surface-variant/45 outline-none focus:ring-1 focus:ring-primary/50"
                  placeholder="Optional"
                  value={checkoutForm.buyerPhone}
                  onChange={(e) => setCheckoutForm({ ...checkoutForm, buyerPhone: e.target.value })}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={cart.length === 0 || processingCheckout}
              className="w-full bg-primary text-on-primary hover:brightness-110 font-bold py-md rounded-xl text-xs active:scale-[0.98] transition-all disabled:opacity-40 disabled:pointer-events-none flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-primary/20"
            >
              {processingCheckout ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-[16px]">sync</span> Processing...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">shopping_cart_checkout</span> Complete Checkout
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* MODAL 1: ADD/EDIT ACCESSORY DIALOG */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-md bg-black/80 backdrop-blur-sm">
          <div className="glass-card w-full max-w-md rounded-2xl overflow-hidden shadow-2xl animate-float">
            <div className="p-lg bg-primary-container text-on-primary-container flex justify-between items-center">
              <h3 className="font-bold text-sm">{editingAccessory ? 'Modify Accessory' : 'Register New Accessory'}</h3>
              <button 
                type="button" 
                onClick={() => setShowAddModal(false)}
                className="w-7 h-7 rounded-full hover:bg-white/10 flex items-center justify-center text-on-primary-container cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <form onSubmit={handleAccessorySubmit} className="p-lg space-y-md text-left text-xs">
              <div className="space-y-1">
                <label className="text-[10px] text-on-surface-variant uppercase tracking-wider font-semibold">Accessory Name</label>
                <input 
                  type="text"
                  required
                  className="w-full bg-surface-container border border-white/10 rounded-lg py-2 px-3 text-on-surface placeholder:text-on-surface-variant/40 outline-none focus:ring-1 focus:ring-primary/50"
                  placeholder="e.g. Spigen Armor iPhone 15 Cover"
                  value={accessoryForm.name}
                  onChange={(e) => setAccessoryForm({ ...accessoryForm, name: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-md">
                <div className="space-y-1">
                  <label className="text-[10px] text-on-surface-variant uppercase tracking-wider font-semibold">Category</label>
                  <select
                    className="w-full bg-surface-container border border-white/10 rounded-lg py-2 px-3 text-on-surface outline-none focus:ring-1 focus:ring-primary/50 cursor-pointer"
                    value={accessoryForm.category}
                    onChange={(e) => setAccessoryForm({ ...accessoryForm, category: e.target.value })}
                  >
                    {AccessoryCategories.filter(c => c !== 'All').map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-on-surface-variant uppercase tracking-wider font-semibold">Stock Quantity</label>
                  <input 
                    type="number"
                    required
                    min="0"
                    className="w-full bg-surface-container border border-white/10 rounded-lg py-2 px-3 text-on-surface placeholder:text-on-surface-variant/40 outline-none focus:ring-1 focus:ring-primary/50"
                    placeholder="In Hand"
                    value={accessoryForm.stock}
                    onChange={(e) => setAccessoryForm({ ...accessoryForm, stock: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-md">
                <div className="space-y-1">
                  <label className="text-[10px] text-on-surface-variant uppercase tracking-wider font-semibold">Cost Price (PKR)</label>
                  <input 
                    type="number"
                    required
                    min="0"
                    className="w-full bg-surface-container border border-white/10 rounded-lg py-2 px-3 text-on-surface placeholder:text-on-surface-variant/40 outline-none focus:ring-1 focus:ring-primary/50"
                    placeholder="Wholesale"
                    value={accessoryForm.costPrice}
                    onChange={(e) => setAccessoryForm({ ...accessoryForm, costPrice: e.target.value })}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-on-surface-variant uppercase tracking-wider font-semibold">Selling Price (PKR)</label>
                  <input 
                    type="number"
                    required
                    min="0"
                    className="w-full bg-surface-container border border-white/10 rounded-lg py-2 px-3 text-on-surface placeholder:text-on-surface-variant/40 outline-none focus:ring-1 focus:ring-primary/50"
                    placeholder="Retail"
                    value={accessoryForm.sellingPrice}
                    onChange={(e) => setAccessoryForm({ ...accessoryForm, sellingPrice: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-on-surface-variant uppercase tracking-wider font-semibold">Details / Specifications</label>
                <textarea 
                  className="w-full bg-surface-container border border-white/10 rounded-lg py-2 px-3 text-on-surface placeholder:text-on-surface-variant/40 outline-none focus:ring-1 focus:ring-primary/50 h-20 resize-none"
                  placeholder="Colors, compatibility, model support, etc."
                  value={accessoryForm.details}
                  onChange={(e) => setAccessoryForm({ ...accessoryForm, details: e.target.value })}
                />
              </div>

              <button
                type="submit"
                className="w-full bg-primary text-on-primary font-bold py-2.5 rounded-xl text-xs active:scale-[0.98] transition-transform cursor-pointer"
              >
                {editingAccessory ? 'Save Changes' : 'Register Accessory'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: PRINTABLE POS SALES RECEIPT OVERLAY */}
      {showReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-md bg-black/90 backdrop-blur-sm">
          <div className="bg-white text-black p-lg rounded-xl shadow-2xl max-w-sm w-full flex flex-col font-mono text-left relative overflow-hidden">
            
            {/* Stamp decoration */}
            <div className="absolute top-2 right-2 border-2 border-green-600 text-green-600 font-bold uppercase text-[9px] px-2 py-0.5 rounded rotate-12 select-none tracking-wider opacity-80">
              PAID
            </div>

            <div className="text-center border-b border-black/10 pb-md mb-md">
              <h3 className="font-bold text-lg tracking-tight">AL SHEIKH MOBILES</h3>
              <p className="text-[10px] opacity-70">Flagship Store • Hall Road, Lahore</p>
              <p className="text-[9px] opacity-60">Tel: 0300-1234567 • Date: {new Date(showReceipt.soldAt || Date.now()).toLocaleString()}</p>
            </div>

            <div className="text-[10px] mb-lg space-y-0.5 border-b border-black/10 pb-md">
              <p><span className="font-bold">Receipt ID:</span> #{showReceipt._id.toString().slice(-8).toUpperCase()}</p>
              <p><span className="font-bold">Customer:</span> {showReceipt.soldTo}</p>
              {showReceipt.buyerPhone && <p><span className="font-bold">Phone:</span> {showReceipt.buyerPhone}</p>}
              <p><span className="font-bold">Method:</span> {showReceipt.paymentType} {showReceipt.paymentType === 'Udhaar' ? '(Account Ledger)' : '(Cash Pay)'}</p>
            </div>

            {/* Receipt items table */}
            <table className="w-full text-left text-[10px] border-b border-black/10 pb-lg mb-lg">
              <thead>
                <tr className="border-b border-black/10">
                  <th className="pb-1 font-bold">Item</th>
                  <th className="pb-1 text-center font-bold">Qty</th>
                  <th className="pb-1 text-right font-bold">Total</th>
                </tr>
              </thead>
              <tbody>
                {showReceipt.items.map((item, idx) => (
                  <tr key={idx} className="border-b border-black/5 last:border-0">
                    <td className="py-1 max-w-[180px] truncate">{item.name}</td>
                    <td className="py-1 text-center">{item.quantity}</td>
                    <td className="py-1 text-right">PKR {(item.sellingPrice * item.quantity).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {showReceipt.discount > 0 && (
              <div className="text-[10px] border-b border-black/10 pb-1 mb-1 space-y-0.5">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>PKR {showReceipt.items.reduce((sum, item) => sum + (item.sellingPrice * item.quantity), 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-red-600 font-bold">
                  <span>Discount:</span>
                  <span>
                    {showReceipt.discountType === 'Percentage'
                      ? `-${showReceipt.discount}%`
                      : `-PKR ${showReceipt.discount.toLocaleString()}`
                    }
                  </span>
                </div>
              </div>
            )}

            <div className="flex justify-between items-center text-xs font-bold mb-xl">
              <span>Total Paid/Owed:</span>
              <span>PKR {showReceipt.totalAmount.toLocaleString()}</span>
            </div>

            <div className="text-center text-[10px] border-t border-black/10 pt-md italic opacity-60">
              <p>Thank you for shopping at Al Sheikh Mobiles!</p>
              <p>No Return, Exchange only within 3 days.</p>
            </div>

            <div className="mt-xl flex gap-md shrink-0 no-print">
              <button
                onClick={() => window.print()}
                className="flex-1 bg-black text-white hover:bg-black/95 border py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1 active:scale-[0.98] transition-transform cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">print</span> Print
              </button>
              <button
                onClick={() => setShowReceipt(null)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 border border-gray-300 text-black py-2 rounded-lg text-xs font-bold active:scale-[0.98] transition-transform cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccessoriesPOS;
