
import React, { useState, useEffect } from 'react';
import { Award, Zap, ShieldCheck, Star } from 'lucide-react';

interface LandingPageProps {
  onStart: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, mins: 0, secs: 0 });

  useEffect(() => {
    const targetDate = new Date('April 21, 2026 00:00:00').getTime();
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate - now;

      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        mins: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        secs: Math.floor((distance % (1000 * 60)) / 1000),
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="flex justify-between items-center px-8 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2 font-black text-2xl text-[#1e3a8a]">
          <Award className="text-emerald-500" size={32} />
          DEAN'S LAB
        </div>
        <div className="hidden md:flex gap-8 font-medium">
          <a href="#fitur" className="hover:text-blue-700">Fitur</a>
          <a href="#biaya" className="hover:text-blue-700">Biaya</a>
          <a href="#faq" className="hover:text-blue-700">FAQ</a>
        </div>
        <button 
          onClick={onStart}
          className="bg-[#1e3a8a] text-white px-8 py-2 rounded-full font-bold hover:bg-blue-800 transition-all"
        >
          Masuk / Daftar
        </button>
      </nav>

      {/* Hero */}
      <section className="px-6 py-20 text-center max-w-4xl mx-auto">
        <h1 className="text-5xl md:text-7xl font-black text-[#1e3a8a] leading-tight mb-6">
          Try Out UTBK Akurat,<br />
          <span className="text-emerald-500 italic underline decoration-blue-500">Harga Seblak.</span>
        </h1>
        <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto">
          Simulasi UTBK-SNBT 2026 paling realistik dengan sistem penilaian IRT asli SNPMB. Mulai belajarmu hari ini untuk amankan PTN impian!
        </p>
        
        <div className="flex flex-col md:flex-row gap-4 justify-center items-center mb-16">
          <button 
            onClick={onStart}
            className="w-full md:w-auto bg-emerald-500 text-white text-xl px-12 py-5 rounded-2xl font-black shadow-xl shadow-emerald-200 hover:scale-105 transition-all"
          >
            IKUT TRY OUT GRATIS
          </button>
          <button className="w-full md:w-auto border-2 border-slate-200 px-12 py-5 rounded-2xl font-bold hover:bg-slate-50 transition-all">
            Lihat Paket Premium
          </button>
        </div>

        {/* Countdown */}
        <div className="bg-slate-50 rounded-3xl p-8 border border-slate-100">
          <h3 className="text-slate-500 font-bold uppercase tracking-widest text-sm mb-6">Menuju UTBK 21 April 2026</h3>
          <div className="flex justify-center gap-4 md:gap-10">
            {[
              { label: 'HARI', val: timeLeft.days },
              { label: 'JAM', val: timeLeft.hours },
              { label: 'MENIT', val: timeLeft.mins },
              { label: 'DETIK', val: timeLeft.secs },
            ].map((t) => (
              <div key={t.label} className="flex flex-col items-center">
                <span className="text-4xl md:text-6xl font-black text-[#1e3a8a]">{t.val.toString().padStart(2, '0')}</span>
                <span className="text-xs font-bold text-slate-400 mt-2">{t.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats/Features */}
      <section id="fitur" className="bg-[#1e3a8a] py-24 px-6">
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-12">
          <div className="text-white">
            <div className="bg-emerald-500/20 p-4 rounded-2xl w-fit mb-6">
              <Zap className="text-emerald-400" size={32} />
            </div>
            <h3 className="text-2xl font-bold mb-4">Real-time CBT</h3>
            <p className="text-slate-300 leading-relaxed">Sistem ujian yang meniru persis antarmuka SNPMB, lengkap dengan timer per subtes.</p>
          </div>
          <div className="text-white">
            <div className="bg-blue-400/20 p-4 rounded-2xl w-fit mb-6">
              <ShieldCheck className="text-blue-300" size={32} />
            </div>
            <h3 className="text-2xl font-bold mb-4">Penilaian IRT</h3>
            <p className="text-slate-300 leading-relaxed">Bobot nilai berdasarkan tingkat kesulitan soal, memberikan skor yang akurat untuk pemetaan PTN.</p>
          </div>
          <div className="text-white">
            <div className="bg-purple-400/20 p-4 rounded-2xl w-fit mb-6">
              <Star className="text-purple-300" size={32} />
            </div>
            <h3 className="text-2xl font-bold mb-4">Analisis Cerdas</h3>
            <p className="text-slate-300 leading-relaxed">Identifikasi titik lemahmu dengan data statistik per mata pelajaran setelah ujian.</p>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="biaya" className="py-24 px-6 max-w-5xl mx-auto">
        <h2 className="text-4xl font-black text-center text-[#1e3a8a] mb-16">Pilih Paket Ambismu</h2>
        <div className="grid md:grid-cols-2 gap-8">
          {/* Free */}
          <div className="bg-white border-2 border-slate-100 rounded-3xl p-10 hover:border-blue-200 transition-all">
            <span className="bg-slate-100 text-slate-600 px-4 py-1 rounded-full text-sm font-bold">Standard</span>
            <h3 className="text-3xl font-black mt-4">Gratis</h3>
            <p className="text-slate-500 mt-2">Untuk kamu yang baru mau coba.</p>
            <ul className="mt-8 space-y-4">
              <li className="flex items-center gap-3 text-slate-600 font-medium"><Award size={20} className="text-emerald-500" /> 1 Paket TO Nasional</li>
              <li className="flex items-center gap-3 text-slate-600 font-medium"><Award size={20} className="text-emerald-500" /> Hasil & Skor Langsung</li>
              <li className="flex items-center gap-3 text-slate-300 line-through font-medium"><Award size={20} /> Pembahasan Lengkap</li>
              <li className="flex items-center gap-3 text-slate-300 line-through font-medium"><Award size={20} /> Ranking Nasional</li>
            </ul>
            <button 
               onClick={onStart}
               className="w-full mt-10 py-4 border-2 border-[#1e3a8a] text-[#1e3a8a] font-bold rounded-2xl hover:bg-[#1e3a8a] hover:text-white transition-all"
            >
              Mulai Gratis
            </button>
          </div>
          {/* Pro */}
          <div className="bg-[#1e3a8a] text-white rounded-3xl p-10 relative overflow-hidden shadow-2xl shadow-blue-200">
            <div className="absolute top-0 right-0 p-4">
               <span className="bg-emerald-500 text-white px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest">BEST VALUE</span>
            </div>
            <span className="bg-white/10 text-emerald-400 px-4 py-1 rounded-full text-sm font-bold">Ambisius</span>
            <h3 className="text-3xl font-black mt-4">Rp 5.000 <span className="text-lg font-normal text-slate-400">/ paket</span></h3>
            <p className="text-slate-300 mt-2">Setara harga seblak, bonus masa depan.</p>
            <ul className="mt-8 space-y-4">
              <li className="flex items-center gap-3 text-slate-100 font-medium"><Star size={20} className="text-emerald-400" /> Semua Fitur Gratis</li>
              <li className="flex items-center gap-3 text-slate-100 font-medium"><Star size={20} className="text-emerald-400" /> Pembahasan Detail</li>
              <li className="flex items-center gap-3 text-slate-100 font-medium"><Star size={20} className="text-emerald-400" /> Ranking & Leaderboard</li>
              <li className="flex items-center gap-3 text-slate-100 font-medium"><Star size={20} className="text-emerald-400" /> Prediksi Lolos PTN</li>
            </ul>
            <button 
              onClick={onStart}
              className="w-full mt-10 py-4 bg-emerald-500 text-white font-black rounded-2xl shadow-lg shadow-emerald-500/30 hover:bg-emerald-600 transition-all"
            >
              Beli Sekarang
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-50 border-t py-12 px-6 text-center">
        <div className="flex justify-center items-center gap-2 font-black text-xl text-[#1e3a8a] mb-4">
          <Award className="text-emerald-500" />
          DEAN'S LAB
        </div>
        <p className="text-slate-400 text-sm">© 2025 Dean's Test Lab. Build with Ambition for Indonesia 2026.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
