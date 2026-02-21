import React, { useEffect, useState } from 'react';
import { ArrowRight, CheckCircle2, Zap, Brain, GraduationCap } from 'lucide-react';

interface LandingProps {
  onStart: () => void;
}

export const LandingPage: React.FC<LandingProps> = ({ onStart }) => {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    // Target date UTBK asli lu: April 21, 2026
    const targetDate = new Date('April 21, 2026 00:00:00').getTime();

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((difference / 1000 / 60) % 60);
        const seconds = Math.floor((difference / 1000) % 60);
        setTimeLeft({ days, hours, minutes, seconds });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const TimeUnit = ({ value, label }: { value: number; label: string }) => (
    <div className="flex flex-col items-center">
      <div className="bg-slate-900/5 dark:bg-white/10 backdrop-blur-sm rounded-xl p-3 sm:p-4 w-16 sm:w-20 lg:w-24 text-center border border-slate-200 dark:border-white/10 shadow-lg">
        <span className="text-xl sm:text-2xl lg:text-3xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
          {value.toString().padStart(2, '0')}
        </span>
      </div>
      <span className="text-xs sm:text-sm mt-2 text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wide">{label}</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-white overflow-hidden selection:bg-emerald-500/30">
        
      {/* Navbar */}
      <nav className="fixed w-full z-50 bg-white/70 dark:bg-slate-950/70 backdrop-blur-lg border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-emerald-500 p-1.5 rounded-lg text-white">
                <GraduationCap size={20} />
            </div>
            <span className="text-xl font-bold tracking-tight">Dean's Lab</span>
          </div>
          <div className="flex items-center gap-4">
             <button onClick={onStart} className="text-sm font-semibold hover:text-emerald-500 transition-colors hidden sm:block">Masuk</button>
             <button onClick={onStart} className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 py-2 rounded-full text-sm font-semibold hover:opacity-90 transition-opacity">
                Mulai Sekarang
             </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 px-4 overflow-hidden">
         {/* Background Decoration */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
            <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-400/20 rounded-full blur-3xl animate-pulse-slow"></div>
            <div className="absolute top-40 right-10 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider mb-6 border border-emerald-100 dark:border-emerald-500/20 shadow-sm">
             <Zap size={14} className="fill-current" /> #1 Platform CBT buat SNBT
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 dark:from-white dark:via-slate-200 dark:to-slate-400">
            Hajar UTBK. <br/> 
            <span className="text-emerald-500 dark:text-emerald-400">Amankan PTN Impianmu.</span>
          </h1>
          <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Latihan pakai sistem IRT presisi tinggi, analisis real-time, dan pembahasan video yang mudah dipahami. Gabung sekarang sebelum terlambat!
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <button 
                onClick={onStart}
                className="w-full sm:w-auto px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-bold text-lg shadow-xl shadow-emerald-500/20 transition-all hover:scale-105 flex items-center justify-center gap-2"
            >
                Coba Tryout Gratis
                <ArrowRight size={20} />
            </button>
            <button 
                onClick={() => {
                  const element = document.getElementById('fitur');
                  element?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="w-full sm:w-auto px-8 py-4 bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-2xl font-bold text-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
            >
                Lihat Fitur
            </button>
          </div>

          {/* Countdown */}
          <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 inline-block shadow-2xl">
            <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-4">Hitung Mundur UTBK 2026</h3>
            <div className="flex items-center gap-3 sm:gap-6">
                <TimeUnit value={timeLeft.days} label="Hari" />
                <span className="text-2xl font-bold text-slate-300 -mt-6">:</span>
                <TimeUnit value={timeLeft.hours} label="Jam" />
                <span className="text-2xl font-bold text-slate-300 -mt-6 hidden sm:block">:</span>
                <TimeUnit value={timeLeft.minutes} label="Mnt" />
                <span className="text-2xl font-bold text-slate-300 -mt-6 hidden sm:block">:</span>
                <TimeUnit value={timeLeft.seconds} label="Dtk" />
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div id="fitur" className="py-24 bg-slate-50 dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-3 gap-8">
                {[
                    { title: "CBT Real-time", desc: "Rasain antarmuka yang persis banget sama UTBK asli biar gak kaget pas hari H.", icon: CheckCircle2 },
                    { title: "Sistem Penilaian IRT", desc: "Pake sistem Item Response Theory buat prediksi ranking nasional yang paling akurat.", icon: Zap },
                    { title: "Analisis Pintar", desc: "Langsung tau subtes mana yang masih lemah lewat analisis performa.", icon: Brain }
                ].map((feature, idx) => (
                    <div key={idx} className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                        <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-500/20 rounded-2xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-6 group-hover:scale-110 transition-transform">
                            <feature.icon size={24} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{feature.title}</h3>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{feature.desc}</p>
                    </div>
                ))}
            </div>
        </div>
      </div>

       {/* Pricing */}
       <div className="py-24 px-4">
            <div className="max-w-5xl mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold mb-4">Harga Simpel & Transparan</h2>
                    <p className="text-slate-500">Investasi buat masa depan, lebih murah dari segelas kopi kekinian.</p>
                </div>
                <div className="grid md:grid-cols-2 gap-8 items-center">
                    {/* Free Plan */}
                    <div className="p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                        <h3 className="text-xl font-bold mb-2">Pejuang (Standar)</h3>
                        <div className="text-4xl font-extrabold mb-6">Gratis</div>
                        <ul className="space-y-4 mb-8">
                            <li className="flex gap-3 text-slate-600 dark:text-slate-300"><CheckCircle2 size={20} className="text-emerald-500" /> 1 Paket TO Nasional</li>
                            <li className="flex gap-3 text-slate-600 dark:text-slate-300"><CheckCircle2 size={20} className="text-emerald-500" /> Hasil & Skor Langsung</li>
                            <li className="flex gap-3 text-slate-400 opacity-50"><CheckCircle2 size={20} className="text-slate-300" /> Pembahasan Video</li>
                            <li className="flex gap-3 text-slate-400 opacity-50"><CheckCircle2 size={20} className="text-slate-300" /> Ranking Nasional</li>
                        </ul>
                        <button onClick={onStart} className="w-full py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 font-bold hover:border-emerald-500 hover:text-emerald-500 transition-colors">Mulai Gratis</button>
                    </div>

                    {/* Premium Plan */}
                    <div className="relative p-8 rounded-3xl bg-slate-900 dark:bg-slate-800 text-white shadow-2xl transform md:scale-105 border border-slate-700">
                        <div className="absolute top-0 right-0 bg-gradient-to-r from-emerald-500 to-teal-400 text-white text-xs font-bold px-3 py-1 rounded-bl-xl rounded-tr-2xl uppercase tracking-wider">Paling Laris</div>
                        <h3 className="text-xl font-bold mb-2 text-emerald-400">Ambisius (Premium)</h3>
                        <div className="text-4xl font-extrabold mb-6">Rp 5.000<span className="text-lg text-slate-400 font-normal">/paket</span></div>
                        <ul className="space-y-4 mb-8">
                            <li className="flex gap-3 text-slate-200"><CheckCircle2 size={20} className="text-emerald-400" /> Semua Fitur Gratis</li>
                            <li className="flex gap-3 text-slate-200"><CheckCircle2 size={20} className="text-emerald-400" /> Analisis IRT Mendalam</li>
                            <li className="flex gap-3 text-slate-200"><CheckCircle2 size={20} className="text-emerald-400" /> Akses Video Pembahasan</li>
                            <li className="flex gap-3 text-slate-200"><CheckCircle2 size={20} className="text-emerald-400" /> Masuk Papan Peringkat</li>
                        </ul>
                        <button onClick={onStart} className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold transition-colors shadow-lg shadow-emerald-500/25">Beli Sekarang</button>
                    </div>
                </div>
            </div>
       </div>

       {/* Footer */}
       <footer className="bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-12 px-6 text-center">
         <div className="flex justify-center items-center gap-2 font-black text-xl text-slate-900 dark:text-white mb-4">
           <GraduationCap className="text-emerald-500" />
           Dean's Lab
         </div>
         <p className="text-slate-400 text-sm">© 2026 Dean's Test Lab. Build with Ambition for Indonesia.</p>
       </footer>

    </div>
  );
};

export default LandingPage;