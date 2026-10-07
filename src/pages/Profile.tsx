import { useState, useEffect } from 'react';
import { User, Activity, AlertCircle, CheckCircle2, Edit3, X, Save, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface MedicalData {
  blood_group: string;
  age: number;
  organ_donor: boolean;
  allergies: string[];
  medical_conditions: string;
  paramedic_instructions: string;
}

const DEFAULT_MEDICAL: MedicalData = {
  blood_group: 'O- Positive',
  age: 29,
  organ_donor: true,
  allergies: ['Penicillin (Severe)', 'Latex'],
  medical_conditions: 'Mild Asthma, carries rescue inhaler (Albuterol) in backpack front pocket. Type 1 Diabetic (insulin dependent).',
  paramedic_instructions: 'If unresponsive, check blood glucose meter in jacket pocket. Primary contact Sarah is authorized to give full medical consent on my behalf.'
};

export default function Profile() {
  const { user } = useAuth();
  const isConfigured = isSupabaseConfigured();

  // Try to load from localStorage first for prototype mode persistence
  const getInitialMedical = () => {
    try {
      const saved = localStorage.getItem('aea_medical_profile');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return DEFAULT_MEDICAL;
  };

  const getInitialName = () => localStorage.getItem('aea_full_name') || 'Alex Morgan';
  const getInitialPhone = () => localStorage.getItem('aea_phone') || '+1 (555) 234-5678';

  const [medical, setMedical] = useState<MedicalData>(getInitialMedical);
  const [fullName, setFullName] = useState(getInitialName);
  const [phone, setPhone] = useState(getInitialPhone);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<MedicalData>(medical);
  const [editName, setEditName] = useState(fullName);
  const [editPhone, setEditPhone] = useState(phone);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Fetch Supabase Profile and Medical Card
  useEffect(() => {
    async function loadProfile() {
      if (!isConfigured || !user) return;
      setLoading(true);
      try {
        // Fetch profile
        const { data: profData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profData) {
          if (profData.full_name) setFullName(profData.full_name);
          if (profData.phone) setPhone(profData.phone);
        }

        // Fetch medical card
        const { data: medData } = await supabase
          .from('medical_cards')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (medData) {
          setMedical({
            blood_group: medData.blood_group || 'O- Positive',
            age: medData.age || 29,
            organ_donor: medData.organ_donor ?? true,
            allergies: medData.allergies || ['Penicillin (Severe)'],
            medical_conditions: medData.medical_conditions || '',
            paramedic_instructions: medData.paramedic_instructions || ''
          });
        }
      } catch (err) {
        console.error('Error fetching medical record:', err);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [user, isConfigured]);

  const openEditModal = () => {
    setEditForm({ ...medical });
    setEditName(fullName);
    setEditPhone(phone);
    setIsEditing(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    if (isConfigured && user) {
      try {
        // Save profile
        await supabase
          .from('profiles')
          .update({
            full_name: editName,
            phone: editPhone,
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id);

        // Save medical card
        await supabase
          .from('medical_cards')
          .upsert({
            user_id: user.id,
            blood_group: editForm.blood_group,
            age: editForm.age,
            organ_donor: editForm.organ_donor,
            allergies: editForm.allergies,
            medical_conditions: editForm.medical_conditions,
            paramedic_instructions: editForm.paramedic_instructions,
            updated_at: new Date().toISOString()
          });

        setFullName(editName);
        setPhone(editPhone);
        setMedical(editForm);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } catch (err) {
        console.error('Error updating medical profile:', err);
      }
    } else {
      // Local fallback with localStorage persistence
      setFullName(editName);
      setPhone(editPhone);
      setMedical(editForm);
      localStorage.setItem('aea_medical_profile', JSON.stringify(editForm));
      localStorage.setItem('aea_full_name', editName);
      localStorage.setItem('aea_phone', editPhone);
      
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }

    // Mark profile as setup so we don't prompt them again
    localStorage.setItem('aea_profile_setup_complete', 'true');

    setSaving(false);
    setIsEditing(false);
  };

  return (
    <div className="flex flex-col gap-6 animate-in slide-in-from-bottom-4 duration-500 pb-24">
      {/* Header Card */}
      <div className="bg-white p-6 md:p-8 rounded-3xl border border-stone-200/90 shadow-[4px_4px_0px_0px_rgba(28,25,23,0.06)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-red-50 text-red-600 rounded-2xl border border-red-200 flex items-center justify-center shrink-0">
            <User className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full inline-block">
                Registered Subscriber
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
            <h2 className="text-2xl font-black text-stone-900 tracking-tight font-sans">{fullName}</h2>
            <p className="text-stone-500 text-xs font-mono">{user?.email || 'alex.morgan@example.com'} • {phone}</p>
          </div>
        </div>

        <button
          onClick={openEditModal}
          className="self-start sm:self-center px-4 py-2.5 bg-[#f8f7f4] hover:bg-stone-100 text-stone-800 border border-stone-200 rounded-2xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-xs"
        >
          <Edit3 className="w-4 h-4 text-stone-600" /> Edit Directives
        </button>
      </div>

      {saveSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-mono flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          Medical record successfully updated in database.
        </div>
      )}

      {/* Advisory */}
      <div className="bg-amber-50/70 border border-amber-200/90 p-4 rounded-2xl flex items-start gap-3.5 text-amber-900 shadow-xs">
        <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-xs leading-relaxed">
          <span className="font-bold block mb-0.5">Encrypted Medical Emergency Card</span>
          The information below is securely packaged and broadcasted to emergency responders only during an active SOS event to expedite medical care.
        </div>
      </div>

      {/* Emergency Medical Profile */}
      <div className="bg-white rounded-3xl overflow-hidden border border-stone-200/90 shadow-[4px_4px_0px_0px_rgba(28,25,23,0.06)]">
        <div className="p-4 md:px-6 bg-[#f8f7f4] border-b border-stone-200/80 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-stone-800 text-sm">
            <Activity className="w-4 h-4 text-red-600" />
            <span>Critical Medical Directives</span>
          </div>
          <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
            ● Active Record
          </span>
        </div>

        <div className="p-6 grid gap-5 text-xs">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-[#f8f7f4] p-3.5 rounded-2xl border border-stone-200/80">
              <span className="text-[10px] font-mono uppercase text-stone-500 font-bold block mb-1">Blood Group</span>
              <span className="text-xl font-mono font-black text-red-600 block">{medical.blood_group}</span>
            </div>
            <div className="bg-[#f8f7f4] p-3.5 rounded-2xl border border-stone-200/80">
              <span className="text-[10px] font-mono uppercase text-stone-500 font-bold block mb-1">Age</span>
              <span className="text-xl font-mono font-black text-stone-900 block">{medical.age}</span>
            </div>
            <div className="bg-[#f8f7f4] p-3.5 rounded-2xl border border-stone-200/80">
              <span className="text-[10px] font-mono uppercase text-stone-500 font-bold block mb-1">Organ Donor</span>
              <span className="text-xl font-mono font-black text-emerald-700 block">{medical.organ_donor ? 'Yes' : 'No'}</span>
            </div>
            <div className="bg-[#f8f7f4] p-3.5 rounded-2xl border border-stone-200/80">
              <span className="text-[10px] font-mono uppercase text-stone-500 font-bold block mb-1">Primary Language</span>
              <span className="text-xl font-mono font-black text-stone-900 block">English</span>
            </div>
          </div>

          <div>
            <span className="text-[10px] font-mono uppercase text-stone-500 font-bold block mb-1.5">Known Allergies</span>
            <div className="flex flex-wrap gap-2">
              {medical.allergies && medical.allergies.length > 0 ? (
                medical.allergies.map((alg, i) => (
                  <span key={i} className="px-3 py-1 rounded-xl bg-red-50 text-red-800 border border-red-200 font-mono font-semibold">
                    {alg}
                  </span>
                ))
              ) : (
                <span className="px-3 py-1 rounded-xl bg-stone-100 text-stone-600 border border-stone-200 font-mono">
                  No Known Allergies
                </span>
              )}
            </div>
          </div>

          <div>
            <span className="text-[10px] font-mono uppercase text-stone-500 font-bold block mb-1.5">Existing Medical Conditions</span>
            <div className="bg-[#f8f7f4] p-4 rounded-2xl border border-stone-200/80 text-stone-800 text-sm font-medium leading-relaxed">
              {medical.medical_conditions || 'None reported.'}
            </div>
          </div>

          <div>
            <span className="text-[10px] font-mono uppercase text-stone-500 font-bold block mb-1.5">Paramedic Emergency Protocol</span>
            <div className="bg-red-50/60 p-4 rounded-2xl border border-red-200/80 text-red-950 text-sm font-medium leading-relaxed">
              {medical.paramedic_instructions || 'Standard emergency protocols apply.'}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Directives Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-lg w-full border border-stone-200 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-3 border-b border-stone-100">
              <h3 className="text-xl font-bold text-stone-900 font-sans">Edit Medical Profile</h3>
              <button 
                onClick={() => setIsEditing(false)}
                className="p-1 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-stone-600 block mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    className="w-full bg-[#f8f7f4] border border-stone-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-stone-600 block mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={editPhone}
                    onChange={e => setEditPhone(e.target.value)}
                    className="w-full bg-[#f8f7f4] border border-stone-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-stone-600 block mb-1">
                    Blood Group
                  </label>
                  <select
                    value={editForm.blood_group}
                    onChange={e => setEditForm({ ...editForm, blood_group: e.target.value })}
                    className="w-full bg-[#f8f7f4] border border-stone-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="O- Positive">O- Positive</option>
                    <option value="O- Negative">O- Negative</option>
                    <option value="A- Positive">A- Positive</option>
                    <option value="A- Negative">A- Negative</option>
                    <option value="B- Positive">B- Positive</option>
                    <option value="B- Negative">B- Negative</option>
                    <option value="AB- Positive">AB- Positive</option>
                    <option value="AB- Negative">AB- Negative</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-stone-600 block mb-1">
                    Age
                  </label>
                  <input
                    type="number"
                    value={editForm.age}
                    onChange={e => setEditForm({ ...editForm, age: parseInt(e.target.value) || 0 })}
                    className="w-full bg-[#f8f7f4] border border-stone-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-stone-600 block mb-1">
                  Known Allergies (Comma separated)
                </label>
                <input
                  type="text"
                  value={editForm.allergies.join(', ')}
                  onChange={e => setEditForm({ ...editForm, allergies: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                  className="w-full bg-[#f8f7f4] border border-stone-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="e.g. Penicillin, Latex"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-stone-600 block mb-1">
                  Existing Medical Conditions
                </label>
                <textarea
                  rows={2}
                  value={editForm.medical_conditions}
                  onChange={e => setEditForm({ ...editForm, medical_conditions: e.target.value })}
                  className="w-full bg-[#f8f7f4] border border-stone-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-stone-600 block mb-1">
                  Paramedic Emergency Protocol
                </label>
                <textarea
                  rows={2}
                  value={editForm.paramedic_instructions}
                  onChange={e => setEditForm({ ...editForm, paramedic_instructions: e.target.value })}
                  className="w-full bg-[#f8f7f4] border border-stone-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="flex-1 py-3 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-xl text-sm transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-sm transition-colors shadow-md shadow-red-600/30 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save To Cloud
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
