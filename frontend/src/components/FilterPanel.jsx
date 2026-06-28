const BRANDS = ['Apple', 'Samsung', 'Xiaomi', 'Oppo', 'Vivo'];
const CONDITIONS = ['Brand New (Box Packed)', 'Like New (10/10)', 'Good (9/10)', 'Fair (8/10)', 'Rough'];

const FilterPanel = ({ filters, onChange, onReset, onClose }) => {
  const activeCount =
    filters.brands.length +
    (filters.condition ? 1 : 0) +
    (filters.priceMin ? 1 : 0) +
    (filters.priceMax ? 1 : 0) +
    (filters.paymentType !== 'All' ? 1 : 0);

  return (
    <div
      className="absolute top-full right-0 mt-2 w-80 bg-surface-container rounded-2xl border border-white/10 shadow-2xl shadow-black/60 z-50 p-4"
      style={{ animation: 'fadeInDown 0.15s ease' }}
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-sm font-bold text-on-surface">Filter Inventory</h3>
          {activeCount > 0 && (
            <p className="text-[10px] text-primary mt-0.5">
              {activeCount} filter{activeCount > 1 ? 's' : ''} active
            </p>
          )}
        </div>
        <button
          onClick={onClose}
          className="text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">close</span>
        </button>
      </div>

      {/* Brand */}
      <div className="mb-4">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-on-surface-variant mb-2">Brand</p>
        <div className="flex flex-wrap gap-1.5">
          {BRANDS.map(brand => (
            <button
              key={brand}
              onClick={() => {
                const newBrands = filters.brands.includes(brand)
                  ? filters.brands.filter(b => b !== brand)
                  : [...filters.brands, brand];
                onChange({ ...filters, brands: newBrands });
              }}
              className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-all cursor-pointer ${
                filters.brands.includes(brand)
                  ? 'bg-primary-container text-on-primary-container'
                  : 'bg-surface-container-high text-on-surface-variant hover:text-on-surface'
              }`}
            >
              {brand}
            </button>
          ))}
        </div>
      </div>

      {/* Condition */}
      <div className="mb-4">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-on-surface-variant mb-2">Condition</p>
        <select
          value={filters.condition}
          onChange={(e) => onChange({ ...filters, condition: e.target.value })}
          className="w-full bg-surface-container-high rounded-lg px-3 py-2 text-xs text-on-surface border border-white/10 outline-none cursor-pointer"
        >
          <option value="">All Conditions</option>
          {CONDITIONS.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Price Range */}
      <div className="mb-4">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-on-surface-variant mb-2">Price Range (PKR)</p>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Min"
            value={filters.priceMin}
            onChange={(e) => onChange({ ...filters, priceMin: e.target.value })}
            className="flex-1 min-w-0 bg-surface-container-high rounded-lg px-3 py-2 text-xs text-on-surface border border-white/10 outline-none placeholder:text-on-surface-variant/50"
          />
          <input
            type="number"
            placeholder="Max"
            value={filters.priceMax}
            onChange={(e) => onChange({ ...filters, priceMax: e.target.value })}
            className="flex-1 min-w-0 bg-surface-container-high rounded-lg px-3 py-2 text-xs text-on-surface border border-white/10 outline-none placeholder:text-on-surface-variant/50"
          />
        </div>
      </div>

      {/* Payment Type */}
      <div className="mb-4">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-on-surface-variant mb-2">Payment Type</p>
        <div className="flex gap-2">
          {['All', 'Cash', 'Udhaar'].map(pt => (
            <button
              key={pt}
              onClick={() => onChange({ ...filters, paymentType: pt })}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                filters.paymentType === pt
                  ? 'bg-primary-container text-on-primary-container'
                  : 'bg-surface-container-high text-on-surface-variant hover:text-on-surface'
              }`}
            >
              {pt}
            </button>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-3 border-t border-white/10">
        <button
          onClick={onReset}
          className="flex-1 py-2 rounded-xl text-xs font-semibold bg-surface-container-high text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
        >
          Reset All
        </button>
        <button
          onClick={onClose}
          className="flex-1 py-2 rounded-xl text-xs font-semibold bg-primary-container text-on-primary-container hover:opacity-90 transition-opacity cursor-pointer"
        >
          Apply Filters
        </button>
      </div>
    </div>
  );
};

export default FilterPanel;
