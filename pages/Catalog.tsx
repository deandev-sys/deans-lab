import React, { useState } from 'react';
import { ExamPackage } from '../types';
import { ShoppingCart, CheckCircle, Zap, ShieldAlert, Award, TrendingUp, Filter, BookOpen, AlertTriangle, X, ExternalLink, ArrowRight, Loader2, Crown } from 'lucide-react';

interface CatalogProps {
  user: any;
  packages: ExamPackage[]; 
  onStartExam: (pkg: ExamPackage) => void;
  onBuyPackage: (pkgId: string) => void; 
}

// --- DATA REFERENSI KATEGORI ---
const SUBJECT_TOPICS: Record<string, string[]> = {
  'Penalaran Umum': ['Campuran', 'Penalaran Induktif', 'Penalaran Deduktif', 'Penalaran Kuantitatif'],
  'Pengetahuan Kuantitatif': ['Campuran', 'Bilangan', 'Aljabar & Fungsi', 'Geometri', 'Statistika & Peluang'],
  'PPU': ['Campuran', 'Ide Pokok & Kesimpulan', 'Kepaduan Paragraf', 'Makna Kata'],
  'PBM': ['Campuran', 'Ejaan (PUEBI)', 'Tanda Baca', 'Kalimat Efektif'],
  'Literasi Bahasa Indonesia': ['Campuran', 'Teks Sastra', 'Teks Informasi'],
  'Literasi Bahasa Inggris': ['Campuran', 'Main Idea', 'Detail Information', 'Vocabulary in Context'],
  'Penalaran Matematika': ['Campuran', 'Aritmatika Sosial', 'Geometri Aplikatif', 'Data & Ketidakpastian']
};

const Catalog: React.FC<CatalogProps> = ({ user, packages, onStartExam, onBuyPackage }) => {
  // State untuk Modal Pembelian Baru
  const [selectedPackageForBuy, setSelectedPackageForBuy] = useState<ExamPackage | null>(null);
  const [claimingId, setClaimingId] = useState<string | null>(null); 
  
  // --- STATE FILTER ---
  const [activeTab, setActiveTab] = useState<'FULL' | 'MINI'>('FULL');
  const [selectedSubject, setSelectedSubject] = useState('Semua');
  const [selectedTopic, setSelectedTopic] = useState('Semua');

  // --- LOGIKA FILTER PINTAR ---
  const filteredPackages = packages.filter(pkg => {
    // 1. Filter berdasarkan Tab (FULL vs MINI)
    if (pkg.packageType !== activeTab && pkg.packageType) return false;
    
    // Fallback untuk paket lama yang belum punya tipe (dianggap FULL)
    if (!pkg.packageType && activeTab === 'MINI') return false;

    // 2. Filter Lanjutan Khusus MINI
    if (activeTab === 'MINI') {
      if (selectedSubject !== 'Semua' && pkg.subject !== selectedSubject) return false;
      if (selectedTopic !== 'Semua' && pkg.topic !== selectedTopic) return false;
    }

    return true;
  });

  // --- LOGIKA CERDAS TOMBOL BELI ---
  const handlePackageClick = async (pkg: ExamPackage) => {
    if (pkg.price === 0) {
        // JIKA GRATIS: Langsung klaim (Auto-Buy)
        if (window.confirm(`Yakin ingin mengambil paket gratis "${pkg.title}"?`)) {
            setClaimingId(pkg.id);
            await onBuyPackage(pkg.id); 
            setClaimingId(null);
        }
    } else {
        // JIKA BAYAR: Buka Modal Instruksi Lynk.id
        setSelectedPackageForBuy(pkg);
    }
  };

  // Handler untuk membuka Lynk.id (Khusus Berbayar)
  const handleProceedToLynk = () => {
    if (selectedPackageForBuy?.lynkUrl) {
      window.open(selectedPackageForBuy.lynkUrl, '_blank');
    } else {
      alert("Link pembelian belum tersedia untuk paket ini. Hubungi admin.");
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto pb-24 animate-fade-in">
      <header className="mb-8 md:mb-10">
        <h1 className="text-3xl font-black text-[#1e3a8a]">Katalog Try Out 📚</h1>
        <p className="text-slate-500 mt-1">Pilih amunisi yang tepat untuk melatih kemampuanmu.</p>
      </header>

      {/* --- UI TAB PEMILIH JENIS TO --- */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <button 
          onClick={() => { setActiveTab('FULL'); setSelectedSubject('Semua'); setSelectedTopic('Semua'); }} 
          className={`flex-1 p-5 rounded-[2rem] border-2 transition-all flex flex-col md:flex-row items-center justify-center gap-3 md:gap-4 group ${activeTab === 'FULL' ? 'border-[#1e3a8a] bg-blue-50/50 shadow-xl shadow-blue-100' : 'border-slate-100 bg-white hover:border-blue-200'}`}
        >
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${activeTab === 'FULL' ? 'bg-[#1e3a8a] text-white' : 'bg-slate-50 text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500'}`}>
             <Award size={24} />
          </div>
          <div className="text-center md:text-left">
             <h3 className={`font-black text-lg ${activeTab === 'FULL' ? 'text-[#1e3a8a]' : 'text-slate-600'}`}>Simulasi SNBT (FULL)</h3>
             <p className="text-xs font-bold text-slate-400 mt-0.5">7 Subtes Lengkap + IRT</p>
          </div>
        </button>

        <button 
          onClick={() => setActiveTab('MINI')} 
          className={`flex-1 p-5 rounded-[2rem] border-2 transition-all flex flex-col md:flex-row items-center justify-center gap-3 md:gap-4 group ${activeTab === 'MINI' ? 'border-emerald-500 bg-emerald-50/50 shadow-xl shadow-emerald-100' : 'border-slate-100 bg-white hover:border-emerald-200'}`}
        >
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${activeTab === 'MINI' ? 'bg-emerald-500 text-white' : 'bg-slate-50 text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-500'}`}>
             <TrendingUp size={24} />
          </div>
          <div className="text-center md:text-left">
             <h3 className={`font-black text-lg ${activeTab === 'MINI' ? 'text-emerald-600' : 'text-slate-600'}`}>Drilling Subtes (MINI)</h3>
             <p className="text-xs font-bold text-slate-400 mt-0.5">Fokus 1 Mapel & Bab Spesifik</p>
          </div>
        </button>
      </div>

      {/* --- UI FILTER KHUSUS MINI TO --- */}
      {activeTab === 'MINI' && (
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm mb-8 animate-pop-in space-y-6">
          <div className="flex items-center gap-2 text-slate-800 font-black">
             <Filter size={20} className="text-emerald-500" /> Filter Materi
          </div>
          
          <div className="space-y-4">
             <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">1. Pilih Mata Pelajaran</label>
                <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                   <button 
                      onClick={() => { setSelectedSubject('Semua'); setSelectedTopic('Semua'); }}
                      className={`shrink-0 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${selectedSubject === 'Semua' ? 'bg-emerald-500 text-white shadow-md' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
                   >
                      Semua Mapel
                   </button>
                   {Object.keys(SUBJECT_TOPICS).map(subj => (
                      <button 
                        key={subj}
                        onClick={() => { setSelectedSubject(subj); setSelectedTopic('Semua'); }}
                        className={`shrink-0 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${selectedSubject === subj ? 'bg-emerald-500 text-white shadow-md' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
                      >
                        {subj}
                      </button>
                   ))}
                </div>
             </div>

             {selectedSubject !== 'Semua' && (
                <div className="pt-2 animate-fade-in">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">2. Pilih Bab / Topik Spesifik</label>
                   <select 
                      value={selectedTopic}
                      onChange={(e) => setSelectedTopic(e.target.value)}
                      className="w-full md:max-w-xs p-4 rounded-xl bg-slate-50 border-none outline-none focus:ring-2 ring-emerald-200 text-sm font-bold text-slate-700 cursor-pointer"
                   >
                      <option value="Semua">Semua Bab di {selectedSubject}</option>
                      {SUBJECT_TOPICS[selectedSubject].map(topic => (
                         <option key={topic} value={topic}>{topic}</option>
                      ))}
                   </select>
                </div>
             )}
          </div>
        </div>
      )}

      {/* --- GRID KATALOG PAKET --- */}
      {filteredPackages.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {filteredPackages.map((pkg) => {
            // --- LOGIKA SAKTI DI SINI ---
            const isAdmin = user?.role === 'admin';
            const isOwned = user?.ownedPackages?.includes(pkg.id) || isAdmin; // Admin otomatis punya
            // ----------------------------
            
            const totalQuestions = pkg.subtests?.reduce((acc, s) => acc + (s.questions?.length || 0), 0) || 0;
            const isMini = pkg.packageType === 'MINI';
            const isFree = pkg.price === 0;

            return (
              <div key={pkg.id} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col group transition-all hover:shadow-2xl hover:-translate-y-2 relative">
                
                {/* Visual Badge Khusus Admin */}
                {isAdmin && !user?.ownedPackages?.includes(pkg.id) && (
                   <div className="absolute top-4 left-4 z-20 bg-purple-600 text-white px-3 py-1.5 rounded-xl text-[10px] font-black uppercase shadow-lg shadow-purple-200 flex items-center gap-1 animate-pulse">
                      <Crown size={12} className="fill-white" /> Admin Mode
                   </div>
                )}

                <div className={`h-48 relative p-8 flex flex-col justify-end overflow-hidden ${isMini ? 'bg-emerald-600' : 'bg-[#1e3a8a]'}`}>
                  {/* Decorative Background */}
                  <div className="absolute -right-10 -top-10 opacity-10">
                    <BookOpen size={150} />
                  </div>

                  {pkg.isPremium && (
                      <span className="absolute top-6 right-6 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase shadow-sm">
                        PREMIUM
                      </span>
                  )}
                  {isFree && (
                      <span className="absolute top-6 right-6 bg-white text-[#1e3a8a] px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase shadow-sm">
                        GRATIS
                      </span>
                  )}

                  {isMini && (
                    <div className="mb-2">
                       <span className="bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-lg text-xs font-bold inline-block mb-1">
                          {pkg.subject}
                       </span>
                    </div>
                  )}
                  
                  <h3 className="text-white text-xl md:text-2xl font-black leading-tight relative z-10">{pkg.title}</h3>
                  <p className={`text-sm mt-1 font-medium ${isMini ? 'text-emerald-100' : 'text-blue-200'} relative z-10`}>
                    {isMini ? pkg.topic : `${pkg.subtests?.length || 0} Subtes`} • {totalQuestions} Soal
                  </p>
                </div>
                
                <div className="p-6 md:p-8 flex-1 flex flex-col bg-white relative z-20 -mt-4 rounded-t-[2rem]">
                  <div className="space-y-3 mb-8">
                    <div className="flex items-center gap-3 text-slate-600 text-sm font-medium">
                      <CheckCircle size={18} className={isMini ? "text-emerald-500" : "text-blue-500"} />
                      <span>{isMini ? 'Fokus 1 Subtes Spesifik' : 'Sistem Penilaian IRT'}</span>
                    </div>
                    <div className="flex items-center gap-3 text-slate-600 text-sm font-medium">
                      <CheckCircle size={18} className={isMini ? "text-emerald-500" : "text-blue-500"} />
                      <span>Timer Akurat Terkunci</span>
                    </div>
                    {pkg.isPremium && (
                      <div className="flex items-center gap-3 text-slate-800 text-sm font-bold">
                         <Zap size={18} className="text-yellow-500 fill-yellow-500" />
                         <span>Pembahasan Eksklusif</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-auto pt-4 border-t border-slate-100">
                      {isOwned ? (
                        <button
                           onClick={() => onStartExam(pkg)}
                           className={`w-full py-4 text-white rounded-2xl font-black shadow-lg transition-all uppercase tracking-widest text-sm flex items-center justify-center gap-2 ${isAdmin ? 'bg-purple-600 hover:bg-purple-700 shadow-purple-200' : (isMini ? 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-200' : 'bg-[#1e3a8a] hover:bg-blue-800 shadow-blue-200')}`}
                        >
                           {isAdmin ? (
                             <><Crown size={18} className="fill-white" /> AKSES ADMIN</>
                           ) : 'MULAI KERJAKAN'}
                        </button>
                      ) : (
                        <button
                           onClick={() => handlePackageClick(pkg)}
                           disabled={claimingId === pkg.id}
                           className={`w-full py-4 border-2 rounded-2xl font-black transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-sm ${isMini ? 'border-emerald-500 text-emerald-600 hover:bg-emerald-500 hover:text-white' : 'border-[#1e3a8a] text-[#1e3a8a] hover:bg-[#1e3a8a] hover:text-white'}`}
                        >
                           {claimingId === pkg.id ? (
                               <Loader2 className="animate-spin" />
                           ) : (
                               <>
                                <ShoppingCart size={18} />
                                {isFree ? 'KLAIM GRATIS' : `BELI Rp ${pkg.price.toLocaleString()}`}
                               </>
                           )}
                        </button>
                      )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white p-12 rounded-[3rem] border-2 border-dashed border-slate-200 text-center animate-fade-in">
           <div className="bg-slate-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
              <BookOpen size={40} />
           </div>
           <h3 className="text-2xl font-black text-slate-700 mb-2">Paket Belum Tersedia</h3>
           <p className="text-slate-500 max-w-md mx-auto">Admin belum menambahkan paket untuk kategori atau materi ini. Coba pilih materi yang lain!</p>
           <button onClick={() => { setActiveTab('FULL'); setSelectedSubject('Semua'); setSelectedTopic('Semua'); }} className="mt-8 px-8 py-3 bg-[#1e3a8a] text-white rounded-2xl font-black hover:bg-blue-800 transition-all shadow-lg shadow-blue-100">
              Lihat Semua Paket
           </button>
        </div>
      )}

      {/* --- MODAL INSTRUKSI LYNK.ID (Hanya muncul jika paket berbayar) --- */}
      {selectedPackageForBuy && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 md:p-6">
           <div className="bg-white rounded-[2.5rem] max-w-md w-full p-8 shadow-2xl animate-pop-in relative overflow-hidden">
              <button onClick={() => setSelectedPackageForBuy(null)} className="absolute top-6 right-6 text-slate-300 hover:text-slate-800 transition-colors bg-slate-50 p-2 rounded-full"><X size={24}/></button>
              
              <div className="absolute top-0 left-0 w-full h-3 bg-gradient-to-r from-yellow-400 to-orange-500"></div>

              <div className="text-center mb-8 mt-4">
                 <div className="w-20 h-20 bg-yellow-50 border-2 border-yellow-100 text-yellow-600 rounded-[2rem] flex items-center justify-center mx-auto mb-6 animate-bounce shadow-sm">
                    <AlertTriangle size={40} />
                 </div>
                 <h2 className="text-2xl font-black text-[#1e3a8a] mb-2">PENTING BANGET! ⚠️</h2>
                 <p className="text-slate-500 text-sm leading-relaxed px-4">
                   Agar paket otomatis terbuka dalam 5 detik, pastikan kamu menggunakan email ini saat checkout:
                 </p>
              </div>

              <div className="bg-slate-50 p-6 rounded-3xl border-2 border-slate-100 mb-8 text-center relative overflow-hidden">
                 <div className="absolute top-0 left-0 w-1 h-full bg-[#1e3a8a]"></div>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">EMAIL AKUN KAMU</p>
                 <p className="text-lg font-black text-slate-800 break-all">{user?.email || "Email tidak terdeteksi"}</p>
              </div>

              <div className="space-y-3">
                <button 
                  onClick={handleProceedToLynk}
                  className="w-full py-5 bg-[#1e3a8a] text-white rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-blue-800 transition-all shadow-xl shadow-blue-200 flex items-center justify-center gap-3 group"
                >
                  BELI SEKARANG <ExternalLink size={18} className="group-hover:translate-x-1 transition-transform"/>
                </button>
                
                <div className="flex items-center justify-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-4">
                   <ShieldAlert size={12} />
                   Transaksi Aman via Lynk.id
                </div>
              </div>
           </div>
        </div>
      )}

    </div>
  );
};

export default Catalog;