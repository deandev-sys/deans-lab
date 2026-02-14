import React from 'react';
import { User, ExamResult } from '../types';
import { TrendingUp, Target, Award, ArrowRight, Activity, BookOpen, Clock } from 'lucide-react';

interface DashboardProps {
  user: User | null;
  results: ExamResult[];
  onNavigate: (page: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, results, onNavigate }) => {
  // Statistik Dasar (Dikalkulasi Otomatis dari Database)
  const totalExams = results.length;
  // --- PERBAIKAN: Menggunakan ?? agar nilai 0 tidak dianggap undefined/NaN ---
  const scores = results.map(r => (r as any).total_score ?? r.totalScore ?? 0);
  const highestScore = totalExams > 0 ? Math.max(...scores) : 0;
  const averageScore = totalExams > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / totalExams) : 0;

  // Data Grafik (Dibalik agar ujian tertua di kiri, terbaru di kanan)
  const chartData = [...results].reverse();

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-8 pb-24 animate-fade-in">
      {/* Header Welcome */}
      <div className="bg-[#1e3a8a] rounded-[2.5rem] p-8 md:p-12 text-white shadow-xl relative overflow-hidden">
         <div className="relative z-10">
            <h1 className="text-3xl md:text-4xl font-black mb-2">Halo, {user?.name?.split(' ')[0]}! 👋</h1>
            <p className="text-blue-200 md:text-lg">Selamat datang di pusat komando belajarmu. Mari hancurkan rekor hari ini!</p>
         </div>
         <Target className="absolute -right-10 -top-10 text-blue-800/50 w-64 h-64 z-0" />
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
         <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-6 transition-transform hover:-translate-y-1">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center shrink-0">
               <Award size={28} />
            </div>
            <div>
               <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Skor Tertinggi</p>
               <p className="text-3xl font-black text-slate-800">{highestScore}</p>
            </div>
         </div>
         <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-6 transition-transform hover:-translate-y-1">
            <div className="w-14 h-14 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center shrink-0">
               <Activity size={28} />
            </div>
            <div>
               <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Rata-rata Skor</p>
               <p className="text-3xl font-black text-slate-800">{averageScore}</p>
            </div>
         </div>
         <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-6 transition-transform hover:-translate-y-1">
            <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center shrink-0">
               <BookOpen size={28} />
            </div>
            <div>
               <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Try Out</p>
               <p className="text-3xl font-black text-slate-800">{totalExams}</p>
            </div>
         </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* Grafik Progres Dinamis */}
         <div className="lg:col-span-2 bg-white p-6 md:p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <div className="flex justify-between items-center mb-8">
               <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
                 <TrendingUp className="text-emerald-500" /> Grafik Progres
               </h2>
            </div>
            
            {totalExams >= 2 ? (
               <div className="flex items-end gap-2 md:gap-4 h-56 mt-6 pb-2 border-b-2 border-slate-100">
                  {chartData.map((res, idx) => {
                     // --- PERBAIKAN DI SINI JUGA ---
                     const score = (res as any).total_score ?? res.totalScore ?? 0;
                     // Kalkulasi tinggi batang (minimal 5% agar selalu terlihat meski skor kecil/nol)
                     const heightPercent = Math.max((score / 1000) * 100, 5); 
                     
                     return (
                        <div key={idx} className="flex-1 flex flex-col items-center gap-3 group h-full justify-end">
                           <div className="w-full bg-slate-50 rounded-t-xl relative h-full flex items-end overflow-visible">
                              <div 
                                className="w-full bg-[#1e3a8a] rounded-t-xl transition-all duration-700 relative group-hover:bg-blue-500 shadow-sm" 
                                style={{ height: `${heightPercent}%` }}
                              >
                                 {/* Tooltip Hover */}
                                 <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs font-bold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none shadow-xl">
                                    Skor: {score}
                                 </div>
                              </div>
                           </div>
                           <p className="text-[10px] font-bold text-slate-400 truncate w-full text-center uppercase">TO {idx + 1}</p>
                        </div>
                     )
                  })}
               </div>
            ) : (
               <div className="h-56 flex flex-col items-center justify-center text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                  <Activity className="text-slate-300 mb-3" size={40} />
                  <p className="text-slate-500 font-bold">Data Belum Cukup</p>
                  <p className="text-sm text-slate-400 mt-1 max-w-xs">Kerjakan minimal 2 Try Out untuk melihat grafik perkembangan nilaimu.</p>
               </div>
            )}
         </div>

         {/* Recent History List */}
         <div className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col h-full">
            <div className="flex justify-between items-center mb-8">
               <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
                 <Clock className="text-orange-500" /> Riwayat Terakhir
               </h2>
               <button onClick={() => onNavigate('history')} className="text-sm font-bold text-blue-600 hover:text-blue-800">Lihat Semua</button>
            </div>

            <div className="space-y-4 flex-1">
               {results.length > 0 ? results.slice(0, 4).map((r, idx) => (
                  <div key={r.id || idx} className="p-4 bg-slate-50 rounded-2xl flex items-center justify-between border border-slate-100 hover:border-blue-200 transition-colors cursor-pointer group" onClick={() => onNavigate('history')}>
                     <div>
                        <p className="font-bold text-slate-700 text-sm truncate max-w-[150px] sm:max-w-[200px] group-hover:text-[#1e3a8a] transition-colors">{(r as any).package_title || r.packageTitle}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">{r.date || new Date((r as any).created_at).toLocaleDateString()}</p>
                     </div>
                     <div className="bg-white px-3 py-1.5 rounded-xl border border-slate-200 font-black text-emerald-500 text-sm shadow-sm">
                        {/* --- PERBAIKAN DI SINI JUGA --- */}
                        {(r as any).total_score ?? r.totalScore ?? 0}
                     </div>
                  </div>
               )) : (
                  <div className="text-center py-10">
                     <p className="text-slate-400 font-medium text-sm">Belum ada riwayat ujian.</p>
                     <button onClick={() => onNavigate('catalog')} className="mt-4 px-6 py-2 bg-[#1e3a8a] text-white text-xs font-black uppercase rounded-xl hover:bg-blue-800 transition-colors shadow-lg">Kerjakan Sekarang</button>
                  </div>
               )}
            </div>
         </div>
      </div>
    </div>
  );
};

export default Dashboard;