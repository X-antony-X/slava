import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Tag, Trash2, X, Loader2, Search, Filter, LayoutGrid, TicketPercent } from 'lucide-react';

const AdminInventory = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'offers', 'regular'
  const [searchQuery, setSearchQuery] = useState('');
  
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newOfferPrice, setNewOfferPrice] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchQuery, activeTab, products]);

  const fetchProducts = async () => {
    setLoading(true);
    const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    if (data) setProducts(data);
    setLoading(false);
  };

  const applyFilters = () => {
    let result = products;

    // Filter by Tab
    if (activeTab === 'offers') result = result.filter(p => p.old_price);
    if (activeTab === 'regular') result = result.filter(p => !p.old_price);

    // Filter by Search
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
    
    if (!error) { setIsModalOpen(false); fetchProducts(); }
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
    <div className="max-w-7xl mx-auto p-6 font-sans text-black">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <h2 className="text-5xl font-black italic uppercase tracking-tighter mb-2">Inventory</h2>
          <p className="text-gray-400 font-bold uppercase text-[10px] tracking-[0.3em]">Control your drops and offers</p>
        </div>

        {/* Search Bar */}
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-black transition-colors" size={18} />
          <input 
            type="text"
            placeholder="Search products..."
            className="bg-gray-50 border-2 border-gray-100 rounded-2xl py-4 pl-12 pr-6 outline-none focus:border-black transition-all w-full md:w-80 font-bold"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Tabs System */}
      <div className="flex gap-2 mb-8 bg-gray-50 p-1.5 rounded-2xl w-fit border border-gray-100">
        {[
          { id: 'all', label: 'All Items', icon: LayoutGrid },
          { id: 'offers', label: 'On Sale', icon: TicketPercent },
          { id: 'regular', label: 'Regular', icon: Tag }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all ${
              activeTab === tab.id ? 'bg-white text-black shadow-sm border border-gray-100' : 'text-gray-400 hover:text-black'
            }`}
          >
            <tab.icon size={14} /> {tab.label}
          </button>
        ))}
      </div>

      {/* Stats Summary */}
      <div className="mb-8 text-[11px] font-black uppercase text-gray-400">
        Showing {filteredProducts.length} Products
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="h-64 flex items-center justify-center"><Loader2 className="animate-spin" /></div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <div key={product.id} className="group border-2 border-gray-50 hover:border-black rounded-[2.5rem] p-4 transition-all duration-500 bg-white shadow-sm hover:shadow-2xl">
              <div className="relative h-60 mb-6 overflow-hidden rounded-[1.8rem]">
                <img src={product.image_urls[0]} alt="" className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700" />
                {product.old_price && (
                  <div className="absolute top-4 left-4 bg-black text-white text-[9px] font-black px-3 py-1.5 rounded-full uppercase italic">Offer Active</div>
                )}
              </div>

              <div className="px-2">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-black uppercase text-sm">{product.name}</h3>
                  <span className="text-[8px] font-black text-gray-300 uppercase">{product.category}</span>
                </div>
                <div className="flex items-baseline gap-2 mb-6">
                  <span className="text-xl font-black italic">{product.price} EGP</span>
                  {product.old_price && <span className="text-gray-300 line-through text-[10px] font-bold">{product.old_price} EGP</span>}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => { setSelectedProduct(product); setIsModalOpen(true); }} className="bg-black text-white py-3 rounded-xl font-black uppercase text-[9px] hover:bg-gray-800 transition-all flex items-center justify-center gap-2">
                    <Tag size={12} /> Offer
                  </button>
                  <button 
                    onClick={() => handleRemoveOffer(product)}
                    disabled={!product.old_price}
                    className={`py-3 rounded-xl font-black uppercase text-[9px] flex items-center justify-center gap-2 transition-all ${
                      product.old_price ? 'bg-red-50 text-red-600 hover:bg-red-600 hover:text-white border border-red-100' : 'bg-gray-50 text-gray-200 cursor-not-allowed'
                    }`}
                  >
                    <Trash2 size={12} /> Clear
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal - نفس التصميم السابق مع تحسينات بسيطة */}
      {isModalOpen && selectedProduct && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[500] p-4">
          <div className="bg-white w-full max-w-sm rounded-[3rem] p-8 shadow-2xl scale-in-center">
            <h3 className="text-xl font-black italic uppercase mb-6 flex items-center gap-2">
              <TicketPercent className="text-red-600" /> New Offer Price
            </h3>
            <div className="bg-gray-50 p-4 rounded-2xl mb-6 flex items-center gap-4">
               <img src={selectedProduct.image_urls[0]} className="w-12 h-12 rounded-lg object-cover" />
               <p className="font-black text-xs uppercase">{selectedProduct.name}</p>
            </div>
            <input 
              type="number"
              placeholder="0.00 EGP"
              className="w-full border-b-4 border-gray-100 p-4 outline-none focus:border-black font-black text-3xl mb-8 transition-all"
              value={newOfferPrice}
              onChange={(e) => setNewOfferPrice(e.target.value)}
            />
            <div className="flex flex-col gap-3">
              <button onClick={handleApplyOffer} className="w-full bg-black text-white py-5 rounded-2xl font-black uppercase tracking-widest">Update Price</button>
              <button onClick={() => setIsModalOpen(false)} className="w-full text-gray-400 font-black uppercase text-[10px]">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminInventory;