import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
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
  const [mobileTab, setMobileTab] = useState('catalog'); // 'catalog' | 'cart'

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showReceipt, setShowReceipt] = useState(null);
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
  const [discountType, setDiscountType] = useState('Flat');
  const [processingCheckout, setProcessingCheckout] = useState(false);

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

  const generateDemoAccessories = () => {
    setAccessories([
      { _id: 'acc-1', name: 'Anker PowerPort III 20W', category: 'Charger', costPrice: 1500, sellingPrice: 2200, stock: 12, details: 'USB-C Fast Charger' },
      { _id: 'acc-2', name: 'Samsung USB-C to USB-C 1m', category: 'Cable', costPrice: 600, sellingPrice: 999, stock: 25, details: 'Original cable black' },
      { _id: 'acc-3', name: 'iPhone 15 Pro Max Privacy Glass', category: 'Glass', costPrice: 400, sellingPrice: 850, stock: 8, details: '9H hardness full glue' },
      { _id: 'acc-4', name: 'Spigen Ultra Hybrid Case iPhone 15', category: 'Cover', costPrice: 1800, sellingPrice: 2800, stock: 5, details: 'Clear back cover' },
      { _id: 'acc-5', name: 'Redmi Buds 5 Pro', category: 'Earphones', costPrice: 6500, sellingPrice: 8990, stock: 6, details: 'Active Noise Cancellation' }
    ]);
  };

  const filteredAccessories = useMemo(() => {
    return accessories.filter(a => {
      const matchSearch = a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (a.details && a.details.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchCategory = activeCategory === 'All' || a.category === activeCategory;
      return matchSearch && matchCategory;
    });
  }, [accessories, searchQuery, activeCategory]);

  const addToCart = (accessory) => {
    if (accessory.stock <= 0) { toast.error('Out of stock!'); return; }
    const existing = cart.findIndex(i => i._id === accessory._id);
    if (existing >= 0) {
      if (cart[existing].quantity >= accessory.stock) { toast.error(`Only ${accessory.stock} available.`); return; }
      setCart(cart.map((i, idx) => idx === existing ? { ...i, quantity: i.quantity + 1 } : i));
    } else {
      setCart([...cart, { ...accessory, quantity: 1 }]);
    }
  };

  const updateQuantity = (id, change) => {
    const item = cart.find(i => i._id === id);
    const original = accessories.find(a => a._id === id);
    if (!item) return;
    const newQty = item.quantity + change;
    if (newQty <= 0) {
      setCart(cart.filter(i => i._id !== id));
    } else if (original && newQty > original.stock) {
      toast.error(`Only ${original.stock} units available.`);
    } else {
      setCart(cart.map(i => i._id === id ? { ...i, quantity: newQty } : i));
    }
  };

  const cartTotal = useMemo(() => cart.reduce((sum, i) => sum + i.sellingPrice * i.quantity, 0), [cart]);
  const cartCount = useMemo(() => cart.reduce((sum, i) => sum + i.quantity, 0), [cart]);

  const finalTotal = useMemo(() => {
    const d = Number(discount) || 0;
    if (d <= 0) return cartTotal;
    if (discountType === 'Percentage') return Math.max(0, cartTotal - (cartTotal * d / 100));
    return Math.max(0, cartTotal - d);
  }, [cartTotal, discount, discountType]);

  const resetForm = () => {
    setEditingAccessory(null);
    setAccessoryForm({ name: '', category: 'Charger', costPrice: '', sellingPrice: '', stock: '', details: '' });
  };

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
        setAccessories(accessories.map(a => a._id === editingAccessory._id ? res.data : a));
        toast.success('Accessory updated!');
      } else {
        const res = await axios.post(`${API_URL}/api/accessories`, payload);
        setAccessories([res.data, ...accessories]);
        toast.success('Accessory added!');
      }
    } catch {
      const mock = { _id: editingAccessory ? editingAccessory._id : `acc-demo-${Date.now()}`, ...payload };
      if (editingAccessory) {
        setAccessories(accessories.map(a => a._id === editingAccessory._id ? mock : a));
        toast.success('Updated (Demo Mode)');
      } else {
        setAccessories([mock, ...accessories]);
        toast.success('Added (Demo Mode)');
      }
    }
    setShowAddModal(false);
    resetForm();
  };

  const handleCheckoutSubmit = async (e) => {
    e.preventDefault();
    if (cart.length === 0) { toast.error('Cart is empty!'); return; }
    if (!checkoutForm.soldTo) { toast.error('Customer name is required!'); return; }
    setProcessingCheckout(true);

    const checkoutItems = cart.map(i => ({
      accessoryId: i._id,
      name: i.name,
      quantity: i.quantity,
      sellingPrice: i.sellingPrice
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
      toast.success('Sale completed!');
      fetchAccessories();
      if (res.data.person && onPayment) onPayment(res.data.person);
      setShowReceipt(res.data.sale || { ...payload, _id: `sale-demo-${Date.now()}` });
    } catch {
      toast.success('Sale completed! (Demo Mode)');
      setAccessories(prev => prev.map(a => {
        const ci = cart.find(i => i._id === a._id);
        return ci ? { ...a, stock: Math.max(0, a.stock - ci.quantity) } : a;
      }));
      if (checkoutForm.paymentType === 'Udhaar') {
        const existing = customers.find(c => c.name === checkoutForm.soldTo);
        const updatedCust = existing
          ? { ...existing, balance: existing.balance + finalTotal, transactions: [...existing.transactions, { type: 'Purchase', amount: finalTotal, description: 'POS Accessories (Demo)', date: new Date().toISOString() }] }
          : { _id: `cust-demo-${Date.now()}`, name: checkoutForm.soldTo, phone: checkoutForm.buyerPhone, balance: finalTotal, transactions: [{ type: 'Purchase', amount: finalTotal, description: 'POS Accessories (Demo)', date: new Date().toISOString() }] };
        if (onAddPerson) onAddPerson(updatedCust);
      }
      setShowReceipt({ ...payload, _id: `sale-demo-${Date.now()}` });
    } finally {
      setCart([]);
      setDiscount('');
      setDiscountType('Flat');
      setCheckoutForm({ soldTo: '', paymentType: 'Cash', buyerPhone: '' });
      setProcessingCheckout(false);
    }
  };

  /* ──────────────────── RENDER ──────────────────── */
  return (
    <div className="relative flex flex-col h-full overflow-hidden text-left bg-background text-on-surface">

      {/* ── MOBILE SUB-TAB HEADER ── */}
      <div className="lg:hidden flex items-center border-b border-white/10 bg-surface-container-lowest/90 backdrop-blur-md shrink-0">
        <button
          onClick={() => setMobileTab('catalog')}
          className={`flex-1 py-3 text-xs font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer border-b-2 ${
            mobileTab === 'catalog' ? 'text-primary border-primary' : 'text-on-surface-variant border-transparent'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">inventory_2</span>
          Catalog
        </button>
        <button
          onClick={() => setMobileTab('cart')}
          className={`flex-1 py-3 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer border-b-2 ${
            mobileTab === 'cart' ? 'text-primary border-primary' : 'text-on-surface-variant border-transparent'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">shopping_cart</span>
          Cart
          {cartCount > 0 && (
            <span className="bg-primary text-on-primary text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center">
              {cartCount}
            </span>
          )}
        </button>
      </div>

      {/* ── MAIN TWO-PANEL LAYOUT ── */}
      <div className="flex flex-1 overflow-hidden lg:flex-row flex-col">

        {/* ════ LEFT PANEL: CATALOG ════ */}
        <div className={`flex-1 flex flex-col border-r border-white/10 overflow-hidden bg-surface-container-lowest/30 ${
          mobileTab === 'cart' ? 'hidden lg:flex' : 'flex'
        }`}>

          {/* Search + Add Item Header */}
          <div className="p-3 md:p-4 border-b border-white/5 flex items-center gap-3 shrink-0 bg-surface-container-lowest/80 backdrop-blur-md">
            <div className="flex-1 relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">search</span>
              <input
                type="text"
                className="w-full bg-surface-container border border-white/10 rounded-full py-2 pl-9 pr-4 text-xs text-on-surface outline-none focus:ring-1 focus:ring-primary/50"
                placeholder="Search accessories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button
              onClick={() => { resetForm(); setShowAddModal(true); }}
              className="shrink-0 px-3 py-2 bg-primary text-on-primary rounded-full text-xs font-bold flex items-center gap-1 hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
              <span className="hidden sm:inline">Add Item</span>
            </button>
          </div>

          {/* Category Pills */}
          <div className="flex items-center gap-2 px-3 py-2.5 overflow-x-auto shrink-0 bg-surface-container-lowest/40 border-b border-white/5" style={{ scrollbarWidth: 'none' }}>
            {AccessoryCategories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  activeCategory === cat
                    ? 'bg-primary-container text-on-primary-container'
                    : 'bg-surface-container-low text-on-surface-variant hover:text-on-surface'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Product Grid */}
          <div className="flex-1 overflow-y-auto p-3 grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 custom-scrollbar">
            {loading ? (
              <div className="col-span-full text-center py-20 text-on-surface-variant">
                <span className="material-symbols-outlined animate-spin text-4xl text-primary">sync</span>
                <p className="mt-2 text-xs">Loading inventory...</p>
              </div>
            ) : filteredAccessories.length === 0 ? (
              <div className="col-span-full text-center py-20 text-on-surface-variant text-xs">
                <span className="material-symbols-outlined text-4xl mb-2 opacity-40">inventory_2</span>
                <p>No accessories found.</p>
              </div>
            ) : (
              filteredAccessories.map(item => {
                const inCart = cart.find(c => c._id === item._id);
                const remaining = item.stock - (inCart ? inCart.quantity : 0);
                return (
                  <div key={item._id} className="frosted-metal p-3 rounded-xl flex flex-col justify-between border border-white/5 hover:border-primary/30 transition-all group relative">
                    <span className="absolute top-2 right-2 text-[9px] px-1.5 py-0.5 rounded-full bg-white/5 text-on-surface-variant font-bold uppercase tracking-wide">{item.category}</span>
                    <div>
                      <h4 className="font-bold text-xs text-on-surface group-hover:text-primary transition-colors pr-10 line-clamp-2 leading-tight">{item.name}</h4>
                      {item.details && <p className="text-[10px] text-on-surface-variant mt-1 line-clamp-1 italic">{item.details}</p>}
                    </div>
                    <div className="mt-3 pt-2.5 border-t border-white/5">
                      <p className="font-mono-data font-black text-xs text-secondary mb-1.5">PKR {item.sellingPrice.toLocaleString()}</p>
                      <div className="flex items-center justify-between gap-1">
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${remaining <= 0 ? 'text-error bg-error/10' : 'text-on-surface-variant'}`}>
                          {remaining <= 0 ? 'Out of stock' : `${remaining} left`}
                        </span>
                        <div className="flex gap-1">
                          <button
                            onClick={() => { setEditingAccessory(item); setAccessoryForm(item); setShowAddModal(true); }}
                            className="w-6 h-6 rounded-lg bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[14px]">edit</span>
                          </button>
                          <button
                            disabled={remaining <= 0}
                            onClick={() => { addToCart(item); setMobileTab('cart'); }}
                            className="w-6 h-6 bg-primary-container text-on-primary-container disabled:opacity-40 disabled:pointer-events-none rounded-lg flex items-center justify-center active:scale-90 transition-all cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[14px]">add_shopping_cart</span>
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

        {/* ════ RIGHT PANEL: POS CART ════ */}
        <div className={`w-full lg:w-[380px] flex flex-col bg-surface-container-low border-t lg:border-t-0 border-white/10 overflow-hidden ${
          mobileTab === 'catalog' ? 'hidden lg:flex' : 'flex'
        }`}>

          {/* Cart Header */}
          <div className="p-3 md:p-4 bg-surface-container-lowest/70 backdrop-blur-md border-b border-white/5 flex justify-between items-center shrink-0">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[20px]">point_of_sale</span>
              <h2 className="font-bold text-sm text-on-surface">POS Checkout</h2>
            </div>
            {cartCount > 0 && (
              <span className="bg-primary/20 text-primary px-2.5 py-0.5 rounded-full text-xs font-mono font-bold">
                {cartCount} items
              </span>
            )}
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar min-h-0">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-on-surface-variant/40 py-16 text-center select-none">
                <span className="material-symbols-outlined text-[56px] mb-2">shopping_cart</span>
                <p className="text-xs font-medium uppercase tracking-widest">Cart Empty</p>
                <p className="text-[10px] mt-1 text-on-surface-variant/50 max-w-[180px]">
                  {window.innerWidth < 1024 ? 'Go to Catalog to add items.' : 'Add accessories from the left panel.'}
                </p>
              </div>
            ) : (
              cart.map(item => (
                <div key={item._id} className="bg-surface-container-lowest border border-white/5 p-3 rounded-xl flex items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <h5 className="font-bold text-xs text-on-surface line-clamp-1">{item.name}</h5>
                    <p className="text-[10px] text-secondary font-mono-data mt-0.5">PKR {item.sellingPrice.toLocaleString()} each</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="flex items-center bg-surface-container border border-white/10 rounded-lg overflow-hidden">
                      <button onClick={() => updateQuantity(item._id, -1)} className="w-6 h-6 flex items-center justify-center text-on-surface-variant hover:text-on-surface cursor-pointer">−</button>
                      <span className="text-xs px-2 font-mono font-bold text-on-surface">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item._id, 1)} className="w-6 h-6 flex items-center justify-center text-on-surface-variant hover:text-on-surface cursor-pointer">+</button>
                    </div>
                    <button onClick={() => setCart(cart.filter(i => i._id !== item._id))} className="text-on-surface-variant/40 hover:text-error transition-colors cursor-pointer">
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Totals + Checkout Form */}
          <div className="p-3 md:p-4 bg-surface-container-lowest/80 border-t border-white/10 space-y-3 shrink-0">

            {/* Discount Row */}
            <div className="space-y-1">
              <label className="text-[10px] text-on-surface-variant uppercase tracking-wider font-semibold">Discount</label>
              <div className="flex bg-surface-container rounded-lg overflow-hidden border border-white/10 items-center">
                <input
                  type="number"
                  min="0"
                  className="w-full bg-transparent py-2 px-3 text-xs text-on-surface outline-none"
                  placeholder={discountType === 'Percentage' ? 'Enter %' : 'Enter PKR'}
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                />
                <div className="flex border-l border-white/10 shrink-0">
                  <button type="button" onClick={() => setDiscountType('Flat')} className={`px-2.5 py-2 text-[10px] font-bold transition-colors cursor-pointer ${discountType === 'Flat' ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:text-on-surface'}`}>PKR</button>
                  <button type="button" onClick={() => setDiscountType('Percentage')} className={`px-2.5 py-2 text-[10px] font-bold transition-colors cursor-pointer ${discountType === 'Percentage' ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:text-on-surface'}`}>%</button>
                </div>
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="space-y-1 text-xs border-t border-white/10 pt-2">
              {Number(discount) > 0 && (
                <>
                  <div className="flex justify-between items-center text-on-surface-variant">
                    <span>Subtotal:</span><span className="font-mono-data">PKR {cartTotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-error">
                    <span>Discount:</span>
                    <span className="font-mono-data">
                      {discountType === 'Percentage' ? `-${discount}%` : `-PKR ${Number(discount).toLocaleString()}`}
                    </span>
                  </div>
                </>
              )}
              <div className="flex justify-between items-center font-bold text-on-surface pt-1">
                <span className="text-on-surface-variant text-sm">Grand Total:</span>
                <span className="font-mono-data text-secondary text-base font-black">PKR {finalTotal.toLocaleString()}</span>
              </div>
            </div>

            {/* Checkout Form */}
            <form onSubmit={handleCheckoutSubmit} className="space-y-2.5 border-t border-white/10 pt-3">
              <div className="space-y-1 text-xs">
                <label className="text-[10px] text-on-surface-variant uppercase tracking-wider font-semibold">Customer Name</label>
                <input
                  type="text"
                  required
                  list="ledger-customers"
                  className="w-full bg-surface-container border border-white/10 rounded-lg py-2 px-3 text-xs text-on-surface placeholder:text-on-surface-variant/45 outline-none focus:ring-1 focus:ring-primary/50"
                  placeholder="Cash Customer or Ledger Account"
                  value={checkoutForm.soldTo}
                  onChange={(e) => setCheckoutForm({ ...checkoutForm, soldTo: e.target.value })}
                />
                <datalist id="ledger-customers">
                  {customers.map(c => <option key={c._id} value={c.name} />)}
                </datalist>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1 text-xs">
                  <label className="text-[10px] text-on-surface-variant uppercase tracking-wider font-semibold">Payment</label>
                  <select
                    className="w-full bg-surface-container border border-white/10 rounded-lg py-2 px-3 text-xs text-on-surface outline-none focus:ring-1 focus:ring-primary/50 cursor-pointer"
                    value={checkoutForm.paymentType}
                    onChange={(e) => setCheckoutForm({ ...checkoutForm, paymentType: e.target.value })}
                  >
                    <option value="Cash">Cash</option>
                    <option value="Udhaar">Udhaar (Ledger)</option>
                  </select>
                </div>
                <div className="space-y-1 text-xs">
                  <label className="text-[10px] text-on-surface-variant uppercase tracking-wider font-semibold">Phone (Optional)</label>
                  <input
                    type="text"
                    className="w-full bg-surface-container border border-white/10 rounded-lg py-2 px-3 text-xs text-on-surface placeholder:text-on-surface-variant/45 outline-none focus:ring-1 focus:ring-primary/50"
                    placeholder="03XX-XXXXXXX"
                    value={checkoutForm.buyerPhone}
                    onChange={(e) => setCheckoutForm({ ...checkoutForm, buyerPhone: e.target.value })}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={cart.length === 0 || processingCheckout}
                className="w-full bg-primary text-on-primary hover:brightness-110 font-bold py-2.5 rounded-xl text-xs active:scale-[0.98] transition-all disabled:opacity-40 disabled:pointer-events-none flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-primary/20"
              >
                {processingCheckout
                  ? <><span className="material-symbols-outlined animate-spin text-[16px]">sync</span> Processing...</>
                  : <><span className="material-symbols-outlined text-[18px]">shopping_cart_checkout</span> Complete Checkout</>}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* ════ MODAL: ADD / EDIT ACCESSORY ════ */}
      {showAddModal && createPortal(
        <div
          className="fixed inset-0 z-[200] flex items-end md:items-center justify-center md:p-4 bg-black/80 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) { setShowAddModal(false); resetForm(); } }}
        >
          <div className="glass-card w-full md:max-w-lg md:rounded-2xl rounded-t-2xl border border-white/10 shadow-2xl shadow-black/60 overflow-hidden flex flex-col max-h-[95dvh] md:max-h-[90vh]">
            <div className="p-4 bg-primary-container text-on-primary-container flex justify-between items-center shrink-0">
              <h3 className="font-bold text-sm">{editingAccessory ? 'Edit Accessory' : 'Add New Accessory'}</h3>
              <button
                type="button"
                onClick={() => { setShowAddModal(false); resetForm(); }}
                className="w-7 h-7 rounded-full hover:bg-white/20 flex items-center justify-center text-on-primary-container cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <form onSubmit={handleAccessorySubmit} className="p-4 space-y-3 overflow-y-auto custom-scrollbar text-xs flex-1">
              <div className="space-y-1">
                <label className="text-[10px] text-on-surface-variant uppercase tracking-wider font-semibold">Accessory Name *</label>
                <input
                  type="text"
                  required
                  className="w-full bg-surface-container-low border border-white/10 rounded-lg py-2.5 px-3 text-on-surface placeholder:text-on-surface-variant/40 outline-none focus:ring-1 focus:ring-primary/50"
                  placeholder="e.g. Spigen Armor iPhone 15 Cover"
                  value={accessoryForm.name}
                  onChange={(e) => setAccessoryForm({ ...accessoryForm, name: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] text-on-surface-variant uppercase tracking-wider font-semibold">Category</label>
                  <select
                    className="w-full bg-surface-container-low border border-white/10 rounded-lg py-2.5 px-3 text-on-surface outline-none focus:ring-1 focus:ring-primary/50 cursor-pointer"
                    value={accessoryForm.category}
                    onChange={(e) => setAccessoryForm({ ...accessoryForm, category: e.target.value })}
                  >
                    {AccessoryCategories.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-on-surface-variant uppercase tracking-wider font-semibold">Stock Qty *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    className="w-full bg-surface-container-low border border-white/10 rounded-lg py-2.5 px-3 text-on-surface placeholder:text-on-surface-variant/40 outline-none focus:ring-1 focus:ring-primary/50"
                    placeholder="Units in hand"
                    value={accessoryForm.stock}
                    onChange={(e) => setAccessoryForm({ ...accessoryForm, stock: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] text-on-surface-variant uppercase tracking-wider font-semibold">Cost Price (PKR) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    className="w-full bg-surface-container-low border border-white/10 rounded-lg py-2.5 px-3 text-on-surface placeholder:text-on-surface-variant/40 outline-none focus:ring-1 focus:ring-primary/50"
                    placeholder="Wholesale price"
                    value={accessoryForm.costPrice}
                    onChange={(e) => setAccessoryForm({ ...accessoryForm, costPrice: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-on-surface-variant uppercase tracking-wider font-semibold">Selling Price (PKR) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    className="w-full bg-surface-container-low border border-white/10 rounded-lg py-2.5 px-3 text-on-surface placeholder:text-on-surface-variant/40 outline-none focus:ring-1 focus:ring-primary/50"
                    placeholder="Retail price"
                    value={accessoryForm.sellingPrice}
                    onChange={(e) => setAccessoryForm({ ...accessoryForm, sellingPrice: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-on-surface-variant uppercase tracking-wider font-semibold">Details / Notes</label>
                <textarea
                  className="w-full bg-surface-container-low border border-white/10 rounded-lg py-2.5 px-3 text-on-surface placeholder:text-on-surface-variant/40 outline-none focus:ring-1 focus:ring-primary/50 h-16 resize-none"
                  placeholder="Colors, compatibility, specs..."
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
      , document.body)}

      {/* ════ MODAL: PRINTABLE RECEIPT ════ */}
      {showReceipt && createPortal(
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white text-black p-5 rounded-xl shadow-2xl max-w-sm w-full font-mono text-left relative my-auto">
            <div className="absolute top-2 right-2 border-2 border-green-600 text-green-600 font-bold uppercase text-[9px] px-2 py-0.5 rounded rotate-12 select-none tracking-wider opacity-80">PAID</div>

            <div className="text-center border-b border-black/10 pb-3 mb-3">
              <h3 className="font-bold text-base tracking-tight">AL SHEIKH MOBILES</h3>
              <p className="text-[10px] opacity-70">Flagship Store • Hall Road, Lahore</p>
              <p className="text-[9px] opacity-60">Tel: 0300-1234567 • {new Date(showReceipt.soldAt || Date.now()).toLocaleString()}</p>
            </div>

            <div className="text-[10px] mb-3 space-y-0.5 border-b border-black/10 pb-3">
              <p><span className="font-bold">Receipt ID:</span> #{showReceipt._id.toString().slice(-8).toUpperCase()}</p>
              <p><span className="font-bold">Customer:</span> {showReceipt.soldTo}</p>
              {showReceipt.buyerPhone && <p><span className="font-bold">Phone:</span> {showReceipt.buyerPhone}</p>}
              <p><span className="font-bold">Method:</span> {showReceipt.paymentType === 'Udhaar' ? 'Udhaar (Account Ledger)' : 'Cash Payment'}</p>
            </div>

            <table className="w-full text-[10px] border-b border-black/10 pb-2 mb-2">
              <thead>
                <tr className="border-b border-black/10">
                  <th className="pb-1 font-bold text-left">Item</th>
                  <th className="pb-1 font-bold text-center">Qty</th>
                  <th className="pb-1 font-bold text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {showReceipt.items.map((item, idx) => (
                  <tr key={idx} className="border-b border-black/5 last:border-0">
                    <td className="py-1 max-w-[150px] truncate">{item.name}</td>
                    <td className="py-1 text-center">{item.quantity}</td>
                    <td className="py-1 text-right">PKR {(item.sellingPrice * item.quantity).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {showReceipt.discount > 0 && (
              <div className="text-[10px] border-b border-black/10 pb-2 mb-2 space-y-0.5">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>PKR {showReceipt.items.reduce((s, i) => s + i.sellingPrice * i.quantity, 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-red-600 font-bold">
                  <span>Discount:</span>
                  <span>{showReceipt.discountType === 'Percentage' ? `-${showReceipt.discount}%` : `-PKR ${showReceipt.discount.toLocaleString()}`}</span>
                </div>
              </div>
            )}

            <div className="flex justify-between items-center text-xs font-bold mb-4">
              <span>Total:</span>
              <span>PKR {showReceipt.totalAmount.toLocaleString()}</span>
            </div>

            <div className="text-center text-[10px] border-t border-black/10 pt-3 italic opacity-60 mb-4">
              <p>Thank you for shopping at Al Sheikh Mobiles!</p>
              <p>No Return. Exchange within 3 days.</p>
            </div>

            <div className="flex gap-3">
              <button onClick={() => window.print()} className="flex-1 bg-black text-white py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1 cursor-pointer">
                <span className="material-symbols-outlined text-[16px]">print</span> Print
              </button>
              <button onClick={() => setShowReceipt(null)} className="flex-1 bg-gray-100 hover:bg-gray-200 border border-gray-300 text-black py-2 rounded-lg text-xs font-bold cursor-pointer">
                Close
              </button>
            </div>
          </div>
        </div>
      , document.body)}
    </div>
  );
};

export default AccessoriesPOS;
