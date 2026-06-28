import { useState } from 'react';

const getMobileImage = (modelName) => {
  const model = (modelName || '').toLowerCase();
  if (model.includes('iphone') || model.includes('apple'))
    return 'https://lh3.googleusercontent.com/aida-public/AB6AXuAOK9h2HYwh5XAaVsfeOhzDIRtOVp340hZj6aYUdb3H--aZh3Bby4RaWmlQRp3RJO0R_PxLbf4IYf3KjGoVWuaSi7spO-7hOoIBwiiXDizK8eOvF1bmf82li-kYZK4HKOmugw2dYdPreryneE5b0kT4_Ou-PyUEF8CJ3Vapsk7ClKAxq0ZCl9pT-e2IZwfqSP_boHy7rcTrksaRd1RiiBDSt9wPC1SaiX2rnKG4pOGi68UTeG1gcw5kpWZLIIKc1UUUi7US6moeLIE';
  if (model.includes('galaxy') || model.includes('samsung') || model.includes('fold'))
    return 'https://lh3.googleusercontent.com/aida-public/AB6AXuAD6A1BcP3Xx938TBOTmlSEcDEpSK-pqITn_OCFn3FRCaaO8lEzjQXH4j6m9JbNpMvVxWAvsge4HJZjGz7v0s08j8Lcjbjma2d91HiQleg0-Ke08qqO9wbklnnr8BL1qIKadnweAF4jBD0xNrV62lpHZobjOasanblia9N0dPItL7k_AHoEzWLXbOF1Uu35au7mY-4rQSnMt-IUG90L28bxImuMd1hGhMru3NVX99LGKWxpvHMwzthXFn3aso6fcmiJcoV4x6_pBk4';
  return 'https://lh3.googleusercontent.com/aida-public/AB6AXuAxwalBlCSAJGREppd2mo4ehjdk-2MYf7E5nEyknJkpII1ir3paSi5jtpPC7agjZ0KgQKarwjKixk22pBbllAnUn_ZKo8KRyNyt2wiQcn86qBhy3mZbdFPf9YyJY045rNbFCdql-A5kHUse7x_SZ1IJWUCtxlpVFHhoaB-hm5n4en1sXDMWq0IPNepTYirvV5nLkQJQCsMT3UrgQzFFlvMjcUj7Oweka0i0jzq2B8OmQr-P-CnayWK18w6Jbm81m4n-3o8VmHXafnY';
};

const InfoRow = ({ icon, label, value, highlight }) => (
  <div className="flex items-start gap-3 py-2 border-b border-white/5 last:border-0">
    <span className={`material-symbols-outlined text-[18px] mt-0.5 ${highlight ? 'text-primary' : 'text-on-surface-variant'}`}>
      {icon}
    </span>
    <div className="flex-1 min-w-0">
      <p className="text-[10px] uppercase tracking-wider text-on-surface-variant">{label}</p>
      <p className={`text-sm font-semibold break-all ${highlight ? 'text-primary' : 'text-on-surface'}`}>
        {value || <span className="text-on-surface-variant/50 italic font-normal">Not provided</span>}
      </p>
    </div>
  </div>
);

const MobileDetailModal = ({ mobile, onClose, onReturn, onSellClick }) => {
  const [showReturnForm, setShowReturnForm] = useState(false);
  const [returnData, setReturnData] = useState({ name: '', phone: '', cnic: '' });
  const [returnErrors, setReturnErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [activeImgIdx, setActiveImgIdx] = useState(0);

  const isSold = mobile.status === 'Sold';

  const validateReturn = () => {
    const errs = {};
    if (!returnData.name.trim()) errs.name = 'Naam zaruri hai';
    if (!returnData.phone.trim()) errs.phone = 'Phone number zaruri hai';
    if (!returnData.cnic.trim()) errs.cnic = 'CNIC zaruri hai';
    return errs;
  };

  const handleConfirmReturn = () => {
    const errs = validateReturn();
    if (Object.keys(errs).length > 0) { setReturnErrors(errs); return; }
    setSubmitting(true);
    // Build updated mobile object: reset to Available, update seller info
    const returned = {
      ...mobile,
      status: 'Available',
      sellerName: returnData.name.trim(),
      sellerPhone: returnData.phone.trim(),
      sellerCnic: returnData.cnic.trim(),
      // Clear sold fields
      soldTo: '',
      buyerCnic: '',
      paymentType: '',
      sellingPrice: undefined,
      soldAt: null,
      returnedFrom: mobile.soldTo,      // keep history
      returnedAt: new Date().toISOString(),
    };
    onReturn(returned);
    setSubmitting(false);
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end md:items-center justify-center md:p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-surface-container w-full md:max-w-2xl md:rounded-2xl rounded-t-2xl border border-white/10 shadow-2xl shadow-black/60 overflow-hidden flex flex-col max-h-[95dvh] md:max-h-[90vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-primary">smartphone</span>
            <div>
              <h2 className="font-bold text-on-surface text-base leading-tight">{mobile.model}</h2>
              <p className="text-[11px] text-on-surface-variant font-mono-data">IMEI: {mobile.imei}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
              isSold ? 'bg-white/10 text-on-surface-variant' : 'bg-secondary/20 text-secondary'
            }`}>
              {mobile.status}
            </span>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto custom-scrollbar flex-1">
          <div className="flex flex-col md:flex-row gap-0">

            {/* Left: Image + basic info */}
            <div className="md:w-56 shrink-0 bg-surface-container-lowest flex flex-col">
              <div className="relative w-full h-52 bg-black/20 shrink-0">
                <img
                  src={mobile.images && mobile.images.length > 0 ? mobile.images[activeImgIdx] : getMobileImage(mobile.model)}
                  alt={mobile.model}
                  className="w-full h-full object-cover"
                />
                {mobile.images && mobile.images.length > 1 && (
                  <div className="absolute inset-x-0 bottom-2 flex justify-center gap-1.5 z-10">
                    {mobile.images.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveImgIdx(idx)}
                        className={`w-2 h-2 rounded-full transition-all cursor-pointer ${
                          idx === activeImgIdx ? 'bg-primary w-4' : 'bg-white/40 hover:bg-white/70'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Thumbnails row */}
              {mobile.images && mobile.images.length > 1 && (
                <div className="flex gap-1.5 p-2 bg-surface-container-low/40 overflow-x-auto justify-center shrink-0 border-b border-white/5 custom-scrollbar">
                  {mobile.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImgIdx(idx)}
                      className={`w-8 h-8 rounded-lg overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${
                        idx === activeImgIdx ? 'border-primary scale-[1.05]' : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={img} className="w-full h-full object-cover" alt="" />
                    </button>
                  ))}
                </div>
              )}

              <div className="p-4 space-y-2 flex-1">
                <div className="flex justify-between text-xs">
                  <span className="text-on-surface-variant">Condition</span>
                  <span className="text-on-surface font-semibold">{mobile.condition || 'N/A'}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-on-surface-variant">Purchase Price</span>
                  <span className="text-primary font-bold font-mono-data">
                    PKR {Number(mobile.purchasingPrice || 0).toLocaleString()}
                  </span>
                </div>
                {isSold && mobile.sellingPrice && (
                  <div className="flex justify-between text-xs">
                    <span className="text-on-surface-variant">Selling Price</span>
                    <span className="text-secondary font-bold font-mono-data">
                      PKR {Number(mobile.sellingPrice).toLocaleString()}
                    </span>
                  </div>
                )}
                {isSold && mobile.sellingPrice && mobile.purchasingPrice && (
                  <div className="flex justify-between text-xs pt-1 border-t border-white/10">
                    <span className="text-on-surface-variant">Profit</span>
                    <span className={`font-bold font-mono-data ${
                      mobile.sellingPrice - mobile.purchasingPrice >= 0 ? 'text-secondary' : 'text-error'
                    }`}>
                      PKR {(Number(mobile.sellingPrice) - Number(mobile.purchasingPrice)).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Details */}
            <div className="flex-1 p-5 space-y-5">

              {/* Seller Details */}
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-primary mb-2 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">sell</span>
                  Seller / Purchase Details
                </p>
                <div className="bg-surface-container-low rounded-xl px-4 py-1">
                  <InfoRow icon="person" label="Seller Name" value={mobile.sellerName} />
                  <InfoRow icon="badge" label="Seller CNIC" value={mobile.sellerCnic} />
                  <InfoRow icon="call" label="Seller Phone" value={mobile.sellerPhone} />
                </div>
              </div>

              {/* Buyer Details (if sold) */}
              {isSold && (
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-widest text-tertiary mb-2 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">shopping_bag</span>
                    Buyer / Sale Details
                  </p>
                  <div className="bg-surface-container-low rounded-xl px-4 py-1">
                    <InfoRow icon="person_outline" label="Sold To" value={mobile.soldTo} />
                    <InfoRow icon="call" label="Buyer Phone" value={mobile.buyerPhone} />
                    <InfoRow icon="badge" label="Buyer CNIC" value={mobile.buyerCnic} />
                    <InfoRow icon="payment" label="Payment Type" value={mobile.paymentType} highlight />
                    <InfoRow
                      icon="calendar_today"
                      label="Sold Date"
                      value={mobile.soldAt ? new Date(mobile.soldAt).toLocaleDateString('en-PK', { day: '2-digit', month: 'short', year: 'numeric' }) : null}
                    />
                  </div>
                </div>
              )}

              {/* Return history */}
              {mobile.returnedFrom && (
                <div className="bg-tertiary/10 border border-tertiary/20 rounded-xl px-4 py-3 text-xs text-tertiary">
                  <span className="material-symbols-outlined text-[14px] mr-1 align-middle">history</span>
                  Previously sold to <strong>{mobile.returnedFrom}</strong>
                  {mobile.returnedAt && ` · Returned on ${new Date(mobile.returnedAt).toLocaleDateString()}`}
                </div>
              )}

              {/* Additional details */}
              {mobile.details && (
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-on-surface-variant mb-1">Additional Details</p>
                  <p className="text-xs text-on-surface bg-surface-container-low rounded-lg px-3 py-2">{mobile.details}</p>
                </div>
              )}
            </div>
          </div>

          {/* ===== Return Form ===== */}
          {showReturnForm && (
            <div className="border-t border-white/10 px-5 py-4 bg-surface-container-lowest">
              <p className="text-sm font-bold text-tertiary mb-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">assignment_return</span>
                Return Details — Seller Information
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-on-surface-variant block mb-1">Naam *</label>
                  <input
                    type="text"
                    placeholder="Seller ka naam"
                    value={returnData.name}
                    onChange={(e) => { setReturnData(p => ({ ...p, name: e.target.value })); setReturnErrors(p => ({ ...p, name: '' })); }}
                    className={`w-full bg-surface-container rounded-lg px-3 py-2 text-sm text-on-surface border outline-none ${returnErrors.name ? 'border-error/60' : 'border-white/10'}`}
                  />
                  {returnErrors.name && <p className="text-[10px] text-error mt-0.5">{returnErrors.name}</p>}
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-on-surface-variant block mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    placeholder="03xx-xxxxxxx"
                    value={returnData.phone}
                    onChange={(e) => { setReturnData(p => ({ ...p, phone: e.target.value })); setReturnErrors(p => ({ ...p, phone: '' })); }}
                    className={`w-full bg-surface-container rounded-lg px-3 py-2 text-sm text-on-surface border outline-none ${returnErrors.phone ? 'border-error/60' : 'border-white/10'}`}
                  />
                  {returnErrors.phone && <p className="text-[10px] text-error mt-0.5">{returnErrors.phone}</p>}
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-on-surface-variant block mb-1">CNIC Number *</label>
                  <input
                    type="text"
                    placeholder="xxxxx-xxxxxxx-x"
                    value={returnData.cnic}
                    onChange={(e) => { setReturnData(p => ({ ...p, cnic: e.target.value })); setReturnErrors(p => ({ ...p, cnic: '' })); }}
                    className={`w-full bg-surface-container rounded-lg px-3 py-2 text-sm text-on-surface border outline-none ${returnErrors.cnic ? 'border-error/60' : 'border-white/10'}`}
                  />
                  {returnErrors.cnic && <p className="text-[10px] text-error mt-0.5">{returnErrors.cnic}</p>}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowReturnForm(false)}
                  className="flex-1 py-2 rounded-xl text-xs font-semibold bg-surface-container text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer border border-white/10"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmReturn}
                  disabled={submitting}
                  className="flex-1 py-2 rounded-xl text-xs font-bold bg-tertiary text-on-tertiary hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50"
                >
                  {submitting ? 'Processing...' : '✓ Confirm Return & Make Available'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {!showReturnForm && (
          <div className="flex gap-2 px-6 py-4 border-t border-white/10 shrink-0">
            {isSold && (
              <button
                onClick={() => setShowReturnForm(true)}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-tertiary/15 border border-tertiary/30 text-tertiary hover:bg-tertiary/25 transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">assignment_return</span>
                Mark as Returned
              </button>
            )}
            {!isSold && (
              <button
                onClick={() => { onClose(); onSellClick(mobile); }}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-primary-container text-on-primary-container hover:opacity-90 transition-opacity cursor-pointer flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">shopping_cart</span>
                Sell Now
              </button>
            )}
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-surface-container-high text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MobileDetailModal;
