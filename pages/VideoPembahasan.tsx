import React, { useState, useEffect } from 'react';
import { User, ExamPackage } from '../types';
import { 
  ArrowLeft, ChevronDown, ChevronUp, Play, 
  CheckCircle2, Lock, Clock, ListVideo, Film
} from 'lucide-react';

interface VideoPembahasanProps {
  user: User | null;
  packages: ExamPackage[];
  onBack: () => void;
  onNavigate: (page: string) => void;
}

interface VideoItem {
  id: string;
  title: string;
  duration: string;
  isWatched: boolean;
  driveId: string; 
}

export const VideoPembahasan: React.FC<VideoPembahasanProps> = ({ user, packages, onBack, onNavigate }) => {
  // 1. FILTER PAKET: Hanya ambil paket yang "Sudah Dimiliki" atau "Admin"
  const isVIP = user?.ownedPackages?.includes('VIP_ACCESS_ALL');
  const ownedPackages = packages.filter(pkg => 
    user?.role === 'admin' || isVIP || user?.ownedPackages?.includes(pkg.id)
  );

  const [selectedPackageId, setSelectedPackageId] = useState<string>('');
  const [activeSubtest, setActiveSubtest] = useState<string | null>(null);
  const [activeVideo, setActiveVideo] = useState<VideoItem | null>(null);

  // Set default paket saat pertama kali render
  useEffect(() => {
    if (ownedPackages.length > 0 && !selectedPackageId) {
      setSelectedPackageId(ownedPackages[0].id);
    }
  }, [ownedPackages]);

  const currentPackage = ownedPackages.find(p => p.id === selectedPackageId) || ownedPackages[0];

  // Auto-set video pertama saat paket berganti
  useEffect(() => {
    if (currentPackage && currentPackage.subtests && currentPackage.subtests.length > 0) {
      const firstSubtest = currentPackage.subtests[0];
      setActiveSubtest(firstSubtest.id);
      setActiveVideo({
        id: `vid-${firstSubtest.id}`,
        title: `Pembahasan ${firstSubtest.title}`,
        duration: `${firstSubtest.durationMinutes} Menit`,
        isWatched: false,
        // TODO: Ganti dengan ID GDrive asli dari database jika nanti sudah ditambahkan
        driveId: (firstSubtest as any).video_drive_id || '1a2b3c4d5e6f7g8h9i_DUMMY' 
      });
    } else {
      setActiveSubtest(null);
      setActiveVideo(null);
    }
  }, [currentPackage?.id]);

  const handlePackageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedPackageId(e.target.value);
  };

  const toggleSubtest = (subtestId: string) => {
    setActiveSubtest(activeSubtest === subtestId ? null : subtestId);
  };

  // Cek apakah user berhak menonton (Paket Premium / Admin)
  const hasVideoAccess = currentPackage?.isPremium || user?.role === 'admin' || isVIP;

  if (ownedPackages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-fade-in text-center px-4">
         <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-300 dark:text-slate-600 mb-6">
            <Film size={40} />
         </div>
         <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-2">Belum Ada Video Tersedia</h2>
         <p className="text-slate-500 max-w-md mb-8">Kamu belum memiliki paket Try Out. Silakan klaim atau beli paket di Katalog terlebih dahulu untuk melihat pembahasan videonya.</p>
         <button onClick={() => onNavigate('catalog')} className="px-8 py-3 bg-[#1e3a8a] text-white rounded-xl font-bold shadow-lg">Pergi ke Katalog</button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in min-h-[calc(100vh-100px)]">
      
      {/* 1. HEADER & KONTROL */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button 
            onClick={onBack}
            className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors shadow-sm"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
             <h1 className="text-2xl font-bold text-[#1e3a8a] dark:text-white flex items-center gap-2">
                Video Pembahasan <span className="text-2xl">🎬</span>
             </h1>
          </div>
        </div>

        <div className="w-full md:w-auto min-w-[300px]">
           <div className="relative border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-xl shadow-sm">
              <select 
                value={selectedPackageId}
                onChange={handlePackageChange}
                // PERBAIKAN: Background diganti jadi solid agar di HP tidak tembus pandang/hilang
                className="w-full appearance-none bg-white dark:bg-slate-900 text-slate-900 dark:text-white py-3 pl-4 pr-10 rounded-xl text-sm font-bold focus:outline-none cursor-pointer truncate"
              >
                {ownedPackages.map(pkg => (
                  // PERBAIKAN: Menambahkan class warna gelap terang yang tegas pada opsi
                  <option key={pkg.id} value={pkg.id} className="bg-white text-slate-900 dark:bg-slate-800 dark:text-white font-medium">
                    {pkg.title}
                  </option>
                ))}
              </select>
              <ChevronDown size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
           </div>
        </div>
      </div>

      {/* 2. LAYOUT UTAMA */}
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-6 lg:gap-8">
        
        {/* 3. VIDEO PLAYER AREA (70% on Desktop) */}
        <div className="lg:col-span-7 space-y-4">
           {/* Player Container */}
           <div className="relative aspect-video bg-slate-900 rounded-2xl md:rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden group">
              {hasVideoAccess && activeVideo ? (
                // Premium: Unlocked Player (Embed GDrive Asli)
                <iframe 
                  src={`https://drive.google.com/file/d/${activeVideo.driveId}/preview`}
                  title="Video Pembahasan Google Drive"
                  className="w-full h-full border-0"
                  allow="autoplay; fullscreen"
                ></iframe>
              ) : (
                // Free/Standard: Locked State
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-6 text-center">
                   {/* Background Image (Blurred) */}
                   <div className="absolute inset-0 bg-slate-800 bg-cover bg-center blur-sm opacity-50"></div>
                   <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm"></div>
                   
                   {/* Lock Content */}
                   <div className="relative z-20 flex flex-col items-center animate-in zoom-in-95 duration-300">
                      <div className="w-20 h-20 bg-slate-800/80 rounded-full flex items-center justify-center text-amber-400 mb-4 border border-slate-700 shadow-xl">
                         <Lock size={32} />
                      </div>
                      <h3 className="text-xl md:text-2xl font-bold text-white mb-2">Pembahasan Video Eksklusif</h3>
                      <p className="text-slate-300 mb-6 max-w-md text-sm md:text-base">
                         Yah, paket <b>"{currentPackage?.title}"</b> kamu masih versi Standar/Gratisan. Upgrade ke Premium dulu biar bisa nonton pembahasan lengkapnya!
                      </p>
                      <button 
                        onClick={() => onNavigate('catalog')}
                        className="px-8 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white rounded-xl font-bold transition-all transform hover:scale-105 shadow-lg flex items-center gap-2"
                      >
                         Buka Katalog Premium
                      </button>
                   </div>
                </div>
              )}
           </div>

           {/* Video Meta */}
           {activeVideo && (
             <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3 line-clamp-2">
                   {activeVideo.title}
                </h2>
                <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400 font-medium">
                   <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                      <ListVideo size={16} /> {currentPackage?.title}
                   </span>
                   <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800">
                      <Clock size={16} /> {activeVideo.duration}
                   </span>
                </div>
             </div>
           )}
        </div>

        {/* 4. PLAYLIST / DAFTAR SOAL (30% on Desktop) */}
        <div className="lg:col-span-3">
           <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden sticky top-24">
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                 <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    Daftar Putar 
                 </h3>
                 <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-[10px] rounded-full font-bold">
                    {currentPackage?.subtests?.length || 0} Video
                 </span>
              </div>
              
              <div className="max-h-[500px] overflow-y-auto custom-scrollbar">
                 {currentPackage?.subtests?.map((subtest) => {
                    const isOpen = activeSubtest === subtest.id;
                    const videoId = `vid-${subtest.id}`;
                    const isActiveVideo = activeVideo?.id === videoId;

                    return (
                       <div key={subtest.id} className="border-b border-slate-100 dark:border-slate-800 last:border-0">
                          {/* Accordion Header */}
                          <button 
                             onClick={() => toggleSubtest(subtest.id)}
                             className={`w-full flex items-center justify-between p-4 transition-colors text-left ${isOpen ? 'bg-blue-50/50 dark:bg-blue-900/10' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
                          >
                             <span className={`font-bold text-sm ${isOpen ? 'text-[#1e3a8a] dark:text-blue-400' : 'text-slate-700 dark:text-slate-300'}`}>
                                {subtest.title}
                             </span>
                             {isOpen ? <ChevronUp size={16} className="text-[#1e3a8a] dark:text-blue-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                          </button>

                          {/* Accordion Content (Videos) */}
                          {isOpen && (
                             <div className="bg-white dark:bg-slate-950/30 pb-2">
                                <button 
                                   onClick={() => setActiveVideo({
                                     id: videoId,
                                     title: `Pembahasan ${subtest.title}`,
                                     duration: `${subtest.durationMinutes} Menit`,
                                     isWatched: false,
                                     driveId: (subtest as any).video_drive_id || '1a2b3c4d5e6f7g8h9i_DUMMY'
                                   })}
                                   disabled={!hasVideoAccess}
                                   className={`w-full flex items-start gap-3 p-3 pl-6 transition-all border-l-4 text-left group
                                      ${isActiveVideo 
                                         ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-500' 
                                         : 'border-transparent hover:bg-slate-50 dark:hover:bg-slate-800 opacity-90'
                                      }
                                      ${!hasVideoAccess ? 'cursor-not-allowed opacity-50' : ''}
                                   `}
                                >
                                   <div className={`mt-0.5 ${isActiveVideo ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                                      <Play size={16} fill={isActiveVideo ? "currentColor" : "none"} />
                                   </div>
                                   <div className="flex-1">
                                      <p className={`text-sm font-bold line-clamp-2 ${isActiveVideo ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-400'}`}>
                                         Bedah Soal {subtest.title}
                                      </p>
                                      <span className="text-[10px] text-slate-400 mt-1 block font-mono font-bold uppercase tracking-wider">
                                         Full Review
                                      </span>
                                   </div>
                                   {!hasVideoAccess && <Lock size={14} className="text-slate-400 mt-1" />}
                                </button>
                             </div>
                          )}
                       </div>
                    )
                 })}
              </div>
           </div>
        </div>

      </div>
    </div>
  );
};

export default VideoPembahasan;