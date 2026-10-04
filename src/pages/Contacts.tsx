import { useState, useEffect } from 'react';
import { UserPlus, Trash2, ShieldCheck, X, CheckCircle2, Loader2 } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

interface Contact {
  id: string | number;
  name: string;
  relation: string;
  phone: string;
  priority: number;
  methods: string[];
}

const DEFAULT_CONTACTS: Contact[] = [
  { id: '1', name: 'Mom (Sarah)', relation: 'Primary Family', phone: '+1 (555) 012-3456', priority: 1, methods: ['SMS', 'Call'] },
  { id: '2', name: 'Dad (David)', relation: 'Secondary Family', phone: '+1 (555) 012-3457', priority: 2, methods: ['SMS'] },
  { id: '3', name: 'Dr. Emily Watson', relation: 'Physician / Medical', phone: '+1 (555) 012-3458', priority: 3, methods: ['SMS', 'Push'] },
];

export default function Contacts() {
  const { user } = useAuth();
  const isConfigured = isSupabaseConfigured();
  const [contacts, setContacts] = useState<Contact[]>(DEFAULT_CONTACTS);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newContact, setNewContact] = useState({ name: '', relation: 'Family', phone: '' });

  // Fetch contacts from Supabase
  useEffect(() => {
    async function loadContacts() {
      if (!isConfigured || !user) return;
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('emergency_contacts')
          .select('*')
          .eq('user_id', user.id)
          .order('priority', { ascending: true });

        if (error) {
          console.warn('Error fetching Supabase contacts:', error.message);
        } else if (data && data.length > 0) {
          setContacts(data.map(item => ({
            id: item.id,
            name: item.name,
            relation: item.relation || 'Family',
            phone: item.phone,
            priority: item.priority || 1,
            methods: item.methods || ['SMS', 'Call']
          })));
        }
      } catch (err) {
        console.error('Failed to load contacts:', err);
      } finally {
        setLoading(false);
      }
    }

    loadContacts();
  }, [user, isConfigured]);

  const handleAddContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContact.name || !newContact.phone) return;
    
    if (isConfigured && user) {
      try {
        const { data, error } = await supabase
          .from('emergency_contacts')
          .insert({
            user_id: user.id,
            name: newContact.name,
            relation: newContact.relation,
            phone: newContact.phone,
            priority: contacts.length + 1,
            methods: ['SMS', 'Call']
          })
          .select()
          .single();

        if (!error && data) {
          setContacts(prev => [...prev, {
            id: data.id,
            name: data.name,
            relation: data.relation,
            phone: data.phone,
            priority: data.priority,
            methods: data.methods || ['SMS', 'Call']
          }]);
        }
      } catch (err) {
        console.error('Error inserting contact into Supabase:', err);
      }
    } else {
      // Local fallback
      const newId = String(Date.now());
      setContacts([...contacts, {
        id: newId,
        name: newContact.name,
        relation: newContact.relation,
        phone: newContact.phone,
        priority: contacts.length + 1,
        methods: ['SMS', 'Call']
      }]);
    }
    
    setNewContact({ name: '', relation: 'Family', phone: '' });
    setShowAddModal(false);
  };

  const handleDeleteContact = async (id: string | number) => {
    if (isConfigured && typeof id === 'string' && id.length > 10) {
      try {
        await supabase
          .from('emergency_contacts')
          .delete()
          .eq('id', id);
      } catch (err) {
        console.error('Error deleting contact from Supabase:', err);
      }
    }
    setContacts(contacts.filter(c => c.id !== id));
  };

  return (
    <div className="flex flex-col gap-6 animate-in slide-in-from-bottom-4 duration-500 pb-24 h-full relative">
      {/* Header Card */}
      <div className="bg-white p-6 md:p-8 rounded-3xl border border-stone-200/90 shadow-[4px_4px_0px_0px_rgba(28,25,23,0.06)] flex justify-between items-center">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full inline-block">
              Emergency Network
            </span>
            {isConfigured ? (
              <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                {loading ? <Loader2 className="w-3 h-3 animate-spin text-emerald-600" /> : <CheckCircle2 className="w-3 h-3 text-emerald-600" />} Supabase Synced
              </span>
            ) : (
              <span className="text-[10px] font-mono text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                Local Prototype Mode
              </span>
            )}
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-stone-900 tracking-tight font-sans">
            Trusted Emergency Contacts
          </h2>
          <p className="text-stone-500 text-xs md:text-sm mt-1">
            Notified instantly with your live location coordinates during an alert.
          </p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="w-12 h-12 bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/30 rounded-2xl flex items-center justify-center transition-all hover:scale-105 cursor-pointer shrink-0"
          title="Add Contact"
        >
          <UserPlus className="w-5 h-5" />
        </button>
      </div>

      {/* Info Callout */}
      <div className="bg-amber-50/70 border border-amber-200/90 p-4 rounded-2xl flex items-start gap-3.5 text-amber-900 shadow-xs">
        <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-xs leading-relaxed">
          <span className="font-bold block mb-0.5">Automated Dispatch Sequence</span>
          Contacts are dialed and messaged in order of priority. If Contact 1 does not confirm receipt within 30 seconds, Contact 2 is immediately escalated.
        </div>
      </div>

      {/* Contacts List */}
      <div className="flex flex-col gap-3.5">
        {contacts.map((contact, index) => (
          <div 
            key={contact.id} 
            className="p-5 rounded-3xl bg-white border border-stone-200/90 shadow-[3px_3px_0px_0px_rgba(28,25,23,0.05)] hover:border-red-200 transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#f8f7f4] border border-stone-200 flex items-center justify-center text-stone-700 font-bold font-mono text-base shrink-0">
                #{index + 1}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-stone-900 text-base">{contact.name}</h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 font-semibold">
                    {contact.relation}
                  </span>
                </div>
                <p className="text-xs text-stone-500 font-mono mt-0.5">{contact.phone}</p>
              </div>
            </div>

            <div className="flex items-center justify-between w-full sm:w-auto gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-100">
              <div className="flex items-center gap-1.5">
                {contact.methods.map((method, idx) => (
                  <span 
                    key={idx} 
                    className="text-[10px] font-mono font-bold px-2 py-1 rounded-md bg-red-50 text-red-700 border border-red-100"
                  >
                    {method}
                  </span>
                ))}
              </div>
              
              <button 
                onClick={() => handleDeleteContact(contact.id)}
                className="p-2 text-stone-400 hover:text-red-600 rounded-xl hover:bg-red-50 transition-colors cursor-pointer"
                title="Remove Contact"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Contact Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full border border-stone-200 shadow-2xl space-y-6">
            <div className="flex justify-between items-center pb-3 border-b border-stone-100">
              <h3 className="text-xl font-bold text-stone-900 font-sans">Add Trusted Contact</h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddContact} className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-stone-600 block mb-1.5">
                  Full Name
                </label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. John Doe"
                  value={newContact.name}
                  onChange={e => setNewContact({...newContact, name: e.target.value})}
                  className="w-full bg-[#f8f7f4] border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-stone-600 block mb-1.5">
                  Relationship
                </label>
                <select 
                  value={newContact.relation}
                  onChange={e => setNewContact({...newContact, relation: e.target.value})}
                  className="w-full bg-[#f8f7f4] border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white"
                >
                  <option value="Family">Family Member</option>
                  <option value="Doctor">Doctor / Caregiver</option>
                  <option value="Friend">Trusted Friend</option>
                  <option value="Neighbor">Neighbor</option>
                  <option value="Work">Colleague</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-stone-600 block mb-1.5">
                  Phone Number
                </label>
                <input 
                  type="tel" 
                  required
                  placeholder="+1 (555) 000-0000"
                  value={newContact.phone}
                  onChange={e => setNewContact({...newContact, phone: e.target.value})}
                  className="w-full bg-[#f8f7f4] border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-3 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-xl text-sm transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-sm transition-colors shadow-md shadow-red-600/30 cursor-pointer"
                >
                  Save Contact
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
