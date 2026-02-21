import React, { useState } from 'react';
import { User } from '../types';
import { Crown, CheckCircle2, Zap, ShieldCheck, Star, ExternalLink, X, AlertTriangle, ShieldAlert } from 'lucide-react';

interface SubscriptionProps {
  user: User | null;
}

const Subscription: React.FC<SubscriptionProps> = ({ user }) => {
  const [showModal, setShowModal] = useState(false);

  // GANTI LINK LYNK.ID INI DENGAN LINK PRODUK VIP KAMU
  const VIP_LYNK_URL = "http://lynk.id/invictus31415/dyzlko1wz0vx/checkout"; 

  const handleBuyClick = () => {
    setShowModal(true);
  };

  const handleProceedToLynk = () => {
    window.open(VIP_LYNK_URL, '_blank');
  };

  const isVIP = user?.ownedPackages?.includes('VIP_ACCESS_ALL') || user?.role === 'admin';

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto pb-24 animate-fade-in">
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center p-3 bg-yellow-100 text-yellow-600 rounded-full mb-4 shadow-sm">
          <Crown size={32} />
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-4">
          Akses Tanpa Batas. <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-orange-400">Bayar Sekali, Berlaku Selamanya.</span>
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-lg max-w-2xl mx-auto">
          Upgrade ke VIP Member sekarang. Bebas kerjakan semua paket Try Out hari ini, dan nikmati semua paket baru di masa depan tanpa bayar lagi.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-yellow-200 dark:border-yellow-900/50 shadow-2xl overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-yellow-400 via-orange-500 to-yellow-400"></div>
        
        <div className="p-8 md:p-12 flex flex-col md:flex-row items-center gap-10">
          <div className="flex-1 space-y-6">
            <div className="inline-block px-4 py-1.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-full text-xs font-black uppercase tracking-widest mb-2">
              DEAN'S LAB VIP PASS
            </div>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white">Investasi Masa Depan</h2>
            
            <div className="space-y-4 pt-4">
              {[
                { icon: Zap, text: "Akses ke seluruh paket TO (Simulasi & Drilling)" },
                { icon: Star, text: "Bebas nikmati paket TO rilis terbaru (Gratis)" },
                { icon: ShieldCheck, text: "Unlock semua Video Pembahasan Eksklusif" },
                { icon: Crown, text: "Prioritas masuk Papan Peringkat Nasional" }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-emerald-500 shrink-0">
                    <CheckCircle2 size={20} />
                  </div>
                  <span className="font-bold text-slate-700 dark:text-slate-300">{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="w-full md:w-80 bg-slate-50 dark:bg-slate-800 p-8 rounded-3xl text-center border border-slate-100 dark:border-slate-700 relative">
            {isVIP && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-emerald-500 text-white px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest shadow-lg">
                STATUS: AKTIF ✅
              </div>
            )}
            
            <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">Harga Spesial</p>
            <div className="flex items-start justify-center gap-1 mb-6">
              <span className="text-xl font-bold text-slate-400 mt-2">Rp</span>
              <span className="text-5xl font-black text-slate-900 dark:text-white">50</span>
              <span className="text-xl font-bold text-slate-400 mt-auto mb-1">.000</span>
            </div>
            
            {isVIP ? (
              <button disabled className="w-full py-4 bg-emerald-100 text-emerald-600 rounded-2xl font-black uppercase tracking-widest cursor-not-allowed">
                Kamu Sudah VIP
              </button>
            ) : (
              <button 
                onClick={handleBuyClick}
                className="w-full py-4 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-white rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-yellow-500/30 transition-all transform hover:scale-105"
              >
                Beli Akses VIP
              </button>
            )}
            <p className="text-xs text-slate-400 mt-4 font-medium">Bayar sekali untuk akses selamanya.</p>
          </div>
        </div>
      </div>

      {/* Modal Pembelian */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
           <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] max-w-md w-full p-8 shadow-2xl animate-pop-in relative overflow-hidden">
              <button onClick={() => setShowModal(false)} className="absolute top-5 right-5 text-slate-400 hover:bg-slate-100 p-2 rounded-full"><X size={20}/></button>
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-yellow-400 to-orange-500"></div>

              <div className="text-center mb-6 mt-2">
                 <div className="w-20 h-20 bg-yellow-50 border-2 border-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce shadow-sm">
                    <AlertTriangle size={36} />
                 </div>
                 <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">PENTING BANGET! ⚠️</h2>
                 <p className="text-slate-500 text-sm leading-relaxed px-2">
                   Pastikan kamu menggunakan <b>Email Akun</b> ini saat mengisi form checkout di Lynk.id:
                 </p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 mb-8 text-center relative overflow-hidden">
                 <div className="absolute top-0 left-0 w-1 h-full bg-yellow-500"></div>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">EMAIL AKUN KAMU</p>
                 <p className="text-lg font-black text-slate-800 dark:text-white break-all">{user?.email || "Email tidak terdeteksi"}</p>
              </div>

              <div className="space-y-3">
                <button 
                  onClick={handleProceedToLynk}
                  className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black uppercase tracking-widest text-sm hover:opacity-90 transition-all shadow-xl flex items-center justify-center gap-3 group"
                >
                  GASS BELI VIP <ExternalLink size={18} className="group-hover:translate-x-1 transition-transform"/>
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

export default Subscription;