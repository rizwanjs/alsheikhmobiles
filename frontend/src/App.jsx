import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import axios from 'axios';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import AddMobileForm from './components/AddMobileForm';
import MobileList from './components/MobileList';
import SellMobileModal from './components/SellMobileModal';
import LedgerView from './components/LedgerView';
import DashboardView from './components/DashboardView';
import FilterPanel from './components/FilterPanel';
import MobileDetailModal from './components/MobileDetailModal';
import AccessoriesPOS from './components/AccessoriesPOS';
import { API_URL } from './config';

function App() {
  const [activeTab, setActiveTab] = useState('inventory'); // 'inventory' | 'ledger' | 'dashboard'
  const [mobiles, setMobiles] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMobile, setSelectedMobile] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [detailMobile, setDetailMobile] = useState(null);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [filters, setFilters] = useState({
    brands: [],
    condition: '',
    priceMin: '',
    priceMax: '',
    paymentType: 'All'
  });
  const filterBtnRef = useRef(null);

  useEffect(() => {
    // Fetch from backend or fall back to demo data
    axios.get(`${API_URL}/api/mobiles`)
      .then(res => setMobiles(res.data))
      .catch(() => generateDemoMobiles())
      .finally(() => setLoading(false));

    axios.get(`${API_URL}/api/customers`)
      .then(res => setCustomers(res.data))
      .catch(() => generateDemoCustomers());
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function generateDemoMobiles() {
    const demoMobiles = [];
    const brands = ['Apple', 'Samsung', 'Xiaomi', 'Oppo', 'Vivo'];
    const models = {
      'Apple': ['iPhone 13', 'iPhone 14', 'iPhone 15 Pro Max', 'iPhone 12', 'iPhone 11'],
      'Samsung': ['Galaxy S23', 'Galaxy S24 Ultra', 'Galaxy A54', 'Galaxy Z Fold 5'],
      'Xiaomi': ['Redmi Note 12', 'Poco X5', 'Xiaomi 13T'],
      'Oppo': ['Reno 10', 'A78', 'Find X6'],
      'Vivo': ['V29', 'Y36', 'X90']
    };
    
    const conditions = ['Brand New (Box Packed)', 'Like New (10/10)', 'Good (9/10)', 'Fair (8/10)', 'Rough'];
    const sellerNames = ['Ahmad', 'Bilal', 'Usman', 'Ali', 'Zain', 'Hamza', 'Saad'];
    
    for (let i = 0; i < 100; i++) {
      const brand = brands[Math.floor(Math.random() * brands.length)];
      const modelList = models[brand];
      const modelName = modelList[Math.floor(Math.random() * modelList.length)];
      
      let imei = '';
      let cnic = '35202-';
      let buyerCnic = '35202-';
      for (let j = 0; j < 15; j++) imei += Math.floor(Math.random() * 10).toString();
      for (let j = 0; j < 7; j++) cnic += Math.floor(Math.random() * 10).toString();
      cnic += `-${Math.floor(Math.random() * 9) + 1}`;
      for (let j = 0; j < 7; j++) buyerCnic += Math.floor(Math.random() * 10).toString();
      buyerCnic += `-${Math.floor(Math.random() * 9) + 1}`;
      
      const rand = Math.random();
      let status = 'Available';
      let paymentType = '';
      let soldTo = '';
      let bCnic = '';
      let sPrice = '';
      let soldAt = null;
      
      const pPrice = Math.floor(Math.random() * 150) * 1000 + 20000;

      if (rand < 0.35) {
        status = 'Sold';
        paymentType = 'Cash';
        soldTo = sellerNames[Math.floor(Math.random() * sellerNames.length)] + " (Customer)";
        bCnic = buyerCnic;
        sPrice = pPrice + (Math.floor(Math.random() * 5) * 1000 + 2000);
        soldAt = new Date(Date.now() - Math.floor(Math.random() * 90) * 24 * 60 * 60 * 1000).toISOString();
      } else if (rand < 0.65) {
        status = 'Sold';
        paymentType = 'Udhaar';
        soldTo = sellerNames[Math.floor(Math.random() * sellerNames.length)] + " (Customer)";
        bCnic = buyerCnic;
        sPrice = pPrice + (Math.floor(Math.random() * 10) * 1000 + 5000);
        soldAt = new Date(Date.now() - Math.floor(Math.random() * 90) * 24 * 60 * 60 * 1000).toISOString();
      }
      
      demoMobiles.push({
        _id: `demo-${i}`,
        model: modelName,
        purchasingPrice: pPrice,
        sellingPrice: sPrice ? Number(sPrice) : undefined,
        imei: imei,
        details: `PTA Approved. Color: ${['Black', 'White', 'Blue'][Math.floor(Math.random() * 3)]}`,
        status: status,
        soldTo: soldTo,
        paymentType: paymentType,
        buyerCnic: bCnic,
        condition: conditions[Math.floor(Math.random() * conditions.length)],
        sellerName: sellerNames[Math.floor(Math.random() * sellerNames.length)],
        sellerCnic: cnic,
        soldAt: soldAt
      });
    }
    setMobiles(demoMobiles);
  }

  function generateDemoCustomers() {
    setCustomers([
      {
        _id: 'cust-1',
        name: 'Ali (Customer)',
        phone: '0300-1234567',
        balance: 25000,
        transactions: [
          { type: 'Purchase', amount: 55000, description: 'Bought iPhone 13 on Udhaar', date: new Date(Date.now() - 86400000 * 5).toISOString() },
          { type: 'Payment', amount: 30000, description: 'Cash partial payment', date: new Date().toISOString() }
        ]
      },
      {
        _id: 'cust-2',
        name: 'Usman (Customer)',
        phone: '0321-9876543',
        balance: 105000,
        transactions: [
          { type: 'Purchase', amount: 105000, description: 'Bought Galaxy S23 on Udhaar', date: new Date().toISOString() }
        ]
      },
      {
        _id: 'supp-1',
        name: 'Ahmed (Supplier)',
        phone: '0333-1112223',
        balance: -45000,
        transactions: [
          { type: 'Purchase', amount: 45000, description: 'Supplied Redmi Note 12 on Udhaar', date: new Date(Date.now() - 86400000).toISOString() }
        ]
      },
      {
        _id: 'cust-3',
        name: 'Zain (Customer)',
        phone: '0345-5556667',
        balance: 0,
        transactions: [
          { type: 'Purchase', amount: 45000, description: 'Bought Redmi Note 12 on Udhaar', date: new Date(Date.now() - 86400000 * 2).toISOString() },
          { type: 'Payment', amount: 45000, description: 'Full payment received', date: new Date().toISOString() }
        ]
      }
    ]);
  }

  const getBrand = (model) => {
    const m = (model || '').toLowerCase();
    if (m.includes('iphone') || m.includes('apple')) return 'Apple';
    if (m.includes('galaxy') || m.includes('samsung') || m.includes('fold') || m.includes('flip')) return 'Samsung';
    if (m.includes('redmi') || m.includes('poco') || m.includes('xiaomi')) return 'Xiaomi';
    if (m.includes('reno') || m.includes('find') || m.includes('oppo')) return 'Oppo';
    if (m.includes('vivo')) return 'Vivo';
    return 'Other';
  };

  const handleMobileAdded = (newMobile, newSupplierData = null) => {
    setMobiles([newMobile, ...mobiles]);
    if (newSupplierData) {
      const exists = customers.find(c => c.name === newSupplierData.name);
      if (exists) {
        setCustomers(customers.map(c => c.name === newSupplierData.name ? newSupplierData : c));
      } else {
        setCustomers([newSupplierData, ...customers]);
      }
    }
    setShowAddModal(false);
    setActiveTab('inventory');
  };

  const handleMobileSold = (updatedMobile, newCustomerData = null) => {
    setMobiles(mobiles.map(m => m._id === updatedMobile._id ? updatedMobile : m));
    if (newCustomerData) {
      const exists = customers.find(c => c.name === newCustomerData.name);
      if (exists) {
        setCustomers(customers.map(c => c.name === newCustomerData.name ? newCustomerData : c));
      } else {
        setCustomers([newCustomerData, ...customers]);
      }
    }
    setSelectedMobile(null);
  };

  // Stats calculation
  const totalStockCount = useMemo(() => {
    return mobiles.filter(m => m.status === 'Available').length;
  }, [mobiles]);

  const monthlyRevenue = useMemo(() => {
    const now = new Date();
    return mobiles.reduce((acc, m) => {
      if (m.status === 'Sold' && m.soldAt) {
        const soldDate = new Date(m.soldAt);
        if (soldDate.getFullYear() === now.getFullYear() && soldDate.getMonth() === now.getMonth()) {
          return acc + (Number(m.sellingPrice) || 0);
        }
      }
      return acc;
    }, 0);
  }, [mobiles]);

  const totalUdhaar = useMemo(() => {
    return customers.reduce((acc, c) => {
      return acc + (c.balance > 0 ? c.balance : 0);
    }, 0);
  }, [customers]);

  const lowStockAlert = useMemo(() => {
    const counts = {};
    mobiles.forEach(m => {
      if (m.status === 'Available') {
        counts[m.model] = (counts[m.model] || 0) + 1;
      }
    });
    return Object.values(counts).filter(c => c < 3).length;
  }, [mobiles]);

  const searchAndFilteredMobiles = useMemo(() => {
    return mobiles.filter(m => {
      const matchSearch = m.imei.includes(searchQuery) || m.model.toLowerCase().includes(searchQuery.toLowerCase());
      const matchBrand = filters.brands.length === 0 || filters.brands.includes(getBrand(m.model));
      const matchCondition = !filters.condition || m.condition === filters.condition;
      const price = Number(m.purchasingPrice) || 0;
      const matchPriceMin = !filters.priceMin || price >= Number(filters.priceMin);
      const matchPriceMax = !filters.priceMax || price <= Number(filters.priceMax);
      const matchPayment = filters.paymentType === 'All' ||
        (m.status === 'Available' ? false : m.paymentType === filters.paymentType);
      return matchSearch && matchBrand && matchCondition && matchPriceMin && matchPriceMax &&
        (filters.paymentType === 'All' ? true : matchPayment);
    });
  }, [mobiles, searchQuery, filters]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleExport = () => {
    const headers = ['Model','IMEI','Status','Condition','Purchasing Price (PKR)','Selling Price (PKR)','Seller Name','Seller Phone','Seller CNIC','Sold To','Buyer Phone','Buyer CNIC','Payment Type','Sold Date'];
    const rows = mobiles.map(m => [
      m.model || '', m.imei || '', m.status || '', m.condition || '',
      m.purchasingPrice || '', m.sellingPrice || '', m.sellerName || '',
      m.sellerPhone || '', m.sellerCnic || '', m.soldTo || '',
      m.buyerPhone || '', m.buyerCnic || '', m.paymentType || '',
      m.soldAt ? new Date(m.soldAt).toLocaleDateString() : ''
    ]);
    const csv = [headers, ...rows].map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Al_Sheikh_Mobiles_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex bg-background min-h-screen text-on-surface select-none">
      <ToastContainer theme="dark" position="bottom-right" />
      
      {/* ===== SIDEBAR (Desktop only) ===== */}
      <aside className="hidden md:flex w-[230px] h-screen fixed left-0 top-0 bg-surface-container border-r border-white/10 shadow-2xl shadow-black/40 flex-col py-lg z-50">
        <div className="px-lg mb-xl">
          <h1 className="font-headline-md text-headline-md text-primary tracking-tight font-bold">Al Sheikh</h1>
          <p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-widest mt-1">Flagship Store</p>
        </div>
        
        <nav className="flex-1 space-y-1">
          <button 
            onClick={() => setActiveTab('inventory')}
            className={`w-full flex items-center gap-md px-lg py-md transition-all duration-200 text-left border-r-4 outline-none cursor-pointer ${
              activeTab === 'inventory' 
                ? 'bg-primary-container/20 text-primary border-primary active-nav-glow' 
                : 'text-on-surface-variant hover:text-on-surface hover:bg-white/5 border-transparent'
            }`}
          >
            <span className="material-symbols-outlined">inventory_2</span>
            <span className="font-label-md text-label-md">Inventory</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('ledger')}
            className={`w-full flex items-center gap-md px-lg py-md transition-all duration-200 text-left border-r-4 outline-none cursor-pointer ${
              activeTab === 'ledger' 
                ? 'bg-primary-container/20 text-primary border-primary active-nav-glow' 
                : 'text-on-surface-variant hover:text-on-surface hover:bg-white/5 border-transparent'
            }`}
          >
            <span className="material-symbols-outlined">menu_book</span>
            <span className="font-label-md text-label-md">Ledger</span>
          </button>

          <button 
            onClick={() => setActiveTab('accessories')}
            className={`w-full flex items-center gap-md px-lg py-md transition-all duration-200 text-left border-r-4 outline-none cursor-pointer ${
              activeTab === 'accessories' 
                ? 'bg-primary-container/20 text-primary border-primary active-nav-glow' 
                : 'text-on-surface-variant hover:text-on-surface hover:bg-white/5 border-transparent'
            }`}
          >
            <span className="material-symbols-outlined">cable</span>
            <span className="font-label-md text-label-md">Accessories & POS</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-md px-lg py-md transition-all duration-200 text-left border-r-4 outline-none cursor-pointer ${
              activeTab === 'dashboard' 
                ? 'bg-primary-container/20 text-primary border-primary active-nav-glow' 
                : 'text-on-surface-variant hover:text-on-surface hover:bg-white/5 border-transparent'
            }`}
          >
            <span className="material-symbols-outlined">analytics</span>
            <span className="font-label-md text-label-md">Analytics</span>
          </button>
        </nav>

        <div className="px-lg mt-auto">
          <button 
            onClick={() => setShowAddModal(true)}
            className="w-full bg-primary-container text-on-primary-container py-md rounded-xl font-bold active:scale-[0.98] transition-transform flex items-center justify-center gap-2 mb-lg shadow-lg shadow-primary-container/20 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">add_circle</span>
            New Entry
          </button>
          <div className="flex items-center gap-sm text-secondary font-label-md">
            <span className="material-symbols-outlined text-[14px]">sensors</span>
            System Status: Live
          </div>
        </div>
      </aside>

      {/* ===== MAIN CONTENT ===== */}
      <main className="md:ml-[230px] flex-1 flex flex-col relative min-h-screen">

        {/* ===== TOP HEADER ===== */}
        <header className="fixed top-0 right-0 left-0 md:left-[230px] z-40 bg-surface/70 backdrop-blur-xl border-b border-white/5 shadow-sm shadow-black/20 flex justify-between items-center px-4 md:px-margin-desktop h-14 md:h-16">
          
          {/* Mobile: Brand name | Desktop: Search bar */}
          <div className="flex items-center gap-3">
            {/* Mobile brand */}
            <span className="md:hidden font-bold text-primary text-lg tracking-tight">Al Sheikh</span>
            
            {/* Desktop search */}
            <div className="hidden md:flex items-center gap-lg w-[400px]">
              <div className="relative w-full group">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors">search</span>
                <input 
                  type="text"
                  className="w-full bg-surface-container-lowest border border-white/20 rounded-full py-2 pl-10 pr-4 text-on-surface placeholder:text-on-surface-variant/50 focus:ring-2 focus:ring-primary/50 transition-all outline-none"
                  placeholder={
                    activeTab === 'inventory' 
                      ? "Search inventory by IMEI or Model..." 
                      : activeTab === 'ledger' 
                      ? "Search accounts by name..." 
                      : "Search sales by model, buyer, or IMEI..."
                  }
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-md">
            {/* Mobile search icon */}
            <button 
              className="md:hidden hover:bg-white/5 rounded-full p-2 text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
              onClick={() => setShowMobileSearch(prev => !prev)}
            >
              <span className="material-symbols-outlined">{showMobileSearch ? 'close' : 'search'}</span>
            </button>

            <button className="hover:bg-white/5 rounded-full p-2 text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer">
              <span className="material-symbols-outlined">notifications</span>
            </button>
            <div className="hidden md:block h-8 w-[1px] bg-white/10 mx-2"></div>
            <div className="flex items-center gap-sm cursor-pointer hover:opacity-85 transition-opacity">
              <img 
                className="w-8 h-8 md:w-9 md:h-9 rounded-full border border-primary/30 object-cover" 
                alt="Admin Profile"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDgVFJndywTO5LzqtxfdhCtt9m0g1jdRMOicEbB1geas7tg5v55403QR0krnObf5PIQwHTr5XSKPrhQhPCvzuiGUOMIrPMuHyLsrw9EzjgpIbq_FM2rHa981zksLIxffSDgBoCHt73x3WogkRzSLOA6HNSIEFXgTZQAkMdVYwZAfT_EG2_GbWLOk-XPMt6Is397eHeuZLfZ-YebkAQlKCJTzzqRXjFSd8-6g2i9xeu15ErVDaf9wgchxPeWrTrov0ZuJT10Tr0IvYY"
              />
              <div className="hidden xl:block text-left">
                <p className="font-label-md text-on-surface leading-none text-xs">Admin Profile</p>
                <p className="text-[10px] text-on-surface-variant uppercase tracking-tighter mt-0.5">Chief Executive</p>
              </div>
            </div>
          </div>
        </header>

        {/* Mobile expandable search bar */}
        {showMobileSearch && (
          <div className="md:hidden fixed top-14 left-0 right-0 z-39 bg-surface/95 backdrop-blur-xl border-b border-white/10 px-4 py-3">
            <div className="relative w-full group">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors">search</span>
              <input 
                type="text"
                autoFocus
                className="w-full bg-surface-container-lowest border border-white/20 rounded-full py-2 pl-10 pr-4 text-on-surface placeholder:text-on-surface-variant/50 focus:ring-2 focus:ring-primary/50 transition-all outline-none"
                placeholder={
                  activeTab === 'inventory' 
                    ? "Search by IMEI or Model..." 
                    : activeTab === 'ledger' 
                    ? "Search accounts..." 
                    : "Search sales..."
                }
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* ===== SCROLLABLE CONTENT ===== */}
        <div className="flex-1 mt-14 md:mt-16 pb-20 md:pb-16 overflow-hidden">
          {activeTab === 'ledger' ? (
            <div className="h-full overflow-hidden">
              <LedgerView
                customers={customers}
                searchQuery={searchQuery}
                onPayment={(updatedCustomer) => {
                  setCustomers(customers.map(c => c._id === updatedCustomer._id ? updatedCustomer : c));
                }}
                onAddPerson={(newPerson) => {
                  setCustomers([newPerson, ...customers]);
                }}
              />
            </div>
          ) : activeTab === 'accessories' ? (
            <div className="h-full overflow-hidden">
              <AccessoriesPOS 
                customers={customers}
                onAddPerson={(newPerson) => {
                  setCustomers([newPerson, ...customers]);
                }}
                onPayment={(updatedCustomer) => {
                  setCustomers(customers.map(c => c._id === updatedCustomer._id ? updatedCustomer : c));
                }}
              />
            </div>
          ) : (
          <div className="px-4 md:px-margin-desktop py-4 md:py-xl overflow-y-auto h-full custom-scrollbar">
            {activeTab === 'inventory' ? (
              <div>
                {/* Header Section */}
                <div className="flex justify-between items-end mb-4 md:mb-lg">
                  <div>
                    <h2 className="text-xl md:font-headline-lg md:text-headline-lg text-on-surface font-semibold">Inventory</h2>
                    <p className="font-body-md text-on-surface-variant text-xs md:text-sm hidden md:block">Manage flagship devices, stock levels and customer credit.</p>
                  </div>
                  <div className="flex gap-sm relative">
                    <button
                      ref={filterBtnRef}
                      onClick={() => setShowFilterPanel(prev => !prev)}
                      className={`relative bg-surface-container-high border px-md py-2 rounded-lg flex items-center gap-2 hover:bg-surface-container-highest transition-colors cursor-pointer text-xs font-semibold ${
                        showFilterPanel ? 'border-primary/50 text-primary' : 'border-white/10'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[16px]">filter_list</span>
                      <span className="hidden sm:inline">Filter</span>
                      {(filters.brands.length > 0 || filters.condition || filters.priceMin || filters.priceMax || filters.paymentType !== 'All') && (
                        <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-primary"></span>
                      )}
                    </button>
                    <button
                      onClick={handleExport}
                      className="bg-surface-container-high border border-white/10 px-md py-2 rounded-lg flex items-center gap-2 hover:bg-surface-container-highest transition-colors cursor-pointer text-xs font-semibold"
                    >
                      <span className="material-symbols-outlined text-[16px]">download</span>
                      <span className="hidden sm:inline">Export</span>
                    </button>
                    {showFilterPanel && (
                      <FilterPanel
                        filters={filters}
                        onChange={setFilters}
                        onReset={() => setFilters({ brands: [], condition: '', priceMin: '', priceMax: '', paymentType: 'All' })}
                        onClose={() => setShowFilterPanel(false)}
                      />
                    )}
                  </div>
                </div>

                {/* Bento Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-gutter mb-4 md:mb-xl">
                  <div className="frosted-metal p-3 md:p-lg rounded-xl flex flex-col justify-between h-24 md:h-32">
                    <span className="text-primary-fixed-dim material-symbols-outlined self-start text-[20px] md:text-[24px]">smartphone</span>
                    <div>
                      <p className="text-on-surface-variant text-[10px] md:text-[11px] uppercase tracking-wider">Available Stock</p>
                      <h3 className="text-lg md:text-headline-md font-mono-data font-bold mt-1 text-on-surface">{totalStockCount} Units</h3>
                    </div>
                  </div>
                  <div className="frosted-metal p-3 md:p-lg rounded-xl flex flex-col justify-between h-24 md:h-32 border-l-4 border-l-secondary">
                    <span className="text-secondary material-symbols-outlined self-start text-[20px] md:text-[24px]">payments</span>
                    <div>
                      <p className="text-on-surface-variant text-[10px] md:text-[11px] uppercase tracking-wider">Monthly Revenue</p>
                      <h3 className="text-sm md:text-headline-md font-mono-data font-bold mt-1 text-secondary">PKR {monthlyRevenue.toLocaleString()}</h3>
                    </div>
                  </div>
                  <div className="frosted-metal p-3 md:p-lg rounded-xl flex flex-col justify-between h-24 md:h-32 border-l-4 border-l-tertiary">
                    <span className="text-tertiary material-symbols-outlined self-start text-[20px] md:text-[24px]">pending_actions</span>
                    <div>
                      <p className="text-on-surface-variant text-[10px] md:text-[11px] uppercase tracking-wider">Outstanding Udhaar</p>
                      <h3 className="text-sm md:text-headline-md font-mono-data font-bold mt-1 text-tertiary">PKR {totalUdhaar.toLocaleString()}</h3>
                    </div>
                  </div>
                  <div className="frosted-metal p-3 md:p-lg rounded-xl flex flex-col justify-between h-24 md:h-32 border-l-4 border-l-error">
                    <span className="text-error material-symbols-outlined self-start text-[20px] md:text-[24px]">warning</span>
                    <div>
                      <p className="text-on-surface-variant text-[10px] md:text-[11px] uppercase tracking-wider">Low Stock Models</p>
                      <h3 className="text-lg md:text-headline-md font-mono-data font-bold mt-1 text-error">{lowStockAlert} Models</h3>
                    </div>
                  </div>
                </div>

                {/* Mobile Cards Grid */}
                {loading ? (
                  <div className="text-center py-20 text-on-surface-variant">
                    <span className="material-symbols-outlined animate-spin text-4xl text-primary">sync</span>
                    <p className="mt-4">Loading active inventory...</p>
                  </div>
                ) : (
                  <MobileList 
                    mobiles={searchAndFilteredMobiles} 
                    onSellClick={(mobile) => setSelectedMobile(mobile)}
                    onDetailClick={(mobile) => setDetailMobile(mobile)}
                  />
                )}
              </div>
            ) : (
              <DashboardView 
                mobiles={mobiles} 
                customers={customers} 
                searchQuery={searchQuery}
              />
            )}
          </div>
          )}
        </div>

        {/* ===== FOOTER (Desktop only) ===== */}
        <footer className="hidden md:flex fixed bottom-0 right-0 left-[230px] bg-surface-container-lowest border-t border-white/5 justify-between items-center px-margin-desktop py-xs z-30">
          <div className="flex items-center gap-md">
            <span className="font-label-md text-label-md font-bold text-secondary text-xs">Al Sheikh Mobiles ERP</span>
            <span className="text-on-surface-variant text-[10px]">© 2026 • v2.4.0</span>
          </div>
          <div className="flex gap-lg">
            <a className="text-on-surface-variant hover:text-primary text-[11px] transition-colors cursor-pointer" href="#">Cloud Backup: Active</a>
            <a className="text-on-surface-variant hover:text-primary text-[11px] transition-colors cursor-pointer" href="#">Help Desk</a>
            <a className="text-on-surface-variant hover:text-primary text-[11px] transition-colors cursor-pointer" href="#">Security Logs</a>
          </div>
        </footer>
      </main>

      {/* ===== BOTTOM NAV BAR (Mobile only) ===== */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-surface-container/95 backdrop-blur-xl border-t border-white/10 flex items-center justify-around px-2 py-1 safe-area-pb">
        <button
          onClick={() => setActiveTab('inventory')}
          className={`flex flex-col items-center gap-0.5 px-4 py-2 rounded-xl transition-all cursor-pointer ${
            activeTab === 'inventory' ? 'text-primary' : 'text-on-surface-variant'
          }`}
        >
          <span className={`material-symbols-outlined text-[24px] transition-all ${
            activeTab === 'inventory' ? 'text-primary' : ''
          }`} style={{ fontVariationSettings: activeTab === 'inventory' ? "'FILL' 1" : "'FILL' 0" }}>inventory_2</span>
          <span className="text-[10px] font-semibold">Inventory</span>
        </button>

        {/* FAB - New Entry (center) */}
        <button
          onClick={() => setShowAddModal(true)}
          className="flex flex-col items-center gap-0.5 -mt-6 cursor-pointer"
        >
          <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center shadow-xl shadow-primary/40 active:scale-95 transition-transform">
            <span className="material-symbols-outlined text-on-primary text-[28px]">add</span>
          </div>
          <span className="text-[10px] font-semibold text-primary mt-0.5">Add</span>
        </button>

        <button
          onClick={() => setActiveTab('accessories')}
          className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-all cursor-pointer ${
            activeTab === 'accessories' ? 'text-primary' : 'text-on-surface-variant'
          }`}
        >
          <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: activeTab === 'accessories' ? "'FILL' 1" : "'FILL' 0" }}>cable</span>
          <span className="text-[10px] font-semibold">POS</span>
        </button>

        <button
          onClick={() => setActiveTab('ledger')}
          className={`flex flex-col items-center gap-0.5 px-4 py-2 rounded-xl transition-all cursor-pointer ${
            activeTab === 'ledger' ? 'text-primary' : 'text-on-surface-variant'
          }`}
        >
          <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: activeTab === 'ledger' ? "'FILL' 1" : "'FILL' 0" }}>menu_book</span>
          <span className="text-[10px] font-semibold">Ledger</span>
        </button>

        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center gap-0.5 px-4 py-2 rounded-xl transition-all cursor-pointer ${
            activeTab === 'dashboard' ? 'text-primary' : 'text-on-surface-variant'
          }`}
        >
          <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: activeTab === 'dashboard' ? "'FILL' 1" : "'FILL' 0" }}>analytics</span>
          <span className="text-[10px] font-semibold">Analytics</span>
        </button>
      </nav>

      {/* ===== MODALS ===== */}
      {showAddModal && (
        <AddMobileForm 
          onMobileAdded={handleMobileAdded} 
          customers={customers}
          onClose={() => setShowAddModal(false)}
        />
      )}
      {selectedMobile && (
        <SellMobileModal 
          mobile={selectedMobile} 
          customers={customers}
          onClose={() => setSelectedMobile(null)} 
          onSold={handleMobileSold} 
        />
      )}
      {detailMobile && (
        <MobileDetailModal
          mobile={detailMobile}
          onClose={() => setDetailMobile(null)}
          onSellClick={(mobile) => { setDetailMobile(null); setSelectedMobile(mobile); }}
          onReturn={(updatedMobile) => {
            setMobiles(mobiles.map(m => m._id === updatedMobile._id ? updatedMobile : m));
            setDetailMobile(null);
          }}
        />
      )}
    </div>
  );
}

export default App;
