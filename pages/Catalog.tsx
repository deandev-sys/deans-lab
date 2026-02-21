import React, { useState } from 'react';
import { ExamPackage } from '../types';
import { 
  Award, TrendingUp, CheckCircle2, ShoppingCart, Zap, 
  Lock, Play, Filter, ChevronDown, AlertTriangle, 
  ExternalLink, X, Clock, HelpCircle, BookOpen, Crown, Loader2, ShieldAlert
} from 'lucide-react';

interface CatalogProps {
  user: any;
  packages: ExamPackage[]; 
  onStartExam: (pkg: ExamPackage) => void;
  onBuyPackage: (pkgId: string) => void; 
}

// --- DATA REFERENSI KATEGORI (DARI KODE ASLI) ---
const SUBJECT_TOPICS: Record<string, string[]> = {
  'Penalaran Umum': ['Campuran', 'Penalaran Induktif', 'Penalaran Deduktif', 'Penalaran Kuantitatif'],
  'Pengetahuan Kuantitatif': ['Campuran', 'Bilangan', 'Aljabar & Fungsi', 'Geometri', 'Statistika & Peluang'],
  'PPU': ['Campuran', 'Ide Pokok & Kesimpulan', 'Kepaduan Paragraf', 'Makna Kata'],
  'PBM': ['Campuran', 'Ejaan (PUEBI)', 'Tanda Baca', 'Kalimat Efektif'],
  'Literasi Bahasa Indonesia': ['Campuran', 'Teks Sastra', 'Teks Informasi'],
  'Literasi Bahasa Inggris': ['Campuran', 'Main Idea', 'Detail Information', 'Vocabulary in Context'],
  'Penalaran Matematika': ['Campuran', 'Aritmatika Sosial', 'Geometri Aplikatif', 'Data & Ketidakpastian']
};

export const Catalog: React.FC<CatalogProps> = ({ user, packages, onStartExam, onBuyPackage }) => {
  // --- STATE FILTER ---
  const [activeTab, setActiveTab] = useState<'FULL' | 'MINI'>('FULL');
  const [selectedSubject, setSelectedSubject] = useState<string>("Semua Mapel");
  const [selectedTopic, setSelectedTopic] = useState<string>("Semua Topik");
  
  // --- STATE TRANSAKSI (DARI KODE ASLI) ---
  const [selectedPackageForBuy, setSelectedPackageForBuy] = useState<ExamPackage | null>(null);
  const [claimingId, setClaimingId] = useState<string | null>(null);

  // --- LOGIKA FILTER PINTAR ---
  const filteredPackages = packages.filter(pkg => {
    // 1. Filter berdasarkan Tab (FULL vs MINI)
    if (pkg.packageType !== activeTab && pkg.packageType) return false;
    // Fallback untuk paket lama yang belum punya tipe (dianggap FULL)
    if (!pkg.packageType && activeTab === 'MINI') return false;

    // 2. Filter Lanjutan Khusus MINI
    if (activeTab === 'MINI') {
      if (selectedSubject !== 'Semua Mapel' && pkg.subject !== selectedSubject) return false;
      if (selectedTopic !== 'Semua Topik' && pkg.topic !== selectedTopic) return false;
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

  const handleProceedToLynk = () => {
    if (selectedPackageForBuy?.lynkUrl) {
      window.open(selectedPackageForBuy.lynkUrl, '_blank');
      // Opsional: Tutup modal setelah klik (bisa diaktifkan jika mau)
      // setSelectedPackageForBuy(null);
    } else {
      alert("Link pembelian belum tersedia untuk paket ini. Hubungi admin.");
    }
  };

  return (
    <div className="space-y-8 animate-fade-in relative min-h-screen pb-20">
      
      {/* 1. HEADER & MAIN TABS */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2">Katalog Try Out 📚</h1>
        <p className="text-slate-500 dark:text-slate-400 mb-8">Pilih amunisi latihan yang sesuai dengan target belajarmu hari ini.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Tab: Simulasi FULL */}
          <button
            onClick={() => { setActiveTab('FULL'); setSelectedSubject('Semua Mapel'); setSelectedTopic('Semua Topik'); }}
            className={`relative p-6 rounded-2xl border-2 transition-all duration-300 text-left group overflow-hidden
              ${activeTab === 'FULL' 
                ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 shadow-lg shadow-blue-100 dark:shadow-none' 
                : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-blue-200 dark:hover:border-blue-800'
              }`}
          >
            <div className={`absolute top-0 right-0 p-4 opacity-10 transform group-hover:scale-110 transition-transform ${activeTab === 'FULL' ? 'text-blue-600' : 'text-slate-400'}`}>
              <Award size={80} />
            </div>
            <div className="relative z-10 flex items-start gap-4">
              <div className={`p-3 rounded-xl ${activeTab === 'FULL' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 group-hover:bg-blue-50 group-hover:text-blue-500'}`}>
                <Award size={28} />
              </div>
              <div>
                <h3 className={`text-lg font-bold mb-1 ${activeTab === 'FULL' ? 'text-blue-700 dark:text-blue-400' : 'text-slate-900 dark:text-white'}`}>
                  Simulasi SNBT (FULL)
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">7 Subtes Lengkap + IRT</p>
              </div>
            </div>
            {activeTab === 'FULL' && <div className="absolute bottom-0 left-0 w-full h-1 bg-blue-600"></div>}
          </button>

          {/* Tab: Drilling MINI */}
          <button
            onClick={() => setActiveTab('MINI')}
            className={`relative p-6 rounded-2xl border-2 transition-all duration-300 text-left group overflow-hidden
              ${activeTab === 'MINI' 
                ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 shadow-lg shadow-emerald-100 dark:shadow-none' 
                : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-emerald-200 dark:hover:border-emerald-800'
              }`}
          >
            <div className={`absolute top-0 right-0 p-4 opacity-10 transform group-hover:scale-110 transition-transform ${activeTab === 'MINI' ? 'text-emerald-500' : 'text-slate-400'}`}>
              <TrendingUp size={80} />
            </div>
            <div className="relative z-10 flex items-start gap-4">
              <div className={`p-3 rounded-xl ${activeTab === 'MINI' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 group-hover:bg-emerald-50 group-hover:text-emerald-500'}`}>
                <TrendingUp size={28} />
              </div>
              <div>
                <h3 className={`text-lg font-bold mb-1 ${activeTab === 'MINI' ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-900 dark:text-white'}`}>
                  Drilling Subtes (MINI)
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Fokus 1 Mapel & Bab Spesifik</p>
              </div>
            </div>
            {activeTab === 'MINI' && <div className="absolute bottom-0 left-0 w-full h-1 bg-emerald-500"></div>}
          </button>
        </div>
      </div>

      {/* 2. FILTER MATERI (Hanya untuk MINI) */}
      {activeTab === 'MINI' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm animate-in fade-in slide-in-from-top-4">
          <div className="flex items-center gap-2 mb-4 text-sm font-bold text-slate-400 uppercase tracking-wider">
            <Filter size={16} className="text-emerald-500" /> Filter Materi
          </div>
          
          <div className="space-y-4">
             <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">1. Pilih Mata Pelajaran</label>
                <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                  <button
                    onClick={() => { setSelectedSubject("Semua Mapel"); setSelectedTopic("Semua Topik"); }}
                    className={`whitespace-nowrap px-5 py-2.5 rounded-xl text-sm font-bold transition-all border
                      ${selectedSubject === "Semua Mapel" 
                        ? 'bg-emerald-100 border-emerald-500 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 shadow-sm' 
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                      }`}
                  >
                    Semua Mapel
                  </button>
                  {Object.keys(SUBJECT_TOPICS).map((subject) => (
                    <button
                      key={subject}
                      onClick={() => { setSelectedSubject(subject); setSelectedTopic("Semua Topik"); }}
                      className={`whitespace-nowrap px-5 py-2.5 rounded-xl text-sm font-bold transition-all border
                        ${selectedSubject === subject 
                          ? 'bg-emerald-100 border-emerald-500 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 shadow-sm' 
                          : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                        }`}
                    >
                      {subject}
                    </button>
                  ))}
                </div>
             </div>

             {selectedSubject !== "Semua Mapel" && (
                <div className="pt-2 animate-fade-in">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">2. Pilih Bab / Topik Spesifik</label>
                   <div className="relative max-w-xs">
                      <select 
                        value={selectedTopic}
                        onChange={(e) => setSelectedTopic(e.target.value)}
                        className="w-full appearance-none bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 py-3 pl-4 pr-10 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-shadow cursor-pointer"
                      >
                        <option value="Semua Topik">Semua Bab di {selectedSubject}</option>
                        {SUBJECT_TOPICS[selectedSubject].map(topic => (
                           <option key={topic} value={topic}>{topic}</option>
                        ))}
                      </select>
                      <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                   </div>
                </div>
             )}
          </div>
        </div>
      )}

      {/* 3. KARTU PAKET (Grid System) */}
      {filteredPackages.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPackages.map((pkg) => {
            // --- LOGIKA SAKTI VIP DI SINI ---
            const isAdmin = user?.role === 'admin';
            const isVIP = user?.ownedPackages?.includes('VIP_ACCESS_ALL'); // <--- Cek Kunci Ajaib
            const isOwned = isAdmin || isVIP || user?.ownedPackages?.includes(pkg.id); 
            // --------------------------------
            
            const totalQuestions = pkg.subtests?.reduce((acc, s) => acc + (s.questions?.length || 0), 0) || 0;
            const totalDuration = pkg.subtests?.reduce((acc, s) => acc + (s.durationMinutes || 0), 0) || 0;
            const isMini = pkg.packageType === 'MINI';
            const isFree = pkg.price === 0;

            return (
              <div 
                key={pkg.id} 
                className="group relative bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col"
              >
                {/* Visual Badge Khusus Admin */}
                {isAdmin && !user?.ownedPackages?.includes(pkg.id) && (
                   <div className="absolute top-4 left-4 z-20 bg-purple-600 text-white px-3 py-1.5 rounded-xl text-[10px] font-black uppercase shadow-lg shadow-purple-200 flex items-center gap-1 animate-pulse">
                      <Crown size={12} className="fill-white" /> Admin Mode
                   </div>
                )}

                {/* Header Kartu */}
                <div className={`relative p-6 h-40 flex flex-col justify-between overflow-hidden
                  ${isMini 
                    ? 'bg-gradient-to-br from-emerald-600 to-teal-700 text-white'
                    : 'bg-gradient-to-br from-slate-800 to-slate-900 dark:from-slate-800 dark:to-black text-white' 
                  }`}
                >
                  {/* Watermark Icon */}
                  <div className="absolute -right-4 -bottom-4 opacity-10 rotate-12">
                     {isMini ? <Zap size={100} /> : <Award size={100} />}
                  </div>

                  {/* Badges */}
                  <div className="flex justify-between items-start relative z-10">
                     {isMini && pkg.subject ? (
                       <span className="px-2 py-1 bg-white/20 backdrop-blur-md rounded-lg text-[10px] font-bold uppercase tracking-wide border border-white/10">
                         {pkg.subject}
                       </span>
                     ) : (
                       <span></span> 
                     )}
                     <div className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide flex items-center gap-1 shadow-sm
                        ${pkg.isPremium ? 'bg-amber-400 text-amber-950' : 'bg-white text-slate-700'}`}>
                        {pkg.isPremium && <Lock size={10} />}
                        {pkg.isPremium ? 'PREMIUM' : 'GRATIS'}
                     </div>
                  </div>

                  {/* Title */}
                  <div className="relative z-10 mt-auto">
                     <h3 className="text-xl font-bold leading-tight line-clamp-2">{pkg.title}</h3>
                     <p className="text-white/80 text-xs font-medium mt-1">
                       {isMini ? pkg.topic : `${pkg.subtests?.length || 0} Subtes`}
                     </p>
                  </div>
                </div>

                {/* Content Body */}
                <div className="p-6 flex-1 flex flex-col">
                  {/* Meta Stats */}
                  <div className="flex items-center gap-4 text-xs font-semibold text-slate-500 dark:text-slate-400 mb-6 pb-6 border-b border-slate-100 dark:border-slate-800">
                     <div className="flex items-center gap-1.5">
                        <Clock size={16} className="text-slate-400" />
                        {totalDuration > 0 ? `${totalDuration} Mnt` : 'Timer'}
                     </div>
                     <div className="flex items-center gap-1.5">
                        <HelpCircle size={16} className="text-slate-400" />
                        {totalQuestions} Soal
                     </div>
                  </div>

                  {/* Features List */}
                  <ul className="space-y-3 mb-8 flex-1">
                     <li className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-300">
                        <CheckCircle2 size={18} className={`flex-shrink-0 mt-0.5 ${pkg.isPremium ? 'text-amber-500' : (isMini ? 'text-emerald-500' : 'text-blue-500')}`} />
                        <span className="leading-snug">{isMini ? 'Fokus 1 Subtes Spesifik' : 'Sistem Penilaian IRT'}</span>
                     </li>
                     <li className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-300">
                        <CheckCircle2 size={18} className={`flex-shrink-0 mt-0.5 ${pkg.isPremium ? 'text-amber-500' : (isMini ? 'text-emerald-500' : 'text-blue-500')}`} />
                        <span className="leading-snug">Timer Akurat Terkunci</span>
                     </li>
                     {pkg.isPremium && (
                       <li className="flex items-start gap-3 text-sm font-bold text-slate-800 dark:text-slate-200">
                          <Zap size={18} className="flex-shrink-0 mt-0.5 text-amber-500 fill-amber-500" />
                          <span className="leading-snug">Pembahasan Eksklusif</span>
                       </li>
                     )}
                  </ul>

                  {/* CTA Button Logic */}
                  <div className="mt-auto">
                    {isOwned ? (
                      <button 
                        onClick={() => onStartExam(pkg)}
                        className={`w-full py-3.5 rounded-xl font-bold uppercase tracking-wider text-sm flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-lg
                           ${isAdmin 
                             ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-500/25'
                             : (isMini 
                               ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/25' 
                               : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/25'
                             )}`}
                      >
                        {isAdmin ? <><Crown size={18} className="fill-white" /> Akses Admin</> : <><Play size={18} fill="currentColor" /> MULAI KERJAKAN</>}
                      </button>
                    ) : isFree ? (
                      <button 
                        onClick={() => handlePackageClick(pkg)}
                        disabled={claimingId === pkg.id}
                        className="w-full py-3.5 rounded-xl border-2 border-slate-900 dark:border-white text-slate-900 dark:text-white font-bold uppercase tracking-wider text-sm flex items-center justify-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-70"
                      >
                        {claimingId === pkg.id ? <Loader2 className="animate-spin" size={20} /> : <><ShoppingCart size={18} /> KLAIM GRATIS</>}
                      </button>
                    ) : (
                      <button 
                        onClick={() => handlePackageClick(pkg)}
                        className={`w-full py-3.5 rounded-xl border-2 font-bold uppercase tracking-wider text-sm flex items-center justify-center gap-2 transition-colors
                          ${isMini 
                            ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500 hover:text-white dark:hover:text-white' 
                            : 'border-blue-600 text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white dark:hover:text-white'
                          }`}
                      >
                        BELI Rp {pkg.price.toLocaleString('id-ID')}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 p-12 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-slate-800 text-center animate-fade-in">
           <div className="bg-slate-50 dark:bg-slate-800 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300 dark:text-slate-500">
              <BookOpen size={40} />
           </div>
           <h3 className="text-2xl font-black text-slate-700 dark:text-slate-200 mb-2">Paket Belum Tersedia</h3>
           <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">Admin belum menambahkan paket untuk kategori atau materi ini. Coba pilih materi yang lain!</p>
           <button onClick={() => { setActiveTab('FULL'); setSelectedSubject('Semua Mapel'); setSelectedTopic('Semua Topik'); }} className="mt-8 px-8 py-3 bg-[#1e3a8a] text-white rounded-2xl font-black hover:bg-blue-800 transition-all shadow-lg shadow-blue-100 dark:shadow-none">
              Lihat Semua Paket
           </button>
        </div>
      )}

      {/* 4. MODAL INSTRUKSI PEMBELIAN LYNK.ID */}
      {selectedPackageForBuy && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
           {/* Backdrop */}
           <div 
             className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
             onClick={() => setSelectedPackageForBuy(null)}
           />

           {/* Modal Content */}
           <div className="relative bg-white dark:bg-slate-900 w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-100 dark:border-slate-800">
              {/* Gradient Top Edge */}
              <div className="h-3 w-full bg-gradient-to-r from-yellow-400 to-orange-500"></div>

              {/* Close Button */}
              <button 
                onClick={() => setSelectedPackageForBuy(null)}
                className="absolute top-5 right-5 p-2 bg-slate-50 dark:bg-slate-800 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
              >
                <X size={20} />
              </button>

              <div className="p-8">
                 <div className="flex flex-col items-center text-center mb-6">
                    <div className="w-20 h-20 bg-yellow-50 dark:bg-yellow-900/30 border-2 border-yellow-100 dark:border-yellow-700 rounded-[2rem] flex items-center justify-center text-yellow-600 dark:text-yellow-500 mb-6 animate-bounce shadow-sm">
                       <AlertTriangle size={40} />
                    </div>
                    <h3 className="text-2xl font-black text-[#1e3a8a] dark:text-white">PENTING BANGET! ⚠️</h3>
                    <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm leading-relaxed px-2">
                       Agar paket <span className="font-bold text-slate-700 dark:text-slate-200">"{selectedPackageForBuy.title}"</span> otomatis terbuka dalam 5 detik, pastikan kamu menggunakan email ini saat checkout:
                    </p>
                 </div>

                 <div className="bg-slate-50 dark:bg-slate-800 rounded-3xl p-6 text-center mb-8 border-2 border-slate-100 dark:border-slate-700 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-[#1e3a8a] dark:bg-emerald-500"></div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">EMAIL AKUN KAMU</p>
                    <p className="text-lg font-black text-slate-800 dark:text-white break-all">{user?.email || "Email tidak terdeteksi"}</p>
                 </div>

                 <div className="space-y-3">
                    <button 
                      onClick={handleProceedToLynk}
                      className="w-full py-5 bg-[#1e3a8a] dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black uppercase tracking-widest text-sm hover:opacity-90 transition-all shadow-xl shadow-blue-200 dark:shadow-none flex items-center justify-center gap-3 group"
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
        </div>
      )}

    </div>
  );
};

export default Catalog;