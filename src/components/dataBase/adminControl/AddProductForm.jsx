import { useState } from 'react';
import { supabase } from '../supabaseClient'; 
import { Check, Plus, Upload, Loader2, Delete } from 'lucide-react'; 
import DeleteUser from './DeleteUser';

const AddProductForm = () => {
  const [loading, setLoading] = useState(false);
  const [product, setProduct] = useState({
    name: '',
    category: 'hoodie',
    price: '',
    colors: [], 
    sizes: [], 
  });
  
  const [images, setImages] = useState([]);
  const [customColor, setCustomColor] = useState('#121212');

  const categories = ['hoodie', 'jacket', 't-shirt', 'shirt', 'pullover', 'pants', 'sweatpants', 'shorts'];
  const availableSizes = ['S', 'M', 'L', 'XL', '2XL', '3XL'];

  const presetColors = [
    { name: 'Black', hex: '#000000' },
    { name: 'Blue', hex: '#1E40AF' },
    { name: 'Grey', hex: '#6B7280' },
    { name: 'White', hex: '#FFFFFF' },
    { name: 'Red', hex: '#EF4444' },
    { name: 'Green', hex: '#10B981' },
    { name: 'Beige', hex: '#F5F5DC' },
  ];

  const handleSizeChange = (size) => {
    setProduct(prev => ({
      ...prev,
      sizes: prev.sizes.includes(size) 
        ? prev.sizes.filter(s => s !== size) 
        : [...prev.sizes, size]
    }));
  };

  const handleColorChange = (colorValue) => {
    setProduct(prev => ({
      ...prev,
      colors: prev.colors.includes(colorValue)
        ? prev.colors.filter(c => c !== colorValue)
        : [...prev.colors, colorValue]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (images.length < 1) return alert("Please upload at least one image");
    
    setLoading(true);
    try {
      const uploadedImageUrls = [];

      for (const file of images) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}-${Date.now()}.${fileExt}`;
        const filePath = `products/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('product-images')
          .getPublicUrl(filePath);

        uploadedImageUrls.push(publicUrl);
      }

      const { error: dbError } = await supabase
        .from('products')
        .insert([
          {
            name: product.name,
            category: product.category,
            price: parseFloat(product.price),
            colors: product.colors,
            sizes: product.sizes,
            image_urls: uploadedImageUrls,
          },
        ]);

      if (dbError) throw dbError;

      alert("🎉 Drop Published Successfully!");
      setProduct({ name: '', category: 'hoodie', price: '', colors: [], sizes: [] });
      setImages([]);
      e.target.reset();

    } catch (err) {
      console.error(err);
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
  <>
    <div className="max-w-2xl mx-auto p-8 bg-white rounded-xl shadow-sm border border-gray-100 mt-10 mb-20 font-sans text-black">
      <h2 className="text-3xl font-black italic uppercase mb-8 tracking-tight">
        Add New Drop <span className="text-gray-300">/ Robino</span>
      </h2>
      
      <form onSubmit={handleSubmit} className="flex flex-col gap-8">
        
        {/* Name */}
        <div className="flex flex-col gap-2">
          <label className="font-bold text-[12px] uppercase tracking-widest text-gray-400">Product Name</label>
          <input 
            type="text" 
            required
            value={product.name}
            placeholder="ROBINO ESSENTIAL"
            className="border-2 border-gray-100 p-4 rounded-xl outline-none focus:border-black transition-all font-bold"
            onChange={(e) => setProduct({...product, name: e.target.value})}
          />
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="flex flex-col gap-2">
            <label className="font-bold text-[12px] uppercase tracking-widest text-gray-400">Category</label>
            <select 
              value={product.category}
              className="border-2 border-gray-100 p-4 rounded-xl outline-none cursor-pointer focus:border-black font-bold"
              onChange={(e) => setProduct({...product, category: e.target.value})}
            >
              {categories.map(cat => <option key={cat} value={cat}>{cat.toUpperCase()}</option>)}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-bold text-[12px] uppercase tracking-widest text-gray-400">Price (EGP)</label>
            <input 
              type="number" 
              required
              value={product.price}
              placeholder="0.00"
              className="border-2 border-gray-100 p-4 rounded-xl outline-none focus:border-black font-bold"
              onChange={(e) => setProduct({...product, price: e.target.value})}
            />
          </div>
        </div>

        {/* Colors Section */}
        <div className="flex flex-col gap-4">
          <label className="font-bold text-[12px] uppercase tracking-widest text-gray-400">Available Colors</label>
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-y-6 gap-x-2">
            {/* Preset Colors */}
            {presetColors.map((col) => {
              const isSelected = product.colors.includes(col.name);
              return (
                <div key={col.name} className="flex flex-col items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleColorChange(col.name)}
                    className={`w-10 h-10 rounded-full border-2 transition-all relative flex items-center justify-center ${
                      isSelected ? 'border-black scale-110 shadow-lg' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: col.hex }}
                  >
                    {isSelected && (
                      <Check className={`h-5 w-5 ${col.hex === '#FFFFFF' || col.name === 'Beige' ? 'text-black' : 'text-white'}`} />
                    )}
                  </button>
                  <span className={`text-[9px] font-black uppercase ${isSelected ? 'text-black' : 'text-gray-300'}`}>
                    {col.name}
                  </span>
                </div>
              );
            })}

            {/* Custom Color Picker Improved */}
            <div className="flex flex-col items-center gap-2">
              <div className="relative w-10 h-10 group">
                <input
                  type="color"
                  value={customColor}
                  onChange={(e) => setCustomColor(e.target.value)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                />
                <button
                  type="button"
                  onClick={() => handleColorChange(customColor)}
                  className={`w-full h-full rounded-full border-2 transition-all flex items-center justify-center shadow-sm ${
                    product.colors.includes(customColor) 
                    ? 'border-black scale-110 shadow-lg' 
                    : 'border-dashed border-gray-300 bg-gray-50'
                  }`}
                  style={{ backgroundColor: customColor }}
                >
                  {product.colors.includes(customColor) ? (
                    <Check className="h-5 w-5 text-white mix-blend-difference" />
                  ) : (
                    <Plus className="h-4 w-4 text-gray-400 group-hover:text-black transition-colors" />
                  )}
                </button>
              </div>
              <button 
                type="button"
                onClick={() => handleColorChange(customColor)}
                className="text-[9px] font-black text-black underline uppercase hover:text-gray-400 transition-colors"
              >
                Confirm
              </button>
            </div>
          </div>
          
          {/* Display selected custom hex codes if any (Optional visual aid) */}
          <div className="flex flex-wrap gap-2 mt-2">
            {product.colors.filter(c => c.startsWith('#')).map(hex => (
              <div key={hex} className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded text-[10px] font-bold">
                <div className="w-2 h-2 rounded-full" style={{backgroundColor: hex}} />
                {hex.toUpperCase()}
              </div>
            ))}
          </div>
        </div>

        {/* Sizes */}
        <div className="flex flex-col gap-4">
          <label className="font-bold text-[12px] uppercase tracking-widest text-gray-400">Select Sizes</label>
          <div className="grid grid-cols-3 gap-2">
            {availableSizes.map(size => (
              <button
                key={size}
                type="button"
                onClick={() => handleSizeChange(size)}
                className={`py-4 rounded-md font-bold border transition-all ${
                  product.sizes.includes(size) 
                  ? 'border-black bg-black text-white' 
                  : 'border-gray-100 text-gray-900 hover:border-black'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        {/* Upload */}
        <div className="flex flex-col gap-2">
          <label className="font-bold text-[12px] uppercase tracking-widest text-gray-400">Product Gallery</label>
          <div className="border-2 border-dashed border-gray-100 rounded-2xl p-8 flex flex-col items-center bg-gray-50 hover:bg-gray-100 transition-all cursor-pointer relative group">
            <input 
              type="file" 
              multiple 
              accept="image/*"
              className="absolute inset-0 opacity-0 cursor-pointer"
              onChange={(e) => setImages(Array.from(e.target.files).slice(0, 5))}
            />
            <Upload className="h-8 w-8 text-gray-300 mb-2 group-hover:text-black transition-colors" />
            <p className="text-sm text-gray-500 font-bold uppercase">Click to upload visuals</p>
          </div>
          {images.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {images.map((img, idx) => (
                <div key={idx} className="text-[10px] bg-black text-white px-2 py-1 rounded-md font-bold uppercase">
                   IMAGE {idx + 1} SELECTED
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit */}
        <button 
          type="submit"
          disabled={loading}
          className="bg-black text-white font-black uppercase py-5 rounded-2xl mt-4 hover:tracking-[0.3em] transition-all duration-700 shadow-lg active:scale-[0.98] flex justify-center items-center"
        >
          {loading ? <Loader2 className="animate-spin h-6 w-6" /> : "Publish Design to Shop"}
        </button>

      </form>
    </div>
    <DeleteUser />  
  </>
  );
};

export default AddProductForm;