import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Search, Edit, Trash2, X, Save, Loader2, Plus, Image as ImageIcon } from 'lucide-react';

const AVAILABLE_SIZES = ['S', 'M', 'L', 'XL', '2XL', '3XL'];
const PREDEFINED_COLORS = [
  { name: 'Black', hex: '#000000' },
  { name: 'Blue', hex: '#1E40AF' },
  { name: 'Grey', hex: '#6B7280' },
  { name: 'White', hex: '#FFFFFF' },
  { name: 'Red', hex: '#EF4444' },
  { name: 'Green', hex: '#10B981' },
  { name: 'Beige', hex: '#F5F5DC' },
];

const EditProduct = () => {
  const [customColor, setCustomColor] = useState("#000000");
  const [showConfirm, setShowConfirm] = useState(false);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // State للفلاتر في صفحة العرض
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [categories, setCategories] = useState(['All']);
  
  // State جديدة عشان نخزن فيها الفئات اللي جاية من جدول navbar_categories عشان قائمة التعديل
  const [dbCategories, setDbCategories] = useState([]); 

  const [editingProduct, setEditingProduct] = useState(null);
  const [updateLoading, setUpdateLoading] = useState(false);

  const fetchProductsAndCategories = async () => {
    setLoading(true);
    try {
      // 1. جلب المنتجات
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (productsError) throw productsError;
      setProducts(productsData || []);
      
      // للفلاتر العادية اللي فوق
      const uniqueCategories = ['All', ...new Set(productsData.map(p => p.category))];
      setCategories(uniqueCategories);

      // 2. جلب الفئات من جدول navbar_categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('navbar_categories')
        .select('name');
        
      if (categoriesError) throw categoriesError;
      // بنحولها لحروف صغيرة (toLowerCase) عشان تبقى متطابقة مع طريقة كتابتك في جدول الـ products
      if (categoriesData) {
        setDbCategories(categoriesData.map(cat => cat.name.toLowerCase()));
      }

    } catch (error) {
      console.error('Error fetching data:', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductsAndCategories();
  }, []);

  const addItem = (field, value) => {
    if (!value) return;
    setEditingProduct({
      ...editingProduct,
      [field]: [...(editingProduct[field] || []), value]
    });
  };

  const removeItem = (field, index) => {
    const updatedArray = editingProduct[field].filter((_, i) => i !== index);
    setEditingProduct({ ...editingProduct, [field]: updatedArray });
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    setUpdateLoading(true);

    try {
      const uploadPromises = files.map(async (file) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `products/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
          .from('product-images')
          .getPublicUrl(filePath);

        return data.publicUrl;
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      setEditingProduct(prev => ({
        ...prev,
        image_urls: [...(prev.image_urls || []), ...uploadedUrls]
      }));
    } catch (error) {
      alert("Upload failed: " + error.message);
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setUpdateLoading(true);

    try {
      const { error } = await supabase
        .from('products')
        .update({
          name: editingProduct.name,
          category: editingProduct.category, // الفئة هتتحدث هنا
          price: parseFloat(editingProduct.price),
          quantity: parseInt(editingProduct.quantity), // الكمية هتتحدث هنا
          old_price: editingProduct.old_price ? parseFloat(editingProduct.old_price) : null,
          is_available: editingProduct.is_available,
          sizes: editingProduct.sizes,
          colors: editingProduct.colors,
          image_urls: editingProduct.image_urls
        })
        .eq('id', editingProduct.id);

      if (error) throw error;

      setProducts(products.map(p => p.id === editingProduct.id ? editingProduct : p));
      setEditingProduct(null);
      alert("Product Updated Successfully! 🔥");
    } catch (error) {
      console.error("Error updating:", error.message);
      alert("Update failed. Check console for details.");
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
      setProducts(products.filter(p => p.id !== id));
    } catch (error) {
      alert("Delete failed.");
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-7xl mx-auto p-6 md:p-8 font-sans text-black mb-20">
      {/* Search & Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
        <div>
          <h2 className="text-3xl font-black italic uppercase tracking-tight">Manage Drops <span className="text-gray-300">/ slava</span></h2>
          <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mt-2">Inventory: {products.length} Items</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input type="text" placeholder="SEARCH..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 pr-4 py-3 border-2 border-gray-100 rounded-xl outline-none focus:border-black font-bold text-sm w-full sm:w-64 transition-all" />
          </div>
          <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="px-4 py-3 border-2 border-gray-100 rounded-xl outline-none focus:border-black font-bold text-sm uppercase cursor-pointer">
            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map(product => (
          <div key={product.id} className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm group">
            <div className="aspect-[4/5] bg-gray-100 relative">
              <img src={product.image_urls?.[0]} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              {!product.is_available && <div className="absolute top-4 right-4 bg-red-500 text-white text-[10px] font-black px-2 py-1 rounded uppercase">Sold Out</div>}
            </div>
            <div className="p-5">
              <h3 className="font-black text-lg uppercase truncate">{product.name}</h3>
              <p className="font-bold text-gray-500">{product.price} EGP</p>
              <div className="flex gap-2 mt-4">
                <button onClick={() => setEditingProduct(product)} className="flex-1 bg-gray-50 hover:bg-gray-100 py-2 rounded-xl flex justify-center items-center gap-2 font-bold text-xs uppercase"><Edit className="h-4 w-4" /> Edit</button>
                <button onClick={() => handleDelete(product.id)} className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 py-2 rounded-xl flex justify-center items-center gap-2 font-bold text-xs uppercase"><Trash2 className="h-4 w-4" /> Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {editingProduct && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-2xl p-6 md:p-10 relative shadow-2xl my-auto">
            <button type="button" onClick={() => setEditingProduct(null)} className="absolute top-6 right-6 text-gray-400 hover:text-black"><X className="h-6 w-6" /></button>
            <h3 className="text-2xl font-black italic uppercase mb-8">Update Product Details</h3>
            
            <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Product Name */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold uppercase text-gray-400">Product Name</label>
                <input type="text" value={editingProduct.name} onChange={(e) => setEditingProduct({...editingProduct, name: e.target.value})} className="border-2 border-gray-100 p-3 rounded-xl outline-none focus:border-black font-bold" required />
              </div>

              {/* Category (من جدول navbar_categories) */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold uppercase text-gray-400">Category</label>
                <select 
                  value={editingProduct.category || ''} 
                  onChange={(e) => setEditingProduct({...editingProduct, category: e.target.value})} 
                  className="border-2 border-gray-100 p-3 rounded-xl outline-none focus:border-black font-bold uppercase" 
                  required
                >
                  <option value="" disabled>Select Category</option>
                  {/* بنعمل Map على الفئات اللي جبناها من الداتا بيز */}
                  {dbCategories.map((cat, index) => (
                    <option key={index} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* تعديل قسم الأسعار والكمية */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:col-span-2"> 
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold uppercase text-gray-400">Price</label>
                  <input type="number" value={editingProduct.price} onChange={(e) => setEditingProduct({...editingProduct, price: e.target.value})} className="border-2 border-gray-100 p-3 rounded-xl outline-none focus:border-black font-bold" required />
                </div>
                
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold uppercase text-gray-400">Old Price</label>
                  <input type="number" value={editingProduct.old_price || ''} onChange={(e) => setEditingProduct({...editingProduct, old_price: e.target.value})} className="border-2 border-gray-100 p-3 rounded-xl outline-none focus:border-black font-bold" />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold uppercase text-gray-400">Quantity (Stock)</label>
                  <input 
                    type="number" 
                    value={editingProduct.quantity || 0} 
                    onChange={(e) => setEditingProduct({...editingProduct, quantity: e.target.value})} 
                    className="border-2 border-gray-100 p-3 rounded-xl outline-none focus:border-black font-bold" 
                    required 
                  />
                </div>
              </div>

              {/* Sizes Select */}
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold uppercase text-gray-400">Sizes</label>
                <select 
                  onChange={(e) => {
                    if (e.target.value && !editingProduct.sizes?.includes(e.target.value)) addItem('sizes', e.target.value);
                    e.target.value = "";
                  }}
                  className="border-2 border-gray-100 p-2 rounded-lg outline-none focus:border-black text-sm font-bold bg-white"
                >
                  <option value="">Add Size...</option>
                  {AVAILABLE_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <div className="flex flex-wrap gap-2">
                  {editingProduct.sizes?.map((s, i) => (
                    <span key={i} className="bg-black text-white px-3 py-1 rounded-md text-xs font-black flex items-center gap-2">
                      {s} <X className="h-3 w-3 cursor-pointer" onClick={() => removeItem('sizes', i)} />
                    </span>
                  ))}
                </div>
              </div>

              {/* Colors Picker */}
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold uppercase text-gray-400">Colors</label>
                <div className="flex flex-wrap items-center gap-3">
                  {/* الألوان المحددة مسبقاً */}
                  {PREDEFINED_COLORS.map((c) => (
                    <button
                      key={c.name}
                      type="button"
                      onClick={() => { if(!editingProduct.colors?.includes(c.name)) addItem('colors', c.name); }}
                      className={`h-6 w-6 rounded-full border-2 transition-all ${editingProduct.colors?.includes(c.name) ? 'border-black scale-110 shadow-sm' : 'border-gray-200 hover:scale-105'}`}
                      style={{ backgroundColor: c.hex }}
                      title={c.name}
                    />
                  ))}

                  {/* زرار إضافة لون مخصص */}
                  <div className="flex flex-col items-center gap-1 group relative">
                    <div 
                      className="h-7 w-7 rounded-full border-2 border-dashed border-gray-400 flex items-center justify-center cursor-pointer hover:border-black transition-colors"
                      onClick={() => document.getElementById('customColorInput').click()}
                      style={{ backgroundColor: customColor }}
                    >
                      <span className={`text-lg font-light ${customColor === '#ffffff' ? 'text-black' : 'text-white'}`}>+</span>
                    </div>
                    
                    <input 
                      id="customColorInput"
                      type="color" 
                      value={customColor}
                      onChange={(e) => {
                        setCustomColor(e.target.value);
                        setShowConfirm(true);
                      }}
                      className="absolute invisible"
                    />

                    {showConfirm && (
                      <button
                        type="button"
                        onClick={() => {
                          if(!editingProduct.colors?.includes(customColor)) {
                            addItem('colors', customColor);
                            setShowConfirm(false);
                          }
                        }}
                        className="text-[10px] font-black uppercase tracking-tighter border-b border-black leading-none mt-1 animate-pulse"
                      >
                        Confirm
                      </button>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {editingProduct.colors?.map((c, i) => (
                    <span key={i} className="border-2 border-gray-100 px-2 py-1 rounded-md text-[10px] font-bold flex items-center gap-1">
                      {c} <X className="h-3 w-3 cursor-pointer text-red-500" onClick={() => removeItem('colors', i)} />
                    </span>
                  ))}
                </div>
              </div>

              {/* Image Upload */}
              <div className="md:col-span-2 flex flex-col gap-2 border-t pt-6">
                <label className="text-[10px] font-bold uppercase text-gray-400 flex items-center gap-2"><ImageIcon className="h-3 w-3" /> Gallery</label>
                <div className="relative border-2 border-dashed border-gray-100 rounded-xl p-4 hover:border-black transition-colors">
                  <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                  <p className="text-center text-xs font-bold text-gray-400">Click to upload product images</p>
                </div>
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {editingProduct.image_urls?.map((url, i) => (
                    <div key={i} className="relative aspect-square rounded-lg overflow-hidden border group">
                      <img src={url} className="w-full h-full object-cover" />
                      <button type="button" onClick={() => removeItem('image_urls', i)} className="absolute inset-0 bg-red-500/80 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  ))}
                </div>
              </div>

              <button type="submit" disabled={updateLoading} className="md:col-span-2 bg-black text-white font-black uppercase py-4 rounded-2xl mt-4 flex justify-center items-center gap-3">
                {updateLoading ? <Loader2 className="animate-spin h-5 w-5" /> : <><Save className="h-5 w-5" /> Update Drop</>}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditProduct;