import React, { useState, useMemo } from 'react';

const DashboardView = ({ mobiles, customers = [], searchQuery }) => {
  const [filterType, setFilterType] = useState('all'); // 'all' | 'month' | 'custom'
  const [selectedMonth, setSelectedMonth] = useState(''); // YYYY-MM format
  const [customRange, setCustomRange] = useState({ start: '', end: '' });
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Helper to check if a date is within selected filter range
  const isDateInFilter = (dateString) => {
    if (!dateString) return false;
    const date = new Date(dateString);
    if (filterType === 'month') {
      if (!selectedMonth) return true;
      const [year, month] = selectedMonth.split('-');
      return date.getFullYear() === parseInt(year) && (date.getMonth() + 1) === parseInt(month);
    }
    if (filterType === 'custom') {
      const start = customRange.start ? new Date(customRange.start) : null;
      const end = customRange.end ? new Date(customRange.end) : null;
      if (start && end) {
        const compareStart = new Date(start);
        compareStart.setHours(0, 0, 0, 0);
        const compareEnd = new Date(end);
        compareEnd.setHours(23, 59, 59, 999);
        return date >= compareStart && date <= compareEnd;
      }
    }
    return true;
  };

  // Gather list of sold mobiles
  const soldMobiles = useMemo(() => {
    return mobiles.filter(m => m.status === 'Sold');
  }, [mobiles]);

  // Extract unique months from sold dates for the dropdown filter
  const uniqueMonths = useMemo(() => {
    const months = new Set();
    soldMobiles.forEach(m => {
      if (m.soldAt) {
        const date = new Date(m.soldAt);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        months.add(`${year}-${month}`);
      }
    });
    return Array.from(months).sort().reverse(); // Show latest months first
  }, [soldMobiles]);

  // Filter sold mobiles based on search query AND chosen date criteria
  const filteredSales = useMemo(() => {
    return soldMobiles.filter(m => {
      const matchesDate = isDateInFilter(m.soldAt);
      const matchesSearch = !searchQuery || 
        m.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.imei.includes(searchQuery) ||
        (m.soldTo && m.soldTo.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesDate && matchesSearch;
    });
  }, [soldMobiles, filterType, selectedMonth, customRange, searchQuery]);

  // Calculate payments collected in this period
  const paymentsCollected = useMemo(() => {
    let total = 0;
    customers.forEach(c => {
      c.transactions.forEach(t => {
        if (t.type === 'Payment' && isDateInFilter(t.date)) {
          const isSupplierPayment = t.description?.includes('Paid') || t.description?.includes('OUT') || t.description?.includes('Supplier');
          if (!isSupplierPayment) {
            total += t.amount;
          }
        }
      });
    });
    return total;
  }, [customers, filterType, selectedMonth, customRange]);

  // Metrics calculations
  const metrics = useMemo(() => {
    let sales = 0;
    let cost = 0;
    let udhaarSales = 0;
    
    filteredSales.forEach(m => {
      const sellPrice = Number(m.sellingPrice) || 0;
      sales += sellPrice;
      cost += Number(m.purchasingPrice) || 0;
      if (m.paymentType === 'Udhaar') {
        udhaarSales += sellPrice;
      }
    });

    const profit = sales - cost;
    const margin = sales > 0 ? (profit / sales) * 100 : 0;
    
    // Pending Udhaar is the total amount that was sold on Udhaar but has NOT been paid back yet in this period
    // Realized Cash is Sales - Remaining Udhaar
    const remainingUdhaar = Math.max(0, udhaarSales - paymentsCollected);
    const realizedCash = sales - remainingUdhaar;

    return { sales, cost, profit, margin, udhaarSales, remainingUdhaar, realizedCash };
  }, [filteredSales, paymentsCollected]);

  // Pagination Logic
  const paginatedSales = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredSales.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredSales, currentPage]);

  const totalPages = Math.ceil(filteredSales.length / itemsPerPage);

  const resetFilters = () => {
    setFilterType('all');
    setSelectedMonth('');
    setCustomRange({ start: '', end: '' });
    setCurrentPage(1);
  };

  const getMonthName = (monthString) => {
    const [year, month] = monthString.split('-');
    const date = new Date(year, parseInt(month) - 1, 1);
    return date.toLocaleDateString('default', { month: 'long', year: 'numeric' });
  };

  return (
    <div className="space-y-lg text-left font-body-md">
      
      {/* Header and Date Filter Panel */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-md mb-lg">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-on-surface font-semibold">Sales & Profit Analytics</h2>
          <p className="text-on-surface-variant font-body-md text-sm">Performance overview for Flagship Store operations</p>
        </div>

        <div className="flex items-center gap-sm bg-surface-container-low/70 backdrop-blur-md p-1 border border-white/5 rounded-xl flex-wrap">
          <select 
            className="bg-transparent border-none text-xs font-semibold text-on-surface outline-none px-md py-1.5 rounded-lg cursor-pointer hover:bg-white/5 transition-colors"
            value={filterType}
            onChange={(e) => {
              setFilterType(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="all">All-Time Sales</option>
            <option value="month">Filter by Month</option>
            <option value="custom">Custom Date Range</option>
          </select>

          {filterType === 'month' && (
            <select
              className="bg-surface-container-highest border border-white/10 text-xs text-on-surface rounded-lg px-2 py-1 outline-none"
              value={selectedMonth}
              onChange={(e) => {
                setSelectedMonth(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="">Select Month</option>
              {uniqueMonths.map(m => (
                <option key={m} value={m}>{getMonthName(m)}</option>
              ))}
            </select>
          )}

          {filterType === 'custom' && (
            <div className="flex items-center gap-1.5 px-2 text-xs">
              <input
                type="date"
                className="bg-surface-container-highest border border-white/10 text-on-surface rounded-lg px-1.5 py-0.5 outline-none font-mono-data"
                value={customRange.start}
                onChange={(e) => {
                  setCustomRange({ ...customRange, start: e.target.value });
                  setCurrentPage(1);
                }}
              />
              <span className="text-on-surface-variant">to</span>
              <input
                type="date"
                className="bg-surface-container-highest border border-white/10 text-on-surface rounded-lg px-1.5 py-0.5 outline-none font-mono-data"
                value={customRange.end}
                onChange={(e) => {
                  setCustomRange({ ...customRange, end: e.target.value });
                  setCurrentPage(1);
                }}
              />
            </div>
          )}

          {(filterType !== 'all' || selectedMonth || customRange.start) && (
            <button 
              onClick={resetFilters} 
              className="bg-white/5 border border-white/10 px-md py-1.5 text-xs text-on-surface-variant hover:text-on-surface rounded-lg cursor-pointer"
            >
              Reset
            </button>
          )}
        </div>
      </section>

      {/* KPI Bento Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-md">
        
        {/* Total Sales */}
        <div className="frosted-metal p-md rounded-xl space-y-sm">
          <div className="flex justify-between items-start">
            <span className="material-symbols-outlined text-primary text-xl">payments</span>
            <span className="text-secondary font-mono-data text-[10px] flex items-center gap-0.5">
              +12% <span className="material-symbols-outlined text-[12px]">trending_up</span>
            </span>
          </div>
          <div>
            <p className="font-label-md text-[10px] text-on-surface-variant uppercase tracking-wider">Total Sales</p>
            <h3 className="font-headline-md text-[16px] font-bold text-on-surface font-mono-data mt-1">
              ₨ {metrics.sales.toLocaleString()}
            </h3>
          </div>
        </div>

        {/* Purchases */}
        <div className="frosted-metal p-md rounded-xl space-y-sm">
          <div className="flex justify-between items-start">
            <span className="material-symbols-outlined text-primary-fixed-dim text-xl">shopping_cart</span>
          </div>
          <div>
            <p className="font-label-md text-[10px] text-on-surface-variant uppercase tracking-wider">Purchases</p>
            <h3 className="font-headline-md text-[16px] font-bold text-on-surface font-mono-data mt-1">
              ₨ {metrics.cost.toLocaleString()}
            </h3>
          </div>
        </div>

        {/* Net Profit */}
        <div className="frosted-metal p-md rounded-xl space-y-sm relative overflow-hidden emerald-glow border-l-4 border-l-secondary">
          <div className="absolute top-0 right-0 w-16 h-16 bg-secondary/5 blur-2xl -mr-8 -mt-8"></div>
          <div className="flex justify-between items-start relative">
            <span className="material-symbols-outlined text-secondary text-xl">account_balance_wallet</span>
            <span className="text-secondary font-mono-data text-[10px] flex items-center gap-0.5">
              +18% <span className="material-symbols-outlined text-[12px]">trending_up</span>
            </span>
          </div>
          <div className="relative">
            <p className="font-label-md text-[10px] text-on-surface-variant uppercase tracking-wider">Net Profit</p>
            <h3 className="font-headline-md text-[16px] font-bold text-secondary font-mono-data mt-1">
              ₨ {metrics.profit.toLocaleString()}
            </h3>
          </div>
        </div>

        {/* Profit Margin */}
        <div className="frosted-metal p-md rounded-xl space-y-sm">
          <div className="flex justify-between items-start">
            <span className="material-symbols-outlined text-tertiary text-xl">percent</span>
          </div>
          <div>
            <p className="font-label-md text-[10px] text-on-surface-variant uppercase tracking-wider">Profit Margin</p>
            <h3 className="font-headline-md text-[16px] font-bold text-on-surface font-mono-data mt-1">
              {metrics.margin.toFixed(1)}%
            </h3>
          </div>
        </div>

        {/* Pending Udhaar */}
        <div className="frosted-metal p-md rounded-xl space-y-sm relative overflow-hidden border-l-4 border-l-tertiary">
          <div className="absolute top-0 right-3 w-3 h-6 bg-tertiary/20 rounded-b"></div>
          <div className="flex justify-between items-start">
            <span className="material-symbols-outlined text-tertiary text-xl">pending_actions</span>
          </div>
          <div>
            <p className="font-label-md text-[10px] text-on-surface-variant uppercase tracking-wider">Pending Udhaar</p>
            <h3 className="font-headline-md text-[16px] font-bold text-tertiary font-mono-data mt-1">
              ₨ {metrics.remainingUdhaar.toLocaleString()}
            </h3>
          </div>
        </div>

        {/* Realized Cash */}
        <div className="frosted-metal p-md rounded-xl space-y-sm">
          <div className="flex justify-between items-start">
            <span className="material-symbols-outlined text-primary text-xl">currency_exchange</span>
          </div>
          <div>
            <p className="font-label-md text-[10px] text-on-surface-variant uppercase tracking-wider">Realized Cash</p>
            <h3 className="font-headline-md text-[16px] font-bold text-on-surface font-mono-data mt-1">
              ₨ {metrics.realizedCash.toLocaleString()}
            </h3>
          </div>
        </div>

      </section>

      {/* Main Analytics Table Section */}
      <section className="frosted-metal rounded-2xl overflow-hidden border border-white/5 shadow-xl">
        <div className="p-lg border-b border-white/5 flex justify-between items-center bg-surface-container-low/30">
          <div>
            <h4 className="font-headline-md text-[15px] font-bold text-on-surface">Sales Record Detailed Ledger</h4>
            <p className="text-[10px] text-on-surface-variant mt-0.5">Showing sales ledger logs for filter period</p>
          </div>
          <div className="flex gap-sm">
            <button className="p-2 hover:bg-white/5 text-on-surface-variant rounded-lg border border-white/10 cursor-pointer flex items-center justify-center">
              <span className="material-symbols-outlined text-sm">filter_list</span>
            </button>
            <button className="p-2 hover:bg-white/5 text-on-surface-variant rounded-lg border border-white/10 cursor-pointer flex items-center justify-center">
              <span className="material-symbols-outlined text-sm">download</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-surface-container-high/30 border-b border-white/5">
              <tr className="text-[10px] text-on-surface-variant uppercase tracking-widest font-semibold">
                <th className="px-lg py-md">Date</th>
                <th className="px-lg py-md">Device Model</th>
                <th className="px-lg py-md font-mono-data">IMEI / Serial</th>
                <th className="px-lg py-md">Buyer Info</th>
                <th className="px-lg py-md">Cost Price</th>
                <th className="px-lg py-md">Sale Price</th>
                <th className="px-lg py-md text-right">Unit Profit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono-data text-xs">
              {paginatedSales.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-20 text-on-surface-variant font-body-md text-sm">
                    No sales matches found. Try modifying date filter or search query.
                  </td>
                </tr>
              ) : (
                paginatedSales.map((m) => {
                  const profitVal = (Number(m.sellingPrice) || 0) - (Number(m.purchasingPrice) || 0);
                  const isUdhaar = m.paymentType === 'Udhaar';
                  return (
                    <tr key={m._id} className="hover:bg-white/5 transition-colors duration-150 group hover-slide-right">
                      <td className="px-lg py-md text-on-surface-variant">
                        {m.soldAt ? new Date(m.soldAt).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-lg py-md font-bold text-on-surface font-body-md text-[13px]">
                        {m.model}
                      </td>
                      <td className="px-lg py-md text-on-surface-variant">
                        {m.imei}
                      </td>
                      <td className="px-lg py-md font-body-md text-on-surface">
                        <div className="flex items-center gap-1.5">
                          <span>{m.soldTo || 'Walk-in'}</span>
                          <span className={`px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase ${
                            isUdhaar ? 'bg-tertiary/15 text-tertiary border border-tertiary/10' : 'bg-secondary/15 text-secondary border border-secondary/10'
                          }`}>
                            {m.paymentType || 'Cash'}
                          </span>
                        </div>
                        {m.buyerCnic && <span className="block text-[10px] text-on-surface-variant font-mono-data mt-0.5">{m.buyerCnic}</span>}
                      </td>
                      <td className="px-lg py-md text-on-surface-variant">
                        ₨ {m.purchasingPrice?.toLocaleString()}
                      </td>
                      <td className="px-lg py-md text-primary font-bold">
                        ₨ {m.sellingPrice?.toLocaleString()}
                      </td>
                      <td className="px-lg py-md text-right text-secondary font-bold text-[13px]">
                        ₨ {profitVal.toLocaleString()}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Panel */}
        {totalPages > 1 && (
          <div className="p-md border-t border-white/5 bg-surface-container-low/50 flex justify-between items-center text-xs">
            <span className="font-semibold text-on-surface-variant">
              Showing {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, filteredSales.length)} of {filteredSales.length} records
            </span>
            <div className="flex gap-1.5 items-center">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-white/10 hover:bg-white/5 text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-[16px]">chevron_left</span>
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-1.5 rounded-lg font-bold border transition-colors cursor-pointer ${
                    currentPage === page 
                      ? 'bg-primary/20 text-primary border-primary/30' 
                      : 'border-white/10 hover:bg-white/5 text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  {page}
                </button>
              ))}

              <button 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg border border-white/10 hover:bg-white/5 text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-[16px]">chevron_right</span>
              </button>
            </div>
          </div>
        )}
      </section>

    </div>
  );
};

export default DashboardView;
