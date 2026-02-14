import React, { useState } from 'react';
import { Award, ShieldCheck, CreditCard, BookOpen, Edit3, Save, X, Loader2, GraduationCap, Target } from 'lucide-react';
import { supabase } from '../src/lib/supabase';
import { User, ExamPackage } from '../types';
import { MOCK_EXAM_PACKAGES } from '../constants';

interface ProfileProps {
  user: User | null;
  packages: ExamPackage[];
  onUpdateUser: (updatedUser: User) => void;
}

const Profile: React.FC<ProfileProps> = ({ user, packages, onUpdateUser }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [school, setSchool] = useState(user?.school || '');
  const [targetPtn, setTargetPtn] = useState(user?.targetPtn || '');
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    if (!user) return;
    setIsLoading(true);
    const { error } = await supabase
      .from('profiles')
      .update({ school: school, target_ptn: targetPtn })
      .eq('id', user.id);

    if (!error) {
      onUpdateUser({ ...user, school, targetPtn });
      setIsEditing(false);
    } else {
      alert("Gagal mengupdate profil: " + error.message);
    }
    setIsLoading(false);
  };

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-4xl mx-auto pb-24 animate-fade-in">
       <div className="bg-white p-8 md:p-12 rounded-[3rem] shadow-xl border border-slate-100 relative overflow-hidden">
          <div className="absolute top-6 right-6">
             {!isEditing ? (
                <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-xl text-sm font-bold hover:bg-blue-600 hover:text-white transition-all">
                   <Edit3 size={16} /> Edit Profil
                </button>
             ) : (
                <button onClick={() => setIsEditing(false)} className="flex items-center gap-2 bg-slate-100 text-slate-500 px-4 py-2 rounded-xl text-sm font-bold hover:bg-slate-200 transition-all">
                   <X size={16} /> Batal
                </button>
             )}
          </div>

          <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-600 border-4 border-white shadow-lg relative z-10">
             <Award size={48} />
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-slate-800 mb-2 text-center">{user?.name}</h2>
          <p className="text-slate-500 mb-10 text-sm md:text-base text-center">{user?.email}</p>

          {isEditing ? (
             <div className="max-w-md mx-auto space-y-4 bg-slate-50 p-6 rounded-3xl border border-slate-100">
                <div>
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-2"><GraduationCap size={14}/> Asal Sekolah</label>
                   <input type="text" value={school} onChange={(e) => setSchool(e.target.value)} className="w-full p-4 rounded-xl bg-white border border-slate-200 outline-none focus:ring-2 ring-blue-100 transition-all text-sm font-bold text-slate-700" placeholder="Contoh: SMAN 1 Jakarta" />
                </div>
                <div>
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-2"><Target size={14}/> PTN & Jurusan Impian</label>
                   <input type="text" value={targetPtn} onChange={(e) => setTargetPtn(e.target.value)} className="w-full p-4 rounded-xl bg-white border border-slate-200 outline-none focus:ring-2 ring-blue-100 transition-all text-sm font-bold text-slate-700" placeholder="Contoh: Kedokteran UGM" />
                </div>
                <button onClick={handleSave} disabled={isLoading} className="w-full py-4 bg-[#1e3a8a] text-white rounded-xl font-black shadow-lg shadow-blue-100 flex items-center justify-center gap-2 mt-4 hover:bg-blue-800 transition-all">
                   {isLoading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />} Simpan Perubahan
                </button>
             </div>
          ) : (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                <div className="p-5 bg-slate-50 rounded-2xl flex flex-col justify-center items-center text-center border border-slate-100">
                   <span className="font-bold text-slate-400 text-[10px] uppercase tracking-widest mb-1 flex items-center gap-1"><GraduationCap size={12}/> ASAL SEKOLAH</span>
                   <span className="font-black text-slate-700 text-sm">{user?.school || 'Belum Diatur'}</span>
                </div>
                <div className="p-5 bg-emerald-50 rounded-2xl flex flex-col justify-center items-center text-center border border-emerald-100">
                   <span className="font-bold text-emerald-400 text-[10px] uppercase tracking-widest mb-1 flex items-center gap-1"><Target size={12}/> PTN IMPIAN</span>
                   <span className="font-black text-emerald-600 text-sm">{user?.targetPtn || 'Belum Diatur'}</span>
                </div>
             </div>
          )}
       </div>

       {/* Riwayat Pembelian (Dipindah dari App.tsx) */}
       <div className="bg-white p-8 md:p-10 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-3">
             <CreditCard className="text-[#1e3a8a]" /> Riwayat Pembelian
          </h3>
          <div className="space-y-4">
             {user?.ownedPackages?.length ? user.ownedPackages.map(pkgId => {
               const pkg = packages.find(p => p.id === pkgId) || MOCK_EXAM_PACKAGES.find(p => p.id === pkgId);
               if (!pkg) return null;
               return (
                 <div key={pkgId} className="flex justify-between items-center p-5 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-[#1e3a8a] shadow-sm">
                          <BookOpen size={20} />
                       </div>
                       <div>
                          <p className="font-black text-slate-700 text-sm md:text-base">{pkg.title}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase">Status: <span className="text-emerald-500">Aktif</span></p>
                       </div>
                    </div>
                    <div className="text-right">
                       <p className="font-black text-emerald-500 text-sm md:text-lg">Berhasil</p>
                       <p className="text-[10px] font-bold text-slate-400">Rp {pkg.price.toLocaleString()}</p>
                    </div>
                 </div>
               );
             }) : (
               <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-3xl">
                  <p className="text-slate-400 font-medium">Belum ada transaksi.</p>
               </div>
             )}
          </div>
       </div>
    </div>
  );
};

export default Profile;