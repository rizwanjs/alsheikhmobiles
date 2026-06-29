import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { API_URL } from '../config';

export default function SellersManager({ user }) {
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Add Seller Form State
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [creating, setCreating] = useState(false);

  // Change Password Modal State
  const [selectedUser, setSelectedUser] = useState(null);
  const [changePasswordVal, setChangePasswordVal] = useState('');
  const [updatingPassword, setUpdatingPassword] = useState(false);

  // Load Sellers
  const fetchSellers = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/users/sellers`);
      setSellers(res.data);
    } catch (err) {
      const isNetworkError = !err.response || err.code === 'ERR_NETWORK' || err.message === 'Network Error';
      if (isNetworkError) {
        // Fallback: load mock sellers from localStorage for Vercel / Offline demo
        const stored = localStorage.getItem('als_mock_sellers');
        if (stored) {
          setSellers(JSON.parse(stored));
        } else {
          const defaultMockSellers = [
            { _id: 'mock-sell-1', username: 'kashif_seller', createdAt: new Date(Date.now() - 86400000 * 5).toISOString() },
            { _id: 'mock-sell-2', username: 'bilal_sales', createdAt: new Date().toISOString() }
          ];
          localStorage.setItem('als_mock_sellers', JSON.stringify(defaultMockSellers));
          setSellers(defaultMockSellers);
        }
      } else {
        toast.error(err.response?.data?.message || 'Failed to fetch sellers');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSellers();
  }, []);

  // Handle Add Seller
  const handleAddSeller = async (e) => {
    e.preventDefault();
    if (!newUsername.trim() || !newPassword.trim()) {
      toast.warning('Please enter both username and password');
      return;
    }

    setCreating(true);
    try {
      const res = await axios.post(`${API_URL}/api/users/sellers`, {
        username: newUsername.trim(),
        password: newPassword.trim()
      });
      setSellers([res.data, ...sellers]);
      setNewUsername('');
      setNewPassword('');
      toast.success(`Seller "${res.data.username}" created successfully!`);
    } catch (err) {
      const isNetworkError = !err.response || err.code === 'ERR_NETWORK' || err.message === 'Network Error';
      if (isNetworkError) {
        // Fallback: Add mock seller locally
        const newMockSeller = {
          _id: 'mock-sell-' + Math.random().toString(36).substr(2, 9),
          username: newUsername.trim(),
          password: newPassword.trim(), // In demo we save password mock-wise
          createdAt: new Date().toISOString()
        };
        const updated = [newMockSeller, ...sellers];
        setSellers(updated);
        localStorage.setItem('als_mock_sellers', JSON.stringify(updated));
        
        // Also update local mock logins in db if needed, or simply let localStorage login handle it
        const mockLogins = JSON.parse(localStorage.getItem('als_mock_logins') || '{}');
        mockLogins[newUsername.trim().toLowerCase()] = newPassword.trim();
        localStorage.setItem('als_mock_logins', JSON.stringify(mockLogins));

        setNewUsername('');
        setNewPassword('');
        toast.success(`Seller "${newMockSeller.username}" created locally (Demo Mode)!`);
      } else {
        toast.error(err.response?.data?.message || 'Failed to create seller');
      }
    } finally {
      setCreating(false);
    }
  };

  // Handle Delete Seller
  const handleDeleteSeller = async (id, username) => {
    if (!confirm(`Are you sure you want to delete seller "${username}"?`)) return;

    try {
      await axios.delete(`${API_URL}/api/users/sellers/${id}`);
      setSellers(sellers.filter(s => s._id !== id));
      toast.success(`Seller "${username}" deleted.`);
    } catch (err) {
      const isNetworkError = !err.response || err.code === 'ERR_NETWORK' || err.message === 'Network Error';
      if (isNetworkError) {
        const updated = sellers.filter(s => s._id !== id);
        setSellers(updated);
        localStorage.setItem('als_mock_sellers', JSON.stringify(updated));
        
        // Clean up from mock logins
        const mockLogins = JSON.parse(localStorage.getItem('als_mock_logins') || '{}');
        delete mockLogins[username.toLowerCase()];
        localStorage.setItem('als_mock_logins', JSON.stringify(mockLogins));

        toast.success(`Seller "${username}" deleted locally (Demo Mode).`);
      } else {
        toast.error(err.response?.data?.message || 'Failed to delete seller');
      }
    }
  };

  // Handle Change Password
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!changePasswordVal.trim()) {
      toast.warning('Please enter a new password');
      return;
    }

    setUpdatingPassword(true);
    try {
      await axios.post(`${API_URL}/api/users/change-password`, {
        userId: selectedUser._id,
        newPassword: changePasswordVal.trim()
      });
      toast.success(`Password updated for "${selectedUser.username}"`);
      setSelectedUser(null);
      setChangePasswordVal('');
    } catch (err) {
      const isNetworkError = !err.response || err.code === 'ERR_NETWORK' || err.message === 'Network Error';
      if (isNetworkError) {
        // Fallback: Update local mock login password
        const mockLogins = JSON.parse(localStorage.getItem('als_mock_logins') || '{}');
        mockLogins[selectedUser.username.toLowerCase()] = changePasswordVal.trim();
        localStorage.setItem('als_mock_logins', JSON.stringify(mockLogins));

        toast.success(`Password updated for "${selectedUser.username}" locally (Demo Mode)`);
        setSelectedUser(null);
        setChangePasswordVal('');
      } else {
        toast.error(err.response?.data?.message || 'Failed to update password');
      }
    } finally {
      setUpdatingPassword(false);
    }
  };

  return (
    <div className="px-4 md:px-margin-desktop py-4 md:py-xl overflow-y-auto h-full custom-scrollbar">
      {/* Header */}
      <div className="mb-6 md:mb-lg">
        <h2 className="text-xl md:font-headline-lg md:text-headline-lg text-on-surface font-semibold">Sellers Management</h2>
        <p className="font-body-md text-on-surface-variant text-xs md:text-sm">Create, manage, and configure passwords for your sales team.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
        {/* Create Seller Form Card */}
        <div className="lg:col-span-1">
          <div className="frosted-metal p-6 rounded-xl border border-white/5 shadow-xl relative overflow-hidden">
            <h3 className="text-md font-bold text-primary mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined">person_add</span>
              Add New Seller
            </h3>
            
            <form onSubmit={handleAddSeller} className="space-y-4">
              <div>
                <label className="block text-on-surface-variant text-[11px] uppercase tracking-wider font-semibold mb-2">
                  Username
                </label>
                <input
                  type="text"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="w-full bg-surface-container-lowest border border-white/10 rounded-xl py-2 px-3 text-on-surface placeholder:text-on-surface-variant/40 focus:ring-2 focus:ring-primary/40 outline-none text-sm"
                  placeholder="e.g. kashif_sales"
                  required
                />
              </div>

              <div>
                <label className="block text-on-surface-variant text-[11px] uppercase tracking-wider font-semibold mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-surface-container-lowest border border-white/10 rounded-xl py-2 px-3 text-on-surface placeholder:text-on-surface-variant/40 focus:ring-2 focus:ring-primary/40 outline-none text-sm"
                  placeholder="Enter login password"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={creating}
                className="w-full bg-primary text-on-primary font-bold py-3 rounded-xl hover:bg-primary-container active:scale-[0.98] transition-transform text-xs cursor-pointer flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
                {creating ? 'Creating...' : 'Create Seller Account'}
              </button>
            </form>
          </div>
        </div>

        {/* Sellers List Table */}
        <div className="lg:col-span-2">
          <div className="frosted-metal rounded-xl border border-white/5 shadow-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-white/5 flex justify-between items-center">
              <h3 className="text-md font-bold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined">group</span>
                Active Sellers
              </h3>
              <span className="bg-secondary/15 text-secondary text-[11px] px-2.5 py-1 rounded-full font-bold">
                {sellers.length} Accounts
              </span>
            </div>

            {loading ? (
              <div className="text-center py-12 text-on-surface-variant">
                <span className="material-symbols-outlined animate-spin text-2xl text-primary mb-2">sync</span>
                <p className="text-xs">Loading sales team...</p>
              </div>
            ) : sellers.length === 0 ? (
              <div className="text-center py-12 text-on-surface-variant">
                <span className="material-symbols-outlined text-4xl mb-2 opacity-35">group_off</span>
                <p className="text-sm font-semibold">No sellers registered yet</p>
                <p className="text-xs mt-1">Create one using the form on the left.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-white/5 text-[11px] uppercase tracking-wider text-on-surface-variant font-bold">
                      <th className="px-6 py-3">Username</th>
                      <th className="px-6 py-3">Role</th>
                      <th className="px-6 py-3">Created Date</th>
                      <th className="px-6 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-sm">
                    {sellers.map((seller) => (
                      <tr key={seller._id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-6 py-4 font-semibold text-on-surface">{seller.username}</td>
                        <td className="px-6 py-4">
                          <span className="bg-primary/10 text-primary text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border border-primary/20">
                            Seller
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs text-on-surface-variant">
                          {new Date(seller.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-right space-x-2">
                          <button
                            onClick={() => setSelectedUser(seller)}
                            className="bg-white/5 hover:bg-white/10 text-on-surface border border-white/10 px-3 py-1.5 rounded-lg text-xs transition-colors cursor-pointer"
                          >
                            Change Password
                          </button>
                          <button
                            onClick={() => handleDeleteSeller(seller._id, seller.username)}
                            className="bg-error/10 hover:bg-error/20 text-error border border-error/20 px-3 py-1.5 rounded-lg text-xs transition-colors cursor-pointer"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-[400px] frosted-metal rounded-2xl border border-white/10 shadow-2xl relative">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-md font-bold text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">key</span>
                  Update Password
                </h4>
                <button
                  onClick={() => { setSelectedUser(null); setChangePasswordVal(''); }}
                  className="text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <p className="text-xs text-on-surface-variant mb-4">
                Set a new password for seller <strong className="text-on-surface">"{selectedUser.username}"</strong>.
              </p>

              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="block text-on-surface-variant text-[10px] uppercase tracking-wider font-semibold mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={changePasswordVal}
                    onChange={(e) => setChangePasswordVal(e.target.value)}
                    className="w-full bg-surface-container-lowest border border-white/10 rounded-xl py-2 px-3 text-on-surface placeholder:text-on-surface-variant/40 focus:ring-2 focus:ring-primary/40 outline-none text-sm"
                    placeholder="Enter new password"
                    required
                    autoFocus
                  />
                </div>

                <div className="flex gap-2 justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => { setSelectedUser(null); setChangePasswordVal(''); }}
                    className="bg-white/5 hover:bg-white/10 text-on-surface border border-white/10 px-4 py-2 rounded-xl text-xs transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updatingPassword}
                    className="bg-primary text-on-primary font-bold px-4 py-2 rounded-xl hover:bg-primary-container active:scale-[0.98] transition-transform text-xs cursor-pointer"
                  >
                    {updatingPassword ? 'Saving...' : 'Update Password'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
