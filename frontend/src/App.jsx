import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import AddMobileForm from './components/AddMobileForm';
import MobileList from './components/MobileList';
import SellMobileModal from './components/SellMobileModal';
import LedgerView from './components/LedgerView';
import DashboardView from './components/DashboardView';

function App() {
  const [activeTab, setActiveTab] = useState('inventory'); // 'inventory' | 'ledger' | 'dashboard'
  const [mobiles, setMobiles] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMobile, setSelectedMobile] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    fetchMobiles();
    fetchCustomers();
  }, []);

  const fetchMobiles = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/mobiles');
      setMobiles(response.data);
    } catch (error) {
      console.error('Error fetching mobiles from backend, loading demo mobiles instead...');
      generateDemoMobiles();
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/customers');
      setCustomers(response.data);
    } catch (error) {
      console.error('Error fetching customers from backend, loading demo ledger instead...');
      generateDemoCustomers();
    }
  };

  const generateDemoMobiles = () => {
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
  };

  const generateDemoCustomers = () => {
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

  return (
    <div className="flex bg-background min-h-screen text-on-surface select-none">
      <ToastContainer theme="dark" position="bottom-right" />
      
      {/* SideNavBar */}
      <aside className="w-[280px] h-screen fixed left-0 top-0 bg-surface-container border-r border-white/10 shadow-2xl shadow-black/40 flex flex-col py-lg z-50">
        <div className="px-lg mb-xl">
          <h1 className="font-headline-md text-headline-md text-primary tracking-tight font-bold">Al Sheikh Mobiles</h1>
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

      {/* Main Content Area */}
      <main className="ml-[280px] flex-1 flex flex-col relative min-h-screen">
        {/* TopNavBar */}
        <header className="fixed top-0 right-0 left-[280px] z-40 bg-surface/70 backdrop-blur-xl border-b border-white/5 shadow-sm shadow-black/20 flex justify-between items-center px-margin-desktop h-16">
          <div className="flex items-center gap-lg flex-1 max-w-xl">
            <div className="relative w-full group">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors">search</span>
              <input 
                type="text"
                className="w-full bg-surface-container-lowest border-none rounded-full py-2 pl-10 pr-4 text-on-surface placeholder:text-on-surface-variant/50 focus:ring-2 focus:ring-primary/50 transition-all outline-none"
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
          <div className="flex items-center gap-md">
            <button className="hover:bg-white/5 rounded-full p-2 text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer">
              <span className="material-symbols-outlined">notifications</span>
            </button>
            <button className="hover:bg-white/5 rounded-full p-2 text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer">
              <span className="material-symbols-outlined">settings</span>
            </button>
            <div className="h-8 w-[1px] bg-white/10 mx-2"></div>
            <div className="flex items-center gap-sm cursor-pointer hover:opacity-85 transition-opacity">
              <img 
                className="w-9 h-9 rounded-full border border-primary/30 object-cover" 
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

        {/* Scrollable Content Canvas */}
        <div className="flex-1 mt-16 pb-16 overflow-y-auto custom-scrollbar">
          <div className="px-margin-desktop py-xl">
            {activeTab === 'inventory' ? (
              <div>
                {/* Header Section */}
                <div className="flex justify-between items-end mb-lg">
                  <div>
                    <h2 className="font-headline-lg text-headline-lg text-on-surface font-semibold">Inventory Management</h2>
                    <p className="font-body-md text-on-surface-variant">Manage flagship devices, stock levels and customer credit.</p>
                  </div>
                  <div className="flex gap-sm">
                    <button className="bg-surface-container-high border border-white/10 px-md py-2 rounded-lg flex items-center gap-2 hover:bg-surface-container-highest transition-colors cursor-pointer text-xs font-semibold">
                      <span className="material-symbols-outlined text-[16px]">filter_list</span> Filter
                    </button>
                    <button className="bg-surface-container-high border border-white/10 px-md py-2 rounded-lg flex items-center gap-2 hover:bg-surface-container-highest transition-colors cursor-pointer text-xs font-semibold">
                      <span className="material-symbols-outlined text-[16px]">download</span> Export
                    </button>
                  </div>
                </div>

                {/* Bento Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-gutter mb-xl">
                  <div className="frosted-metal p-lg rounded-xl flex flex-col justify-between h-32">
                    <span className="text-primary-fixed-dim material-symbols-outlined self-start">smartphone</span>
                    <div>
                      <p className="text-on-surface-variant text-[11px] uppercase tracking-wider">Total Available Stock</p>
                      <h3 className="text-headline-md font-mono-data font-bold mt-1 text-on-surface">{totalStockCount} Units</h3>
                    </div>
                  </div>
                  <div className="frosted-metal p-lg rounded-xl flex flex-col justify-between h-32 border-l-4 border-l-secondary">
                    <span className="text-secondary material-symbols-outlined self-start">payments</span>
                    <div>
                      <p className="text-on-surface-variant text-[11px] uppercase tracking-wider">Monthly Revenue</p>
                      <h3 className="text-headline-md font-mono-data font-bold mt-1 text-secondary">PKR {monthlyRevenue.toLocaleString()}</h3>
                    </div>
                  </div>
                  <div className="frosted-metal p-lg rounded-xl flex flex-col justify-between h-32 border-l-4 border-l-tertiary">
                    <span className="text-tertiary material-symbols-outlined self-start">pending_actions</span>
                    <div>
                      <p className="text-on-surface-variant text-[11px] uppercase tracking-wider">Total Outstanding Udhaar</p>
                      <h3 className="text-headline-md font-mono-data font-bold mt-1 text-tertiary">PKR {totalUdhaar.toLocaleString()}</h3>
                    </div>
                  </div>
                  <div className="frosted-metal p-lg rounded-xl flex flex-col justify-between h-32 border-l-4 border-l-error">
                    <span className="text-error material-symbols-outlined self-start">warning</span>
                    <div>
                      <p className="text-on-surface-variant text-[11px] uppercase tracking-wider">Low Stock Models</p>
                      <h3 className="text-headline-md font-mono-data font-bold mt-1 text-error">{lowStockAlert} Models</h3>
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
                    mobiles={mobiles.filter(m => 
                      m.imei.includes(searchQuery) || 
                      m.model.toLowerCase().includes(searchQuery.toLowerCase())
                    )} 
                    onSellClick={(mobile) => setSelectedMobile(mobile)} 
                  />
                )}
              </div>
            ) : activeTab === 'ledger' ? (
              <LedgerView 
                customers={customers} 
                searchQuery={searchQuery}
                onPayment={(updatedCustomer) => {
                  setCustomers(customers.map(c => c._id === updatedCustomer._id ? updatedCustomer : c));
                  fetchMobiles(); // Reload mobiles to catch any status updates
                }}
                onAddPerson={(newPerson) => {
                  setCustomers([newPerson, ...customers]);
                }}
              />
            ) : (
              <DashboardView 
                mobiles={mobiles} 
                customers={customers} 
                searchQuery={searchQuery}
              />
            )}
          </div>
        </div>

        {/* Footer */}
        <footer className="fixed bottom-0 right-0 left-[280px] bg-surface-container-lowest border-t border-white/5 flex justify-between items-center px-margin-desktop py-xs z-30">
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

      {/* Add New Mobile Modal Overlay */}
      {showAddModal && (
        <AddMobileForm 
          onMobileAdded={handleMobileAdded} 
          customers={customers}
          onClose={() => setShowAddModal(false)}
        />
      )}

      {/* Sell Mobile Modal Overlay */}
      {selectedMobile && (
        <SellMobileModal 
          mobile={selectedMobile} 
          customers={customers}
          onClose={() => setSelectedMobile(null)} 
          onSold={handleMobileSold} 
        />
      )}
    </div>
  );
}

export default App;
