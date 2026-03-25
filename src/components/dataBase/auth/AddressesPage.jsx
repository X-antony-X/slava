import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from "../supabaseClient";
import { Plus, MapPin, Trash2 } from 'lucide-react'; // أيقونات جديدة

const AddressesPage = ({ userId }) => {
  const queryClient = useQueryClient();

  const { data: addresses, isLoading } = useQuery({
    queryKey: ['addresses', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', userId)
        .order('is_default', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) return <div className="p-10 text-center uppercase font-black">Loading Addresses...</div>;

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 font-sans">
      <h1 className="text-xl md:text-2xl font-bold uppercase tracking-widest mb-10 pb-6 border-b">Addresses</h1>

      {addresses?.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-6">
          <div className="p-6 bg-gray-50 rounded-full">
            <MapPin size={60} strokeWidth={1} className="text-gray-300" />
          </div>
          <h2 className="text-xl font-bold uppercase tracking-tight">You have no saved addresses</h2>
          <p className="text-gray-500 text-sm max-w-xs">Add an address to speed up your checkout process.</p>
          <button className="bg-black text-white px-8 py-4 text-xs font-black uppercase tracking-widest hover:bg-zinc-800 transition-all flex items-center gap-2">
            <Plus size={16} /> Add New Address
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {addresses?.map((addr) => (
            <div key={addr.id} className={`border p-6 relative ${addr.is_default ? 'border-black' : 'border-gray-200'}`}>
              {addr.is_default && (
                <span className="absolute top-0 right-0 bg-black text-white text-[10px] px-3 py-1 font-bold uppercase italic">Default</span>
              )}
              <h3 className="font-bold text-lg mb-2">{addr.full_name}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                {addr.street_address}<br />
                {addr.city}<br />
                {addr.phone_number}
              </p>
              <div className="mt-6 flex gap-4">
                <button className="text-xs font-bold uppercase underline">Edit</button>
                <button className="text-xs font-bold uppercase underline text-red-600">Remove</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AddressesPage;