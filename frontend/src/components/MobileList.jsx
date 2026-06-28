import { useState } from 'react';

const getMobileImage = (modelName) => {
  const model = (modelName || '').toLowerCase();
  if (model.includes('iphone') || model.includes('apple')) {
    return 'https://lh3.googleusercontent.com/aida-public/AB6AXuAOK9h2HYwh5XAaVsfeOhzDIRtOVp340hZj6aYUdb3H--aZh3Bby4RaWmlQRp3RJO0R_PxLbf4IYf3KjGoVWuaSi7spO-7hOoIBwiiXDizK8eOvF1bmf82li-kYZK4HKOmugw2dYdPreryneE5b0kT4_Ou-PyUEF8CJ3Vapsk7ClKAxq0ZCl9pT-e2IZwfqSP_boHy7rcTrksaRd1RiiBDSt9wPC1SaiX2rnKG4pOGi68UTeG1gcw5kpWZLIIKc1UUUi7US6moeLIE';
  }
  if (model.includes('galaxy') || model.includes('samsung') || model.includes('fold')) {
    return 'https://lh3.googleusercontent.com/aida-public/AB6AXuAD6A1BcP3Xx938TBOTmlSEcDEpSK-pqITn_OCFn3FRCaaO8lEzjQXH4j6m9JbNpMvVxWAvsge4HJZjGz7v0s08j8Lcjbjma2d91HiQleg0-Ke08qqO9wbklnnr8BL1qIKadnweAF4jBD0xNrV62lpHZobjOasanblia9N0dPItL7k_AHoEzWLXbOF1Uu35au7mY-4rQSnMt-IUG90L28bxImuMd1hGhMru3NVX99LGKWxpvHMwzthXFn3aso6fcmiJcoV4x6_pBk4';
  }
  if (model.includes('pixel')) {
    return 'https://lh3.googleusercontent.com/aida-public/AB6AXuBPb98Vxn6SNIvHkqWl6l_tCs6mPmcTeAtTLvWDXqG9Y9w03jtAnImMbAv4aJehIC9-HDo1G9tdDVZ5A8Z0Di0ZlfWxV1659W4q9QCJMDJMKS0Ekowugsw6VTbzxZIVVxwCm_qC-t-_H7wWwhoKNtk6OAUNkR7nNJL_hJmviTavwhusxvvOSMJVJOgsZvKIdH3Peex6DJtPVIp80x02qyBV7v5oSJBeM6CUHR1bCdFP4ePM7ZzprOo9IGgPh8VCiWK8GKGbP-AZO2o';
  }
  // Default to OnePlus/Generic
  return 'https://lh3.googleusercontent.com/aida-public/AB6AXuAxwalBlCSAJGREppd2mo4ehjdk-2MYf7E5nEyknJkpII1ir3paSi5jtpPC7agjZ0KgQKarwjKixk22pBbllAnUn_ZKo8KRyNyt2wiQcn86qBhy3mZbdFPf9YyJY045rNbFCdql-A5kHUse7x_SZ1IJWUCtxlpVFHhoaB-hm5n4en1sXDMWq0IPNepTYirvV5nLkQJQCsMT3UrgQzFFlvMjcUj7Oweka0i0jzq2B8OmQr-P-CnayWK18w6Jbm81m4n-3o8VmHXafnY';
};

const MobileList = ({ mobiles, onSellClick, onDetailClick }) => {
  const [statusFilter, setStatusFilter] = useState('All'); // 'All' | 'Available' | 'Sold'

  const filteredMobiles = mobiles.filter(mobile => {
    if (statusFilter === 'All') return true;
    return mobile.status === statusFilter;
  });

  if (mobiles.length === 0) {
    return (
      <div className="frosted-metal p-lg rounded-2xl text-center py-20 text-on-surface-variant text-sm">
        <span className="material-symbols-outlined text-4xl mb-2 opacity-55">devices_off</span>
        <p>No devices matching search criteria found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-md text-left">
      {/* Category filter pills */}
      <div className="flex justify-between items-center gap-4 mb-md max-w-md">
        <button 
          onClick={() => setStatusFilter('All')}
          className={`flex-1 py-1.5 rounded-lg text-xs font-semibold cursor-pointer text-center transition-all whitespace-nowrap ${
            statusFilter === 'All' ? 'bg-primary-container text-on-primary-container' : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          All Stock
        </button>
        <button 
          onClick={() => setStatusFilter('Available')}
          className={`flex-1 py-1.5 rounded-lg text-xs font-semibold cursor-pointer text-center transition-all whitespace-nowrap ${
            statusFilter === 'Available' ? 'bg-primary-container text-on-primary-container' : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          Available ({mobiles.filter(m => m.status === 'Available').length})
        </button>
        <button 
          onClick={() => setStatusFilter('Sold')}
          className={`flex-1 py-1.5 rounded-lg text-xs font-semibold cursor-pointer text-center transition-all whitespace-nowrap ${
            statusFilter === 'Sold' ? 'bg-primary-container text-on-primary-container' : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          Sold ({mobiles.filter(m => m.status === 'Sold').length})
        </button>
      </div>

      {filteredMobiles.length === 0 ? (
        <div className="frosted-metal p-lg rounded-2xl text-center py-20 text-on-surface-variant text-sm">
          <span className="material-symbols-outlined text-4xl mb-2 opacity-55">filter_list_off</span>
          <p>No devices matching the selected state filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-gutter">
          {filteredMobiles.map((mobile) => {
            const isSold = mobile.status === 'Sold';
            const isUdhaar = isSold && mobile.paymentType === 'Udhaar';

            return (
              <div 
                key={mobile._id} 
                onClick={() => onDetailClick && onDetailClick(mobile)}
                className={`frosted-metal rounded-xl overflow-hidden group hover:scale-[1.02] transition-all duration-300 relative flex flex-col justify-between cursor-pointer ${
                  isUdhaar ? 'border-tertiary/30 neon-glow' : 'border-white/5 hover:border-primary/50'
                }`}
              >
                {/* Udhaar Ribbon Banner */}
                {isUdhaar && (
                  <div className="absolute top-0 right-0 w-24 h-24 overflow-hidden z-10 pointer-events-none">
                    <div className="udhaar-ribbon absolute top-0 right-0 w-full h-full bg-tertiary shadow-lg flex items-center justify-center translate-x-[35%] -translate-y-[35%] rotate-45">
                      <span className="text-[9px] font-black text-on-tertiary uppercase tracking-tighter mb-1 mr-1">Udhaar</span>
                    </div>
                  </div>
                )}

                {/* Card Image */}
                <div className="relative h-48 bg-surface-container-lowest overflow-hidden">
                  <img 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                    alt={mobile.model} 
                    src={getMobileImage(mobile.model)}
                  />
                  
                  {/* Status Badge overlays */}
                  <div className="absolute top-3 left-3 bg-black/50 backdrop-blur-md border border-white/10 px-3 py-1 rounded-full flex items-center gap-1">
                    <span className={`w-2 h-2 rounded-full ${isSold ? 'bg-on-surface-variant' : 'bg-secondary'}`}></span>
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${isSold ? 'text-on-surface' : 'text-secondary'}`}>
                      {mobile.status}
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-lg flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-headline-md text-on-surface group-hover:text-primary transition-colors text-[16px] font-semibold tracking-tight">
                        {mobile.model}
                      </h4>
                      <span className="bg-surface-container-highest text-on-surface-variant text-[10px] px-2 py-0.5 rounded font-medium">
                        {mobile.condition ? mobile.condition.replace(/ \(.*\)/, '') : 'Mint'}
                      </span>
                    </div>

                    <div className="space-y-1 mb-4">
                      <div className="flex items-center gap-2 text-on-surface-variant text-[12px]">
                        <span className="material-symbols-outlined text-sm">fingerprint</span>
                        <span className="font-mono-data uppercase">IMEI: {mobile.imei.slice(0, 5)}...{mobile.imei.slice(-3)}</span>
                      </div>
                      
                      {!isSold && (
                        <div className="flex items-center gap-2 text-on-surface-variant text-[12px]">
                          <span className="material-symbols-outlined text-sm">person</span>
                          <span>Seller: {mobile.sellerName || 'Walk-in'}</span>
                        </div>
                      )}

                      {isSold && (
                        <div className="space-y-1 mt-2 pt-2 border-t border-white/5">
                          <div className="flex items-center gap-2 text-on-surface-variant text-[12px]">
                            <span className="material-symbols-outlined text-sm">person_outline</span>
                            <span>Buyer: {mobile.soldTo}</span>
                          </div>
                          <div className="flex items-center gap-2 text-[12px] font-bold text-tertiary">
                            <span className="material-symbols-outlined text-sm">payment</span>
                            <span>Type: {mobile.paymentType}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card Footer pricing and actions */}
                  <div className="flex justify-between items-center border-t border-white/5 pt-4 mt-auto">
                    <div className="text-left">
                      <div className="text-[10px] uppercase text-on-surface-variant tracking-wider">
                        {isSold ? 'Selling Price' : 'Purchasing Price'}
                      </div>
                      <span className={`text-[15px] font-mono-data font-bold ${isSold ? 'text-on-surface-variant line-through opacity-60' : 'text-primary'}`}>
                        PKR {(isSold ? mobile.sellingPrice : mobile.purchasingPrice)?.toLocaleString()}
                      </span>
                    </div>

                    {!isSold ? (
                      <button 
                        onClick={(e) => { e.stopPropagation(); onSellClick(mobile); }}
                        className="bg-primary-container text-on-primary-container hover:bg-primary-container/80 px-3 py-1.5 rounded-lg text-xs font-bold active:scale-[0.98] transition-all cursor-pointer flex items-center gap-1 shadow shadow-primary-container/10"
                      >
                        <span className="material-symbols-outlined text-[14px]">shopping_cart</span>
                        Sell
                      </button>
                    ) : (
                      <div className="bg-white/5 border border-white/10 px-2.5 py-1 rounded-md text-[10px] font-bold text-on-surface-variant uppercase">
                        Closed
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MobileList;
