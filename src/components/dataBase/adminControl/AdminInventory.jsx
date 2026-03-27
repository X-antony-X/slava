import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Tag, Trash2, X, Loader2, Search, LayoutGrid, TicketPercent, ShoppingBag } from 'lucide-react';

const AdminInventory = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newOfferPrice, setNewOfferPrice] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => { fetchProducts(); }, []);
  useEffect(() => { applyFilters(); }, [searchQuery, activeTab, products]);

  const fetchProducts = async () => {
    setLoading(true);
    const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    if (data) setProducts(data);
    setLoading(false);
  };

  const applyFilters = () => {
    let result = products;
    if (activeTab === 'offers') result = result.filter(p => p.old_price);
    if (activeTab === 'regular') result = result.filter(p => !p.old_price);
    if (searchQuery) {
      result = result.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    setFilteredProducts(result);
  };

  const handleApplyOffer = async () => {
    if (!newOfferPrice || parseFloat(newOfferPrice) >= selectedProduct.price) return alert("Invalid Price");
    setActionLoading(true);
    const { error } = await supabase.from('products').update({ 
      old_price: selectedProduct.price, 
      price: parseFloat(newOfferPrice) 
    }).eq('id', selectedProduct.id);
    if (!error) { setIsModalOpen(false); setNewOfferPrice(''); fetchProducts(); }
    setActionLoading(false);
  };

  const handleRemoveOffer = async (product) => {
    setActionLoading(true);
    const { error } = await supabase.from('products').update({ 
      price: product.old_price, 
      old_price: null 
    }).eq('id', product.id);
    if (!error) fetchProducts();
    setActionLoading(false);
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-10 font-sans text-black bg-white min-h-screen">
      
      {/* Header & Search Area */}
      <div className="flex flex-col gap-6 mb-8 md:mb-12">
        <div className="space-y-1">
          <h2 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter">Inventory</h2>
          <div className="flex items-center gap-2">
            <span className="w-8 h-[2px] bg-black"></span>
            <p className="text-gray-400 font-bold uppercase text-[9px] md:text-[10px] tracking-[0.2em]">Management Portal</p>
          </div>
        </div>

        <div className="relative group w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-black transition-colors" size={20} />
          <input 
            type="text"
            placeholder="Search by product name..."
            className="bg-gray-50 border-2 border-gray-100 rounded-2xl py-4 md:py-5 pl-12 pr-6 outline-none focus:border-black transition-all w-full font-bold text-sm md:text-base"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Responsive Tabs - السكرول العرضي للموبايل */}
      <div className="overflow-x-auto no-scrollbar -mx-4 px-4 mb-8 md:mx-0 md:px-0">
        <div className="flex gap-2 min-w-max md:min-w-0 bg-gray-50 p-1.5 rounded-2xl border border-gray-100">
          {[
            { id: 'all', label: 'All Stock', icon: LayoutGrid },
            { id: 'offers', label: 'Hot Offers', icon: TicketPercent },
            { id: 'regular', label: 'Regular', icon: Tag }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 md:px-8 py-3 rounded-xl font-black uppercase text-[10px] md:text-xs tracking-widest transition-all ${
                activeTab === tab.id ? 'bg-black text-white shadow-lg shadow-black/10' : 'text-gray-400 hover:text-black hover:bg-white'
              }`}
            >
              <tab.icon size={14} /> {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid System - تحسين التقسيم */}
      {loading ? (
        <div className="h-64 flex flex-col items-center justify-center gap-4 text-gray-300">
          <Loader2 className="animate-spin" size={40} />
          <span className="font-black text-[10px] uppercase tracking-widest">Fetching Data...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-8">
          {filteredProducts.map((product) => (
            <div key={product.id} className="group border-2 border-gray-50 hover:border-black rounded-[2rem] p-3 md:p-5 transition-all duration-500 bg-white hover:shadow-[20px_20px_0px_0px_rgba(0,0,0,0.03)]">
              
              <div className="relative aspect-[4/5] mb-5 overflow-hidden rounded-[1.5rem] bg-gray-100">
                <img 
                  src={product.image_urls[0]} 
                  alt="" 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                />
                {product.old_price && (
                  <div className="absolute top-3 left-3 bg-red-600 text-white text-[8px] font-black px-3 py-1.5 rounded-full uppercase italic tracking-tighter">
                    Active Offer
                  </div>
                )}
                <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[8px] font-black uppercase border border-gray-100">
                  {product.category}
                </div>
              </div>

              <div className="space-y-4">
                <div className="min-h-[40px]">
                  <h3 className="font-black uppercase text-sm md:text-base leading-tight">{product.name}</h3>
                </div>
                
                <div className="flex items-baseline gap-2">
                  <span className="text-xl md:text-2xl font-black italic">{product.price} <span className="text-[10px]">EGP</span></span>
                  {product.old_price && (
                    <span className="text-gray-300 line-through text-[10px] md:text-xs font-bold decoration-red-400">{product.old_price} EGP</span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2">
                  <button 
                    onClick={() => { setSelectedProduct(product); setIsModalOpen(true); }} 
                    className="bg-black text-white py-4 rounded-xl font-black uppercase text-[9px] hover:bg-zinc-800 transition-all active:scale-95 flex items-center justify-center gap-2"
                  >
                    <TicketPercent size={14} /> Offer
                  </button>
                  <button 
                    onClick={() => handleRemoveOffer(product)}
                    disabled={!product.old_price || actionLoading}
                    className={`py-4 rounded-xl font-black uppercase text-[9px] flex items-center justify-center gap-2 transition-all active:scale-95 ${
                      product.old_price ? 'bg-gray-100 text-black hover:bg-red-50 hover:text-red-600' : 'bg-gray-50 text-gray-200 opacity-50 cursor-not-allowed'
                    }`}
                  >
                    <Trash2 size={14} /> Reset
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredProducts.length === 0 && (
        <div className="py-20 text-center border-2 border-dashed border-gray-100 rounded-[3rem]">
          <ShoppingBag size={48} className="mx-auto text-gray-100 mb-4" />
          <p className="text-gray-300 font-black uppercase text-xs tracking-[0.2em]">No products found in this category</p>
        </div>
      )}

{/* Modal - Optimized for Ultra-Responsive Mobile Experience */}
{isModalOpen && selectedProduct && (
  <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-end md:items-center justify-center z-[500] p-0 md:p-4">
    {/* Overlay to close modal when clicking outside */}
    <div className="absolute inset-0" onClick={() => { setIsModalOpen(false); setNewOfferPrice(''); }}></div>
    
    <div className="relative bg-white w-full max-w-lg rounded-t-[2.5rem] md:rounded-[3rem] p-6 sm:p-8 md:p-10 shadow-2xl animate-slide-up max-h-[95vh] overflow-y-auto">
      {/* Mobile Handle Indicator */}
      <div className="w-12 h-1.5 bg-gray-100 rounded-full mx-auto mb-6 md:hidden"></div>
      
      {/* Dynamic Header: adjusted font size for small screens */}
      <header className="mb-6 md:mb-8">
        <h3 className="text-[1.75rem] xs:text-[2.2rem] md:text-4xl font-black italic uppercase leading-[0.9] tracking-tighter">
          Apply New <br /> 
          <span className="text-red-600 underline underline-offset-4 decoration-2">Discount Price</span>
        </h3>
      </header>
      
      <div className="space-y-5 md:space-y-6">
        {/* Compact Product Preview */}
        <div className="flex items-center gap-3 sm:gap-4 bg-gray-50 p-3 sm:p-4 rounded-2xl border border-gray-100">
          <div className="w-12 h-12 sm:w-16 sm:h-16 shrink-0">
            <img src={selectedProduct.image_urls[0]} className="w-full h-full rounded-xl object-cover shadow-sm" alt="product" />
          </div>
          <div className="min-w-0">
            <p className="font-black text-[9px] uppercase text-gray-400 tracking-widest truncate">
              {selectedProduct.name}
            </p>
            <p className="font-black text-lg sm:text-xl italic">
              {selectedProduct.price} <span className="text-[10px] not-italic">EGP</span>
            </p>
          </div>
        </div>

        {/* Input Area: Large but scales down on small mobile */}
        <div className="relative py-2">
          <label className="block text-[8px] font-black uppercase text-gray-400 mb-1 tracking-[0.2em]">Enter New Amount</label>
          <div className="flex items-baseline gap-2 border-b-4 border-black focus-within:border-red-600 transition-colors">
            <input 
              type="number"
              placeholder="000"
              className="w-full py-2 bg-transparent outline-none font-black text-5xl xs:text-6xl md:text-7xl transition-all placeholder:text-gray-100"
              value={newOfferPrice}
              onChange={(e) => setNewOfferPrice(e.target.value)}
              autoFocus
            />
            <span className="font-black text-xl md:text-2xl text-gray-300 italic">EGP</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 pt-2">
          <button 
            onClick={handleApplyOffer} 
            disabled={actionLoading || !newOfferPrice}
            className="w-full bg-black text-white py-4 sm:py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-zinc-800 active:scale-[0.98] disabled:bg-gray-200 disabled:text-gray-400 transition-all flex items-center justify-center gap-2 text-sm sm:text-base"
          >
            {actionLoading ? <Loader2 className="animate-spin" size={20} /> : 'Publish Offer'}
          </button>
          
          <button 
            onClick={() => { setIsModalOpen(false); setNewOfferPrice(''); }} 
            className="w-full text-gray-400 font-black uppercase text-[10px] py-2 hover:text-black transition-colors tracking-[0.3em]"
          >
            Discard Changes
          </button>
        </div>
      </div>
    </div>
  </div>
)}
    </div>
  );
};

export default AdminInventory;