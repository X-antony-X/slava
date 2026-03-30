

import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Mail, Search, Loader2, Copy, CheckCircle, Shield, MapPin, Phone, X, Send } from 'lucide-react';

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [copied, setCopied] = useState(false);
  
  // حالات الـ Broadcast Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, address, phone, is_admin, updated_at, email')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error.message);
    } finally {
      setLoading(false);
    }
  };

const handleBroadcast = () => {
    const bccList = users.map(u => u.email).filter(e => e).join(',');
    
    // تصميم الرسالة النصية بشكل "شيك" واحترافي
    const professionalBody = `
${emailBody}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
S L A V A  |  Custom Workwear
Premium Quality. Custom Design.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🌐 Website: slava-brand.vercel.app
📍 Ismailia, Egypt
📧 Contact: support@slava.com

Stay Sharp.
    `.trim();

    // استخدام encodeURIComponent لضمان ظهور التنسيق والرموز صح
    const mailtoLink = `mailto:?bcc=${bccList}&subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(professionalBody)}`;
    
    window.location.href = mailtoLink;
    setIsModalOpen(false);
  };

  const copyAllEmails = () => {
    const emailList = users.map(u => u.email).filter(e => e).join(', ');
    navigator.clipboard.writeText(emailList);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredUsers = users.filter(user => 
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-12 font-black uppercase text-black mb-20 relative">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 md:mb-12 gap-6 border-b-2 border-black pb-8">
        <div>
          <h2 className="text-3xl md:text-4xl italic tracking-tighter">Slava <span className="text-zinc-300">/ Profiles</span></h2>
          <p className="text-[10px] tracking-[0.3em] text-zinc-400 mt-2">Active Members: {users.length}</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          {/* زرار الـ Broadcast الحقيقي */}
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex-1 md:flex-none bg-black text-white px-4 py-3 flex items-center justify-center gap-2 hover:bg-zinc-800 transition-all text-xs md:text-sm"
          >
            <Mail size={16} /> Broadcast
          </button>
          <button onClick={copyAllEmails} className="flex-1 md:flex-none border-2 border-black px-4 py-3 flex items-center justify-center gap-2 hover:bg-zinc-50 transition-all text-xs md:text-sm">
            {copied ? <CheckCircle size={16} className="text-green-600" /> : <Copy size={16} />} {copied ? 'Done' : 'Emails'}
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative mb-8">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={20} />
        <input 
          type="text" 
          placeholder="Search profiles..." 
          className="w-full pl-12 pr-4 py-4 border-2 border-black outline-none focus:bg-zinc-50 font-bold text-sm md:text-base"
          value={searchTerm} 
          onChange={(e) => setSearchTerm(e.target.value)} 
        />
      </div>

      {/* Modal - Broadcast UI */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white border-4 border-black w-full max-w-xl p-6 shadow-[10px_10px_0px_0px_rgba(255,255,255,1)]">
            <div className="flex justify-between items-center mb-6 border-b-2 border-black pb-4">
              <h3 className="text-2xl italic tracking-tighter">New Broadcast</h3>
              <button onClick={() => setIsModalOpen(false)} className="hover:rotate-90 transition-transform"><X size={24}/></button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-[10px] tracking-widest block mb-2">Subject</label>
                <input 
                  type="text" 
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  placeholder="Enter email subject..." 
                  className="w-full p-3 border-2 border-black outline-none font-bold placeholder:text-zinc-300"
                />
              </div>
              <div>
                <label className="text-[10px] tracking-widest block mb-2">Message</label>
                <textarea 
                  rows="5"
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  placeholder="Write your message here..." 
                  className="w-full p-3 border-2 border-black outline-none font-bold placeholder:text-zinc-300 resize-none"
                ></textarea>
              </div>
              <button 
                onClick={handleBroadcast}
                className="w-full bg-black text-white py-4 flex items-center justify-center gap-2 hover:bg-zinc-800 transition-all font-black italic tracking-wider"
              >
                <Send size={18} /> Send to {users.length} Members
              </button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin" size={40} /></div>
      ) : (
        <>
          {/* Desktop Table View - Hidden on mobile */}
          <div className="hidden md:block overflow-hidden border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <table className="w-full text-left">
              <thead className="bg-black text-white text-[10px] tracking-[0.2em]">
                <tr>
                  <th className="p-5">User</th>
                  <th className="p-5">Contact</th>
                  <th className="p-5">Location</th>
                  <th className="p-5">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b border-black/5 hover:bg-zinc-50 transition-colors">
                    <td className="p-5 font-black italic">
                      {user.full_name || 'Anonymous'}
                      <div className="text-[9px] text-zinc-400 normal-case font-medium uppercase mt-1">
                        {user.updated_at ? new Date(user.updated_at).toLocaleDateString() : 'N/A'}
                      </div>
                    </td>
                    <td className="p-5">
                      <div className="lowercase font-bold text-sm truncate max-w-[200px]">{user.email || 'N/A'}</div>
                      <div className="text-[10px] text-zinc-400 flex items-center gap-1 mt-1"><Phone size={10}/> {user.phone || 'No Phone'}</div>
                    </td>
                    <td className="p-5 text-zinc-500 text-xs">
                      <div className="flex items-center gap-1 truncate max-w-[150px]"><MapPin size={12}/> {user.address || 'Not Set'}</div>
                    </td>
                    <td className="p-5">
                      {user.is_admin ? (
                        <span className="bg-red-600 text-white text-[9px] px-2 py-1 flex items-center gap-1 w-fit">
                          <Shield size={10}/> ADMIN
                        </span>
                      ) : (
                        <span className="text-zinc-300 text-[9px]">MEMBER</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View - Hidden on desktop */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {filteredUsers.map((user) => (
              <div key={user.id} className="border-2 border-black p-4 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-3">
                <div className="flex justify-between items-start border-b border-black/5 pb-2">
                  <div>
                    <h3 className="font-black italic text-lg">{user.full_name || 'Anonymous'}</h3>
                    <p className="text-[9px] text-zinc-400 normal-case">{user.updated_at ? new Date(user.updated_at).toLocaleDateString() : ''}</p>
                  </div>
                  {user.is_admin && (
                    <span className="bg-red-600 text-white text-[8px] px-2 py-1 flex items-center gap-1 font-black">
                      <Shield size={10}/> ADMIN
                    </span>
                  )}
                </div>
                
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs lowercase font-bold"><Mail size={12} className="text-zinc-400"/> {user.email}</div>
                  <div className="flex items-center gap-2 text-xs font-bold"><Phone size={12} className="text-zinc-400"/> {user.phone || 'No Phone'}</div>
                  <div className="flex items-center gap-2 text-[11px] text-zinc-500 font-bold"><MapPin size={12} className="text-zinc-400"/> {user.address || 'Address Not Set'}</div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default UsersPage;