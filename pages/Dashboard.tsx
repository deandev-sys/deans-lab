import React from 'react';
import { User, ExamResult } from '../types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Trophy, TrendingUp, Calendar, ChevronRight } from 'lucide-react';

interface DashboardProps {
  user: User | null;
  results: ExamResult[];
  onNavigate: (page: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ user, results, onNavigate }) => {
  // --- STATISTIK DASAR (Dari Kode Asli Lu) ---
  const totalExams = results.length;
  const scores = results.map(r => (r as any).total_score ?? (r as any).totalScore ?? 0);
  const highestScore = totalExams > 0 ? Math.max(...scores) : 0;
  const averageScore = totalExams > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / totalExams) : 0;

  // --- DATA GRAFIK RECHARTS ---
  // Dibalik agar ujian tertua di kiri, terbaru di kanan
  const chartData = [...results].reverse().map((r, idx) => ({
     name: `TO ${idx + 1}`,
     score: (r as any).total_score ?? (r as any).totalScore ?? 0
  }));

  // Helper untuk menentukan status lencana (Badge)
  const getScoreStatus = (score: number) => {
     if (score >= 700) return 'Mantap';
     if (score >= 500) return 'Oke';
     return 'Cukup';
  };

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      {/* 1. Welcome Banner */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-900 dark:to-teal-900 rounded-3xl p-8 text-white relative overflow-hidden shadow-lg">
        <div className="relative z-10">
            <h1 className="text-3xl font-bold mb-2">Halo, {user?.name?.split(' ')[0] || 'Pejuang PTN'}! 👋</h1>
            <p className="text-emerald-100 max-w-lg">
              {totalExams > 0 
                ? "Progresmu terekam dengan baik. Terus pertahankan konsistensimu, sedikit lagi menuju kampus impian! Gass pol teruss!" 
                : "Selamat datang di pusat komando belajarmu. Yuk mulai kerjakan Try Out pertamamu hari ini!"}
            </p>
        </div>
        <div className="absolute right-0 top-0 h-full w-1/3 bg-white/10 skew-x-12 transform translate-x-12"></div>
      </div>

      {/* 2. Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-start justify-between group hover:border-emerald-500/50 transition-colors">
            <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Skor Tertinggi</p>
                <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white">{highestScore}</h3>
            </div>
            <div className="p-3 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-xl group-hover:scale-110 transition-transform">
                <Trophy size={24} />
            </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-start justify-between group hover:border-emerald-500/50 transition-colors">
            <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Rata-rata Skor</p>
                <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white">{averageScore}</h3>
            </div>
             <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl group-hover:scale-110 transition-transform">
                <TrendingUp size={24} />
            </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-start justify-between group hover:border-emerald-500/50 transition-colors">
            <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Total Try Out</p>
                <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white">{totalExams}</h3>
            </div>
             <div className="p-3 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-xl group-hover:scale-110 transition-transform">
                <Calendar size={24} />
            </div>
        </div>
      </div>

      {/* 3. Charts & History Section */}
      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Grafik Area Recharts */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Grafik Progres Skor IRT</h3>
            </div>
            
            {totalExams >= 2 ? (
              <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData}>
                          <defs>
                              <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                              </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:stroke-slate-800" />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                          <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} domain={[0, 1000]} />
                          <Tooltip 
                              contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff' }}
                              itemStyle={{ color: '#10b981', fontWeight: 'bold' }}
                              cursor={{ stroke: '#10b981', strokeWidth: 1, strokeDasharray: '4 4' }}
                          />
                          <Area type="monotone" dataKey="score" name="Skor" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
                      </AreaChart>
                  </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[300px] w-full flex flex-col items-center justify-center text-center bg-slate-50 dark:bg-slate-800/50 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                 <TrendingUp className="text-slate-300 dark:text-slate-500 mb-3" size={40} />
                 <p className="text-slate-500 dark:text-slate-400 font-bold">Data Belum Cukup</p>
                 <p className="text-sm text-slate-400 mt-1 max-w-xs">Kerjakan minimal 2 Try Out untuk melihat grafik perkembangan nilaimu.</p>
              </div>
            )}
        </div>

        {/* Riwayat Terbaru */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Riwayat Terbaru</h3>
            <div className="space-y-4 flex-1">
                {results.length > 0 ? results.slice(0, 4).map((r, i) => {
                    const score = (r as any).total_score ?? (r as any).totalScore ?? 0;
                    const status = getScoreStatus(score);
                    
                    return (
                      <div key={r.id || i} onClick={() => onNavigate('history')} className="flex items-center justify-between p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl transition-colors cursor-pointer group">
                          <div className="pr-4">
                              <p className="font-semibold text-sm text-slate-900 dark:text-slate-200 group-hover:text-emerald-500 transition-colors line-clamp-1">
                                {(r as any).package_title || (r as any).packageTitle}
                              </p>
                              <p className="text-xs text-slate-500 mt-0.5">{r.date || new Date((r as any).created_at).toLocaleDateString('id-ID')}</p>
                          </div>
                          <div className="text-right flex-shrink-0">
                               <div className="font-black text-slate-900 dark:text-white text-base">{score}</div>
                               <div className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block mt-1 uppercase tracking-wider
                                  ${status === 'Mantap' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' : 
                                    status === 'Oke' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' :
                                    'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400'}
                               `}>
                                  {status}
                               </div>
                          </div>
                      </div>
                    )
                }) : (
                   <div className="flex flex-col items-center justify-center h-full text-center py-10 opacity-60">
                      <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">Belum ada riwayat ujian.</p>
                   </div>
                )}
            </div>
            
            {results.length > 0 && (
              <button onClick={() => onNavigate('history')} className="w-full mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-center gap-2 text-sm font-semibold text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  Lihat Semua Riwayat <ChevronRight size={16} />
              </button>
            )}
        </div>

      </div>
    </div>
  );
};

export default Dashboard;