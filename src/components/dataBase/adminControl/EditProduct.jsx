import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Search, Edit, Trash2, X, Save, Loader2, Tag } from 'lucide-react';

const EditProduct = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [categories, setCategories] = useState(['All']);
  
  // State for Edit Modal
  const [editingProduct, setEditingProduct] = useState(null);
  const [updateLoading, setUpdateLoading] = useState(false);

  // 1. جلب المنتجات والأقسام
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setProducts(data || []);
      
      // استخراج الأقسام المتاحة من المنتجات نفسها
      const uniqueCategories = ['All', ...new Set(data.map(p => p.category))];
      setCategories(uniqueCategories);
    } catch (error) {
      console.error('Error fetching products:', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // 2. دالة الحذف
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this drop?");
    if (!confirmDelete) return;

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      // تحديث الواجهة بعد الحذف
      setProducts(products.filter(p => p.id !== id));
      alert("Product deleted successfully!");
    } catch (error) {
      console.error("Error deleting:", error.message);
      alert("Failed to delete product.");
    }
  };

  // 3. دالة تحديث المنتج
  const handleUpdate = async (e) => {
    e.preventDefault();
    setUpdateLoading(true);

    try {
      const { error } = await supabase
        .from('products')
        .update({
          name: editingProduct.name,
          category: editingProduct.category,
          price: parseFloat(editingProduct.price),
          old_price: editingProduct.old_price ? parseFloat(editingProduct.old_price) : null,
          is_available: editingProduct.is_available
        })
        .eq('id', editingProduct.id);

      if (error) throw error;

      // تحديث البيانات في الصفحة وقفل الـ Modal
      setProducts(products.map(p => p.id === editingProduct.id ? editingProduct : p));
      setEditingProduct(null);
      alert("Product updated successfully!");
    } catch (error) {
      console.error("Error updating:", error.message);
      alert("Failed to update product.");
    } finally {
      setUpdateLoading(false);
    }
  };

  // 4. فلترة المنتجات بناءً على البحث والقسم
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-7xl mx-auto p-6 md:p-8 font-sans text-black mb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
        <div>
          <h2 className="text-3xl font-black italic uppercase tracking-tight">
            Manage Drops <span className="text-gray-300">/ slava</span>
          </h2>
          <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mt-2">
            Total Inventory: {products.length} Items
          </p>
        </div>

        {/* Search & Filter Controls */}
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input 
              type="text" 
              placeholder="SEARCH DROPS..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-3 border-2 border-gray-100 rounded-xl outline-none focus:border-black font-bold text-sm uppercase w-full sm:w-64 transition-all"
            />
          </div>
          <select 
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-3 border-2 border-gray-100 rounded-xl outline-none focus:border-black font-bold text-sm uppercase cursor-pointer transition-all"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="animate-spin h-10 w-10 text-gray-300" />
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-100">
          <Tag className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="font-bold text-gray-400 uppercase tracking-widest">No products found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map(product => (
            <div key={product.id} className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all group relative">
              {/* Image */}
              <div className="aspect-[4/5] bg-gray-100 relative overflow-hidden">
                {product.image_urls && product.image_urls.length > 0 ? (
                  <img 
                    src={product.image_urls[0]} 
                    alt={product.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300 font-bold text-xs uppercase">No Image</div>
                )}
                {!product.is_available && (
                  <div className="absolute top-4 right-4 bg-red-500 text-white text-[10px] font-black px-2 py-1 rounded uppercase tracking-widest">
                    Sold Out
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-5">
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">{product.category}</p>
                <h3 className="font-black text-lg uppercase truncate">{product.name}</h3>
                <div className="flex items-center gap-2 mt-2">
                  <p className="font-bold">{product.price} EGP</p>
                  {product.old_price && (
                    <p className="text-gray-400 line-through text-sm font-bold">{product.old_price} EGP</p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-6">
                  <button 
                    onClick={() => setEditingProduct(product)}
                    className="flex-1 bg-gray-50 hover:bg-gray-100 border border-gray-100 text-black py-2 rounded-xl flex justify-center items-center gap-2 font-bold text-xs uppercase transition-colors"
                  >
                    <Edit className="h-4 w-4" /> Edit
                  </button>
                  <button 
                    onClick={() => handleDelete(product.id)}
                    className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 py-2 rounded-xl flex justify-center items-center gap-2 font-bold text-xs uppercase transition-colors"
                  >
                    <Trash2 className="h-4 w-4" /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal Overlay */}
      {editingProduct && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-8 relative shadow-2xl animate-in fade-in zoom-in duration-200">
            <button 
              onClick={() => setEditingProduct(null)}
              className="absolute top-6 right-6 text-gray-400 hover:text-black transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
            
            <h3 className="text-2xl font-black italic uppercase mb-6 tracking-tight">Edit Drop</h3>
            
            <form onSubmit={handleUpdate} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Name</label>
                <input 
                  type="text" 
                  value={editingProduct.name}
                  onChange={(e) => setEditingProduct({...editingProduct, name: e.target.value})}
                  className="border-2 border-gray-100 p-3 rounded-xl outline-none focus:border-black font-bold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Price</label>
                  <input 
                    type="number" 
                    value={editingProduct.price}
                    onChange={(e) => setEditingProduct({...editingProduct, price: e.target.value})}
                    className="border-2 border-gray-100 p-3 rounded-xl outline-none focus:border-black font-bold"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Old Price (Optional)</label>
                  <input 
                    type="number" 
                    value={editingProduct.old_price || ''}
                    onChange={(e) => setEditingProduct({...editingProduct, old_price: e.target.value})}
                    className="border-2 border-gray-100 p-3 rounded-xl outline-none focus:border-black font-bold"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 mt-2 p-4 border-2 border-gray-100 rounded-xl">
                <input 
                  type="checkbox" 
                  id="availability"
                  checked={editingProduct.is_available ?? true}
                  onChange={(e) => setEditingProduct({...editingProduct, is_available: e.target.checked})}
                  className="w-5 h-5 cursor-pointer accent-black"
                />
                <label htmlFor="availability" className="font-bold text-sm uppercase cursor-pointer">
                  In Stock / Available
                </label>
              </div>

              <button 
                type="submit"
                disabled={updateLoading}
                className="bg-black text-white font-black uppercase py-4 rounded-xl mt-4 hover:tracking-[0.2em] transition-all duration-500 flex justify-center items-center gap-2"
              >
                {updateLoading ? <Loader2 className="animate-spin h-5 w-5" /> : <><Save className="h-5 w-5" /> Save Changes</>}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditProduct;