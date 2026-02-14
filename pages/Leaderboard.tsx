import React, { useState, useEffect } from 'react';
import { Trophy, Medal, Star, Filter, Loader2, Users, Book } from 'lucide-react';
import { supabase } from '../src/lib/supabase';

interface LeaderboardEntry {
  id: string; // user_id
  rank?: number;
  name: string;
  school: string;
  score: number;
  avatar: string;
}

const Leaderboard: React.FC = () => {
  const [filter, setFilter] = useState<'weekly' | 'alltime'>('alltime');
  const [selectedPkg, setSelectedPkg] = useState<string>('all'); // <--- STATE FILTER PAKET
  const [packages, setPackages] = useState<{id: string, title: string}[]>([]); // <--- STATE DAFTAR PAKET
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- AMBIL DAFTAR PAKET UNTUK DROPDOWN ---
  useEffect(() => {
    const fetchPackageList = async () => {
      const { data } = await supabase.from('packages').select('id, title').order('created_at', { ascending: false });
      if (data) setPackages(data);
    };
    fetchPackageList();
  }, []);

  const fetchLeaderboard = async () => {
    setIsLoading(true);
    
    // 1. Ambil data hasil ujian
    let query = supabase.from('exam_results').select('user_id, total_score, created_at, package_id');
    
    // Filter Waktu
    if (filter === 'weekly') {
      const lastWeek = new Date();
      lastWeek.setDate(lastWeek.getDate() - 7);
      query = query.gte('created_at', lastWeek.toISOString());
    }

    // --- LOGIKA BARU: Filter Paket ---
    if (selectedPkg !== 'all') {
      query = query.eq('package_id', selectedPkg);
    }
    
    const { data: resultsData } = await query;
    
    // 2. Ambil data nama profil user beserta asal sekolah
    const { data: profilesData } = await supabase.from('profiles').select('id, full_name, school');

    if (resultsData && profilesData) {
      // Map untuk lookup nama dan sekolah dengan cepat
      const profileMap = new Map();
      profilesData.forEach(p => profileMap.set(p.id, { name: p.full_name, school: p.school }));

      // Map untuk mencari skor TERTINGGI dari masing-masing user
      const userBestScores = new Map<string, LeaderboardEntry>();
      
      resultsData.forEach(result => {
        const userId = result.user_id;
        const currentScore = result.total_score;
        
        // Jika user belum ada di map, ATAU skor saat ini lebih tinggi
        if (!userBestScores.has(userId) || userBestScores.get(userId)!.score < currentScore) {
          const userProfile = profileMap.get(userId) || { name: 'Pejuang PTN', school: 'Siswa Deans Lab' };
          const fullName = userProfile.name || 'Pejuang PTN';
          
          // Generate Avatar (2 huruf depan)
          const words = fullName.trim().split(' ');
          let avatar = 'PT';
          if (words.length >= 2) {
            avatar = (words[0][0] + words[1][0]).toUpperCase();
          } else if (fullName.length >= 2) {
            avatar = fullName.substring(0, 2).toUpperCase();
          }

          userBestScores.set(userId, {
            id: userId,
            name: fullName,
            school: userProfile.school || 'Siswa Deans Lab', // Menggunakan sekolah dari profil dinamis
            score: currentScore,
            avatar: avatar
          });
        }
      });

      // 3. Ubah map jadi array, urutkan dari yang terbesar, ambil Top 50
      const sortedLeaderboard = Array.from(userBestScores.values())
        .sort((a, b) => b.score - a.score)
        .slice(0, 50);
      
      setLeaderboard(sortedLeaderboard);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchLeaderboard();
  }, [filter, selectedPkg]); // <--- FETCH ULANG KALAU FILTER PAKET DIGANTI

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto pb-24">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-black text-[#1e3a8a] flex items-center gap-3">
            <Trophy className="text-emerald-500" />
            Peringkat Nasional 🇮🇩
          </h1>
          <p className="text-slate-500 mt-1">Bersainglah dengan puluhan ribu ambis lainnya!</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          {/* --- UI DROPDOWN FILTER PAKET BARU --- */}
          <div className="bg-white border border-slate-200 p-1.5 rounded-2xl flex items-center shadow-sm w-full sm:w-auto">
             <div className="pl-3 pr-1 text-[#1e3a8a]">
                <Book size={18} />
             </div>
             <select 
               value={selectedPkg}
               onChange={(e) => setSelectedPkg(e.target.value)}
               className="bg-transparent text-sm font-bold text-slate-600 outline-none pr-4 py-2 w-full sm:w-48 cursor-pointer appearance-none"
             >
                <option value="all">🏆 Semua Paket TO (Global)</option>
                {packages.map(p => (
                   <option key={p.id} value={p.id}>{p.title}</option>
                ))}
             </select>
          </div>

          <div className="flex bg-slate-100 p-1.5 rounded-2xl w-full sm:w-auto justify-between">
            <button 
              onClick={() => setFilter('weekly')}
              className={`px-4 sm:px-6 py-2 rounded-xl text-sm font-bold transition-all flex-1 sm:flex-none ${filter === 'weekly' ? 'bg-white text-[#1e3a8a] shadow-sm' : 'text-slate-500'}`}
            >
              Minggu Ini
            </button>
            <button 
              onClick={() => setFilter('alltime')}
              className={`px-4 sm:px-6 py-2 rounded-xl text-sm font-bold transition-all flex-1 sm:flex-none ${filter === 'alltime' ? 'bg-white text-[#1e3a8a] shadow-sm' : 'text-slate-500'}`}
            >
              Semua Waktu
            </button>
          </div>
        </div>
      </header>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20">
           <Loader2 className="animate-spin text-[#1e3a8a] mb-4" size={48} />
           <p className="font-bold text-slate-400 animate-pulse">Menghitung Peringkat Nasional...</p>
        </div>
      ) : leaderboard.length === 0 ? (
        <div className="bg-white rounded-[3rem] p-12 text-center border-2 border-dashed border-slate-200">
           <Users className="mx-auto text-slate-300 mb-4" size={64} />
           <h3 className="text-2xl font-black text-slate-700 mb-2">Papan Klasemen Kosong</h3>
           <p className="text-slate-400">Belum ada siswa yang menyelesaikan {selectedPkg === 'all' ? 'Try Out' : 'paket ini'}. Jadilah yang pertama!</p>
        </div>
      ) : (
        <>
          {/* Top 3 Visuals Podium */}
          <div className="grid grid-cols-3 gap-4 mb-12 items-end">
            {/* Rank 2 */}
            <div className={`flex flex-col items-center transition-opacity duration-500 ${!leaderboard[1] ? 'opacity-0' : 'opacity-100'}`}>
              <div className="w-16 h-16 md:w-20 md:h-20 bg-slate-200 rounded-full mb-3 flex items-center justify-center font-black text-[#1e3a8a] border-4 border-white shadow-lg z-10">{leaderboard[1]?.avatar}</div>
              <div className="h-24 md:h-32 bg-slate-100 w-full rounded-t-3xl flex flex-col items-center justify-center p-4 border-x-2 border-t-2 border-slate-200 relative -mt-6 pt-8">
                 <Medal className="text-slate-400 mb-1" size={20} />
                 <p className="font-black text-slate-800 text-sm md:text-base truncate w-full text-center">{leaderboard[1]?.name.split(' ')[0]}</p>
                 <p className="font-black text-[#1e3a8a] text-lg">{leaderboard[1]?.score}</p>
              </div>
            </div>
            {/* Rank 1 */}
            <div className={`flex flex-col items-center scale-110 -translate-y-2 transition-opacity duration-500 ${!leaderboard[0] ? 'opacity-0' : 'opacity-100'}`}>
              <div className="w-20 h-20 md:w-24 md:h-24 bg-emerald-100 rounded-full mb-3 flex items-center justify-center font-black text-emerald-600 border-4 border-white shadow-xl relative z-10">
                {leaderboard[0]?.avatar}
                <div className="absolute -top-4 bg-yellow-400 p-1.5 rounded-full shadow-lg">
                   <Trophy size={16} className="text-white" />
                </div>
              </div>
              <div className="h-32 md:h-44 bg-emerald-500 w-full rounded-t-3xl flex flex-col items-center justify-center p-4 shadow-lg shadow-emerald-100 relative -mt-6 pt-8">
                 <Star className="text-white mb-1" fill="white" size={20} />
                 <p className="font-black text-emerald-100 text-sm md:text-base truncate w-full text-center">{leaderboard[0]?.name.split(' ')[0]}</p>
                 <p className="font-black text-white text-xl md:text-3xl">{leaderboard[0]?.score}</p>
              </div>
            </div>
            {/* Rank 3 */}
            <div className={`flex flex-col items-center transition-opacity duration-500 ${!leaderboard[2] ? 'opacity-0' : 'opacity-100'}`}>
              <div className="w-16 h-16 md:w-20 md:h-20 bg-orange-100 rounded-full mb-3 flex items-center justify-center font-black text-orange-600 border-4 border-white shadow-lg z-10">{leaderboard[2]?.avatar}</div>
              <div className="h-20 md:h-28 bg-orange-50 w-full rounded-t-3xl flex flex-col items-center justify-center p-4 border-x-2 border-t-2 border-orange-100 relative -mt-6 pt-6">
                 <Medal className="text-orange-300 mb-1" size={20} />
                 <p className="font-black text-orange-800 text-xs md:text-sm truncate w-full text-center">{leaderboard[2]?.name.split(' ')[0]}</p>
                 <p className="font-black text-orange-600 text-base md:text-lg">{leaderboard[2]?.score}</p>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden animate-fade-in">
             <div className="overflow-x-auto">
               <table className="w-full min-w-[500px]">
                  <thead className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
                     <tr>
                        <th className="px-6 py-5 text-left w-20">RANK</th>
                        <th className="px-6 py-5 text-left">NAMA & SEKOLAH</th>
                        <th className="px-6 py-5 text-right">SKOR IRT</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                     {leaderboard.map((item, idx) => (
                       <tr key={item.id} className="hover:bg-slate-50 transition-colors group">
                          <td className="px-6 py-5">
                             <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm transition-all group-hover:scale-110 ${idx === 0 ? 'bg-yellow-100 text-yellow-600' : idx === 1 ? 'bg-slate-200 text-slate-600' : idx === 2 ? 'bg-orange-100 text-orange-600' : 'bg-slate-50 text-slate-400 group-hover:bg-[#1e3a8a] group-hover:text-white'}`}>
                                {idx + 1}
                             </span>
                          </td>
                          <td className="px-6 py-5">
                             <div className="flex items-center gap-4">
                                <div className="hidden sm:flex w-10 h-10 rounded-full bg-blue-50 text-[#1e3a8a] items-center justify-center font-bold text-xs">
                                   {item.avatar}
                                </div>
                                <div>
                                   <p className="font-bold text-slate-800">{item.name}</p>
                                   <p className="text-xs text-slate-400 font-medium">{item.school}</p>
                                </div>
                             </div>
                          </td>
                          <td className="px-6 py-5 text-right">
                             <span className="font-black text-emerald-500 text-lg md:text-xl">{item.score}</span>
                          </td>
                       </tr>
                     ))}
                  </tbody>
               </table>
             </div>
             <div className="p-6 text-center border-t bg-slate-50/50">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center justify-center gap-2">
                   <Filter size={14} /> Peringkat dikalkulasi secara Real-Time berdasarkan {selectedPkg === 'all' ? 'semua paket' : 'paket yang dipilih'}
                </p>
             </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Leaderboard;