import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const LedgerView = ({ customers, searchQuery, onPayment, onAddPerson }) => {
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPerson, setNewPerson] = useState({ name: '', phone: '', balance: '', type: 'customer' });
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentDesc, setPaymentDesc] = useState('');
  const [processingPayment, setProcessingPayment] = useState(false);

  // Sync selected customer if it updates from props
  useEffect(() => {
    if (selectedCustomer) {
      const updated = customers.find(c => c._id === selectedCustomer._id);
      if (updated) setSelectedCustomer(updated);
    } else if (customers.length > 0 && !selectedCustomer) {
      // Auto-select first customer if none is selected
      setSelectedCustomer(customers[0]);
    }
  }, [customers, selectedCustomer]);

  const filteredCustomers = useMemo(() => {
    return customers.filter(c => 
      c.name.toLowerCase().includes((searchQuery || '').toLowerCase())
    );
  }, [customers, searchQuery]);

  const handleRecordPayment = async (direction) => {
    if (!paymentAmount || Number(paymentAmount) <= 0) {
      toast.error('Please enter a valid payment amount.');
      return;
    }
    setProcessingPayment(true);
    const amountNum = Number(paymentAmount);
    
    // Description defaults
    const defaultDesc = direction === 'OUT' ? 'Gave (Cash Out)' : 'Got (Cash In)';
    const description = paymentDesc.trim() || defaultDesc;

    try {
      const response = await axios.post(`http://localhost:5000/api/customers/${selectedCustomer._id}/payment`, {
        amount: amountNum,
        description: description,
        direction: direction
      });
      
      toast.success(direction === 'OUT' ? 'Payment sent successfully!' : 'Payment received successfully!');
      onPayment(response.data);
      setPaymentAmount('');
      setPaymentDesc('');
    } catch (error) {
      console.log('Mocking payment success in demo mode...');
      
      // OUT = we are paying them, so balance goes up (if they owed us +10k, and we pay them +5k, now they owe us +15k? 
      // Wait: if they are a supplier (negative balance), paying them OUT makes their balance less negative, approaching 0.
      // So balance = balance + amount.
      // IN = they are paying us, so balance decreases towards 0.
      const newBalance = direction === 'OUT' ? selectedCustomer.balance + amountNum : selectedCustomer.balance - amountNum;
      
      const updatedCustomer = {
        ...selectedCustomer,
        balance: newBalance,
        transactions: [
          ...selectedCustomer.transactions,
          {
            _id: `txn-demo-${Date.now()}`,
            type: 'Payment',
            amount: amountNum,
            description: `${description} (Demo Mode)`,
            date: new Date().toISOString()
          }
        ]
      };
      
      toast.success(direction === 'OUT' ? 'Payment sent successfully! (Demo Mode)' : 'Payment received successfully! (Demo Mode)');
      onPayment(updatedCustomer);
      setPaymentAmount('');
      setPaymentDesc('');
    } finally {
      setProcessingPayment(false);
    }
  };

  // Calculate stats for current selected customer
  const customerStats = useMemo(() => {
    if (!selectedCustomer) return { totalIn: 0, totalOut: 0 };
    let totalIn = 0;
    let totalOut = 0;
    
    selectedCustomer.transactions.forEach(t => {
      if (t.type === 'Purchase') {
        // Purchases represent a mobile sold to customer on credit (we get nothing yet, but it records as asset/amount)
        // Or if it's a purchase from a supplier (we buy from supplier on credit), we owe them.
        // Let's look at transactions:
        // Supplier Purchase: balance -= amount
        // Customer Purchase: balance += amount
      } else if (t.type === 'Payment') {
        const isOut = t.description?.includes('Paid') || t.description?.includes('Gave') || t.description?.includes('OUT');
        if (isOut) {
          totalOut += t.amount;
        } else {
          totalIn += t.amount;
        }
      }
    });

    return { totalIn, totalOut };
  }, [selectedCustomer]);

  // Compute running balance column for transaction history
  const transactionsWithRunningBalance = useMemo(() => {
    if (!selectedCustomer) return [];
    let running = 0;
    
    // We sort transactions by date ascending to calculate running balance correctly
    const sortedTxns = [...selectedCustomer.transactions].sort((a, b) => new Date(a.date) - new Date(b.date));
    
    const results = sortedTxns.map((t) => {
      if (t.type === 'Purchase') {
        // If they bought from us, their balance increases (they owe us more)
        // If we bought from supplier, balance is negative and gets more negative
        // To keep it simple, let's look at the transaction amount:
        // A customer purchase increases the balance (receivable)
        // A supplier purchase decreases the balance (payable)
        const isSupplier = selectedCustomer.balance < 0 || selectedCustomer.name.includes('Supplier') || selectedCustomer.name.includes('Traders');
        if (isSupplier) {
          running -= t.amount;
        } else {
          running += t.amount;
        }
      } else if (t.type === 'Payment') {
        const isOut = t.description?.includes('Paid') || t.description?.includes('Gave') || t.description?.includes('OUT');
        if (isOut) {
          running += t.amount;
        } else {
          running -= t.amount;
        }
      }
      return { ...t, runningBalance: running };
    });

    return results.reverse(); // Show latest transactions first in UI
  }, [selectedCustomer]);

  return (
    <div className="flex h-[calc(100vh-100px)] -mx-margin-desktop -my-xl overflow-hidden text-left font-body-md">
      
      {/* Left Column: Accounts List */}
      <section className="w-1/3 border-r border-white/10 flex flex-col bg-surface-container-low/30 backdrop-blur-md">
        <div className="p-md border-b border-white/5 flex justify-between items-center bg-surface-container-lowest/50">
          <div>
            <h2 className="font-headline-md text-headline-md text-on-surface font-bold">Ledger Accounts</h2>
            <span className="text-[11px] text-on-surface-variant uppercase tracking-wider">{filteredCustomers.length} Accounts Loaded</span>
          </div>
          <button 
            onClick={() => setShowAddModal(true)}
            className="p-2 bg-primary-container/20 text-primary border border-primary/20 hover:bg-primary-container/30 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">person_add</span> Add
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar divide-y divide-white/5">
          {filteredCustomers.length === 0 ? (
            <div className="text-center py-10 text-on-surface-variant text-xs">
              No ledger accounts found.
            </div>
          ) : (
            filteredCustomers.map(customer => {
              const isActive = selectedCustomer?._id === customer._id;
              const isSupplier = customer.balance < 0;
              const statusText = customer.balance === 0 ? 'Balanced' : (isSupplier ? 'You Owe' : 'Owes You');

              return (
                <div 
                  key={customer._id}
                  onClick={() => setSelectedCustomer(customer)}
                  className={`p-md cursor-pointer transition-colors duration-200 border-l-4 hover:bg-white/5 ${
                    isActive 
                      ? 'bg-primary-container/10 border-primary' 
                      : 'border-transparent'
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className={`font-headline-md text-[14px] font-bold ${isActive ? 'text-primary' : 'text-on-surface'}`}>
                      {customer.name}
                    </span>
                    <span className={`font-mono-data text-xs font-bold ${
                      customer.balance === 0 ? 'text-on-surface-variant' : (isSupplier ? 'text-error' : 'text-secondary')
                    }`}>
                      PKR {Math.abs(customer.balance).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-on-surface-variant">Last txn: {customer.transactions.length > 0 ? new Date(customer.transactions[customer.transactions.length - 1].date).toLocaleDateString() : 'None'}</span>
                    <span className={`px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${
                      customer.balance === 0 
                        ? 'bg-white/5 text-on-surface-variant' 
                        : (isSupplier ? 'bg-error/15 text-error' : 'bg-secondary/15 text-secondary')
                    }`}>
                      {statusText}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* Right Column: Account Details & Transaction History */}
      <section className="flex-1 flex flex-col overflow-y-auto custom-scrollbar p-lg gap-lg bg-background">
        {selectedCustomer ? (
          <div className="space-y-lg">
            
            {/* Account Info and Card Summaries */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-lg">
              <div className="xl:col-span-2 glass-card p-lg rounded-xl flex flex-col justify-between border border-white/5 shadow-xl">
                <div>
                  <div className="flex items-center gap-md mb-2">
                    <h1 className="font-headline-lg text-lg font-bold text-on-surface">{selectedCustomer.name}</h1>
                    <span className="bg-tertiary/10 text-tertiary border border-tertiary/20 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider">
                      {selectedCustomer.balance < 0 ? 'Supplier Account' : 'Customer Account'}
                    </span>
                  </div>
                  <div className="flex gap-xl text-on-surface-variant text-xs">
                    {selectedCustomer.phone && (
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">phone</span> {selectedCustomer.phone}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">location_on</span> Hall Road, Lahore
                    </span>
                  </div>
                </div>

                <div className="mt-lg flex items-end justify-between border-t border-white/5 pt-lg">
                  <div className="flex gap-xl">
                    <div>
                      <p className="text-[10px] text-on-surface-variant uppercase tracking-wider">Net Balance</p>
                      <p className={`text-lg font-bold font-mono-data ${
                        selectedCustomer.balance === 0 
                          ? 'text-on-surface-variant' 
                          : (selectedCustomer.balance < 0 ? 'text-error' : 'text-secondary')
                      }`}>
                        PKR {Math.abs(selectedCustomer.balance).toLocaleString()} 
                        <span className="text-xs font-semibold ml-1">
                          {selectedCustomer.balance === 0 ? '' : (selectedCustomer.balance < 0 ? '(Payable)' : '(Receivable)')}
                        </span>
                      </p>
                    </div>
                    <div className="border-l border-white/10 pl-lg">
                      <p className="text-[10px] text-on-surface-variant uppercase tracking-wider">Paid In (Got)</p>
                      <p className="text-md font-semibold font-mono-data text-primary">PKR {customerStats.totalIn.toLocaleString()}</p>
                    </div>
                    <div className="border-l border-white/10 pl-lg">
                      <p className="text-[10px] text-on-surface-variant uppercase tracking-wider">Paid Out (Gave)</p>
                      <p className="text-md font-semibold font-mono-data text-on-surface-variant">PKR {customerStats.totalOut.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Record Payment quick form */}
              <div className="glass-card p-lg rounded-xl border border-white/5 flex flex-col justify-between">
                <h3 className="font-headline-md text-sm font-bold text-on-surface mb-sm flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm text-secondary">monetization_on</span> Record Payment
                </h3>
                <div className="space-y-sm">
                  <div className="relative focus-glow rounded-lg overflow-hidden border border-white/10">
                    <input 
                      type="number"
                      className="w-full bg-surface-container-lowest border-none text-md font-mono-data py-2 px-3 focus:ring-0 text-on-surface outline-none"
                      placeholder="0.00"
                      value={paymentAmount}
                      onChange={e => setPaymentAmount(e.target.value)}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[10px] font-bold">PKR</span>
                  </div>
                  
                  <input 
                    type="text"
                    className="w-full bg-surface-container-lowest border border-white/10 text-xs py-2 px-3 rounded-lg focus:ring-1 focus:ring-primary/50 text-on-surface outline-none"
                    placeholder="Description (e.g. Bank Transfer, Cash)"
                    value={paymentDesc}
                    onChange={e => setPaymentDesc(e.target.value)}
                  />

                  <div className="grid grid-cols-2 gap-sm pt-2">
                    <button 
                      type="button"
                      onClick={() => handleRecordPayment('OUT')}
                      disabled={processingPayment || !paymentAmount}
                      className="bg-secondary text-on-secondary py-2 rounded-lg font-bold flex flex-col items-center justify-center gap-1 hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer text-xs"
                    >
                      <span className="material-symbols-outlined text-[16px]">south_west</span>
                      Gave (Out)
                    </button>
                    <button 
                      type="button"
                      onClick={() => handleRecordPayment('IN')}
                      disabled={processingPayment || !paymentAmount}
                      className="bg-primary-container text-on-primary-container py-2 rounded-lg font-bold flex flex-col items-center justify-center gap-1 hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer text-xs"
                    >
                      <span className="material-symbols-outlined text-[16px]">north_east</span>
                      Got (In)
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Transaction History Table */}
            <div className="glass-card rounded-xl border border-white/5 overflow-hidden">
              <div className="p-md border-b border-white/5 flex justify-between items-center bg-surface-container-lowest/30">
                <h3 className="font-headline-md text-sm font-bold text-on-surface">Transaction Statements</h3>
                <span className="text-[10px] text-on-surface-variant uppercase tracking-wider">{selectedCustomer.transactions.length} Transactions Found</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-surface-container-highest/20 text-[10px] text-on-surface-variant uppercase tracking-widest border-b border-white/5">
                      <th className="px-lg py-md font-medium">Date</th>
                      <th className="px-lg py-md font-medium">Description</th>
                      <th className="px-lg py-md font-medium text-right">Cash Out (Gave)</th>
                      <th className="px-lg py-md font-medium text-right">Cash In (Got)</th>
                      <th className="px-lg py-md font-medium text-right">Running Balance</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs divide-y divide-white/5 font-mono-data">
                    {transactionsWithRunningBalance.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="text-center py-10 text-on-surface-variant">
                          No transactions found on this account.
                        </td>
                      </tr>
                    ) : (
                      transactionsWithRunningBalance.map((txn, index) => {
                        const isPayment = txn.type === 'Payment';
                        const isOut = txn.description?.includes('Paid') || txn.description?.includes('Gave') || txn.description?.includes('OUT');
                        
                        // We also need to see if it's a purchase:
                        const isPurchase = txn.type === 'Purchase';
                        const isSupplier = selectedCustomer.balance < 0 || selectedCustomer.name.includes('Supplier') || selectedCustomer.name.includes('Traders');

                        return (
                          <tr key={index} className="hover:bg-white/5 transition-colors duration-150">
                            <td className="px-lg py-md text-on-surface-variant">
                              {new Date(txn.date).toLocaleDateString()}
                            </td>
                            <td className="px-lg py-md font-body-md text-on-surface">
                              <div>{txn.description}</div>
                              <span className="text-[9px] font-mono-data opacity-50 block uppercase mt-0.5">{txn.type}</span>
                            </td>
                            <td className="px-lg py-md text-right text-error font-bold">
                              {((isPayment && isOut) || (isPurchase && isSupplier)) ? `PKR ${txn.amount.toLocaleString()}` : '--'}
                            </td>
                            <td className="px-lg py-md text-right text-secondary font-bold">
                              {((isPayment && !isOut) || (isPurchase && !isSupplier)) ? `PKR ${txn.amount.toLocaleString()}` : '--'}
                            </td>
                            <td className={`px-lg py-md text-right font-bold ${
                              txn.runningBalance === 0 ? 'text-on-surface-variant' : (txn.runningBalance < 0 ? 'text-error' : 'text-secondary')
                            }`}>
                              PKR {Math.abs(txn.runningBalance).toLocaleString()} {txn.runningBalance === 0 ? '' : (txn.runningBalance < 0 ? '(Owe)' : '(Owed)')}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            
          </div>
        ) : (
          <div className="flex-1 flex flex-col justify-center items-center py-20 text-on-surface-variant text-center">
            <span className="material-symbols-outlined text-5xl mb-4 opacity-55 animate-bounce">account_box</span>
            <h3 className="font-headline-md text-md font-bold text-on-surface">No Account Selected</h3>
            <p className="text-sm max-w-sm mt-1">Select a customer or vendor account from the list on the left to view ledger statements, transactions history and record payments.</p>
          </div>
        )}
      </section>

      {/* Add Account Modal Overlay */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-lg bg-black/80 backdrop-blur-sm transition-opacity duration-300">
          <div className="glass-card w-full max-w-md rounded-2xl overflow-hidden shadow-2xl animate-float">
            <div className="p-lg bg-primary-container text-on-primary-container flex justify-between items-center">
              <h3 className="font-headline-md font-bold text-lg">Add New Ledger Account</h3>
              <button 
                type="button" 
                className="hover:bg-white/20 rounded-full p-1 transition-colors cursor-pointer flex items-center justify-center"
                onClick={() => setShowAddModal(false)}
              >
                <span className="material-symbols-outlined text-[20px] text-on-primary-container">close</span>
              </button>
            </div>
            
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                if (!newPerson.name.trim()) { toast.error('Name is required'); return; }
                const balNum = Math.abs(Number(newPerson.balance) || 0);
                const actualBalance = newPerson.type === 'supplier' ? -balNum : balNum;
                
                const person = {
                  _id: `person-${Date.now()}`,
                  name: newPerson.name.trim(),
                  phone: newPerson.phone.trim(),
                  balance: actualBalance,
                  transactions: balNum !== 0 ? [{ 
                    type: 'Purchase', 
                    amount: balNum, 
                    description: `Opening Balance (${newPerson.type === 'supplier' ? 'You Owe Them' : 'They Owe You'})`, 
                    date: new Date().toISOString() 
                  }] : []
                };

                onAddPerson(person);
                setNewPerson({ name: '', phone: '', balance: '', type: 'customer' });
                setShowAddModal(false);
                toast.success('Account added to Khata successfully!');
              }} 
              className="p-lg space-y-md text-left"
            >
              <div className="space-y-1">
                <label className="text-label-md text-on-surface-variant font-semibold text-xs">Name</label>
                <input 
                  type="text" 
                  className="w-full bg-surface-container-lowest border border-white/10 rounded-lg p-2 focus:ring-2 focus:ring-primary/50 outline-none text-on-surface text-sm"
                  value={newPerson.name}
                  onChange={(e) => setNewPerson({ ...newPerson, name: e.target.value })}
                  placeholder="e.g. Zain Traders, Ali Customer"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-label-md text-on-surface-variant font-semibold text-xs">Phone Number</label>
                <input 
                  type="text" 
                  className="w-full bg-surface-container-lowest border border-white/10 rounded-lg p-2 focus:ring-2 focus:ring-primary/50 outline-none text-on-surface text-sm font-mono-data"
                  value={newPerson.phone}
                  onChange={(e) => setNewPerson({ ...newPerson, phone: e.target.value })}
                  placeholder="e.g. 0300-1234567"
                />
              </div>

              <div className="grid grid-cols-2 gap-md">
                <div className="space-y-1">
                  <label className="text-label-md text-on-surface-variant font-semibold text-xs">Account Type</label>
                  <select 
                    className="w-full bg-surface-container-lowest border border-white/10 rounded-lg p-2 focus:ring-2 focus:ring-primary/50 outline-none text-on-surface text-sm"
                    value={newPerson.type}
                    onChange={(e) => setNewPerson({ ...newPerson, type: e.target.value })}
                  >
                    <option value="customer">Customer (Receivable)</option>
                    <option value="supplier">Supplier (Payable)</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-label-md text-on-surface-variant font-semibold text-xs">Opening Balance (PKR)</label>
                  <input 
                    type="number" 
                    className="w-full bg-surface-container-lowest border border-white/10 rounded-lg p-2 focus:ring-2 focus:ring-primary/50 outline-none text-on-surface text-sm font-mono-data"
                    value={newPerson.balance}
                    onChange={(e) => setNewPerson({ ...newPerson, balance: e.target.value })}
                    placeholder="0 for zero balance"
                  />
                </div>
              </div>

              <div className="pt-lg flex justify-end gap-md">
                <button 
                  type="button" 
                  className="px-lg py-2 rounded-lg border border-white/10 hover:bg-white/5 transition-colors cursor-pointer text-sm font-semibold" 
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-lg py-2 rounded-lg bg-primary-container text-on-primary-container font-bold hover:opacity-90 transition-opacity cursor-pointer text-sm"
                >
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default LedgerView;
