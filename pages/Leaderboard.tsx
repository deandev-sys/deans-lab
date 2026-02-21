import React, { useState, useEffect } from 'react';
import { Trophy, Medal, ChevronDown, Crown, Loader2, Users, Book } from 'lucide-react';
import { supabase } from '../src/lib/supabase';
import { User } from '../types';

interface LeaderboardEntry {
  id: string; // user_id
  rank?: number;
  name: string;
  school: string;
  score: number;
  avatar: string;
  avatarColor: string; // Ditambahkan untuk UI baru
}

interface LeaderboardProps {
  user?: User | null; // Menerima data user yang login untuk Sticky Bar
}

export const Leaderboard: React.FC<LeaderboardProps> = ({ user }) => {
  // --- STATE LOGIKA ASLI ---
  const [filter, setFilter] = useState<'weekly' | 'alltime'>('alltime');
  const [selectedPkg, setSelectedPkg] = useState<string>('all');
  const [packages, setPackages] = useState<{id: string, title: string}[]>([]);
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

  // --- AMBIL DATA KLASEMEN ---
  const fetchLeaderboard = async () => {
    setIsLoading(true);
    
    let filterStartDate = null;
    if (filter === 'weekly') {
      const lastWeek = new Date();
      lastWeek.setDate(lastWeek.getDate() - 7);
      filterStartDate = lastWeek.toISOString();
    }

    const filterPackageId = selectedPkg === 'all' ? null : selectedPkg;

    const { data: resultsData, error } = await supabase.rpc('get_leaderboard_data', {
      filter_package_id: filterPackageId,
      filter_start_date: filterStartDate
    });

    if (error) {
      console.error("Leaderboard Fetch Error:", error);
      setIsLoading(false);
      return;
    }

    if (resultsData) {
      const userBestScores = new Map<string, LeaderboardEntry>();
      
      // Array warna untuk variasi avatar (Dari UI AI)
      const colors = ["bg-blue-500", "bg-emerald-500", "bg-purple-500", "bg-rose-500", "bg-cyan-500", "bg-indigo-500", "bg-teal-500"];

      resultsData.forEach((result: any, index: number) => {
        const userId = result.user_id;
        const currentScore = result.total_score;
        
        if (!userBestScores.has(userId) || userBestScores.get(userId)!.score < currentScore) {
          const fullName = result.full_name || 'Pejuang PTN';
          const words = fullName.trim().split(' ');
          let avatar = 'PT';
          if (words.length >= 2) avatar = (words[0][0] + words[1][0]).toUpperCase();
          else if (fullName.length >= 2) avatar = fullName.substring(0, 2).toUpperCase();

          userBestScores.set(userId, {
            id: userId,
            name: fullName,
            school: result.school || 'Siswa Deans Lab',
            score: currentScore,
            avatar: avatar,
            avatarColor: colors[index % colors.length]
          });
        }
      });

      const sortedLeaderboard = Array.from(userBestScores.values())
        .sort((a, b) => b.score - a.score)
        .slice(0, 50)
        .map((entry, idx) => ({ ...entry, rank: idx + 1 })); // Inject rank manual
      
      setLeaderboard(sortedLeaderboard);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchLeaderboard();
  }, [filter, selectedPkg]); 

  // --- LOGIKA UI PODIUM & STICKY BAR ---
  const TopThree = leaderboard.slice(0, 3);
  const RestList = leaderboard.slice(3);

  // Cari posisi user yang sedang login di dalam klasemen
  const currentUserRankEntry = user ? leaderboard.find(entry => entry.id === user.id) : null;

  const getPodiumStyle = (rank: number) => {
    switch (rank) {
      case 1: return { 
        height: 'h-48 md:h-64', 
        color: 'border-yellow-400 bg-yellow-50 dark:bg-yellow-900/10 text-yellow-600 dark:text-yellow-400',
        icon: <Crown className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-500 fill-current animate-bounce" />
      };
      case 2: return { 
        height: 'h-40 md:h-52', 
        color: 'border-slate-300 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400',
        icon: <Medal className="w-6 h-6 sm:w-8 sm:h-8 text-slate-400" />
      };
      case 3: return { 
        height: 'h-32 md:h-44', 
        color: 'border-orange-300 bg-orange-50 dark:bg-orange-900/10 text-orange-600 dark:text-orange-400',
        icon: <Medal className="w-6 h-6 sm:w-8 sm:h-8 text-orange-400" />
      };
      default: return { height: 'h-32', color: '', icon: null };
    }
  };

  return (
    <div className="space-y-6 pb-24 md:pb-8 animate-fade-in relative">
      
      {/* 1. HEADER & FILTER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-[#1e3a8a] dark:text-white flex items-center gap-2">
            Peringkat Nasional <span className="text-4xl">🏆</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Buktikan kamu yang terbaik di antara pejuang PTN lainnya!
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Dropdown Paket Ujian */}
          <div className="relative min-w-[240px]">
             <div className="relative border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-xl flex items-center shadow-sm">
                <div className="pl-3 pr-1 text-[#1e3a8a] dark:text-slate-400">
                   <Book size={18} />
                </div>
                <select 
                  value={selectedPkg}
                  onChange={(e) => setSelectedPkg(e.target.value)}
                  // PERBAIKAN: bg-transparent diganti jadi bg-white dark:bg-slate-900 agar warna solid di mobile
                  className="w-full appearance-none bg-white dark:bg-slate-900 text-slate-900 dark:text-white py-3 pr-10 rounded-xl text-sm font-bold focus:outline-none focus:ring-0 cursor-pointer truncate"
                >
                  {/* PERBAIKAN: Tambah class warna terang/gelap tegas pada setiap option */}
                  <option value="all" className="bg-white text-slate-900 dark:bg-slate-800 dark:text-white font-medium">🏆 Semua Paket TO (Global)</option>
                  {packages.map(p => (
                     <option key={p.id} value={p.id} className="bg-white text-slate-900 dark:bg-slate-800 dark:text-white font-medium">{p.title}</option>
                  ))}
                </select>
                <ChevronDown size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
             </div>
          </div>

          {/* Toggle Waktu */}
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-xl w-full sm:w-auto justify-between">
            <button 
              onClick={() => setFilter('weekly')}
              className={`px-4 sm:px-6 py-2 rounded-lg text-sm font-bold transition-all flex-1 sm:flex-none ${filter === 'weekly' ? 'bg-white dark:bg-slate-700 text-[#1e3a8a] dark:text-emerald-400 shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}
            >
              Minggu Ini
            </button>
            <button 
              onClick={() => setFilter('alltime')}
              className={`px-4 sm:px-6 py-2 rounded-lg text-sm font-bold transition-all flex-1 sm:flex-none ${filter === 'alltime' ? 'bg-white dark:bg-slate-700 text-[#1e3a8a] dark:text-emerald-400 shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}
            >
              Semua Waktu
            </button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24">
           <Loader2 className="animate-spin text-[#1e3a8a] dark:text-emerald-500 mb-4" size={48} />
           <p className="font-bold text-slate-400 dark:text-slate-500 animate-pulse">Menghitung Peringkat Nasional...</p>
        </div>
      ) : leaderboard.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-12 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 animate-fade-in">
           <Users className="mx-auto text-slate-300 dark:text-slate-600 mb-4" size={64} />
           <h3 className="text-2xl font-black text-slate-700 dark:text-slate-200 mb-2">Papan Klasemen Kosong</h3>
           <p className="text-slate-400">Belum ada siswa yang menyelesaikan {selectedPkg === 'all' ? 'Try Out' : 'paket ini'}. Jadilah yang pertama!</p>
        </div>
      ) : (
        <>
          {/* 2. PODIUM TOP 3 */}
          <div className="flex items-end justify-center gap-2 sm:gap-4 mb-12 px-2 animate-fade-in">
            {/* Rank 2 */}
            <div className={`order-1 flex flex-col items-center w-1/3 max-w-[140px] md:max-w-[180px] transition-opacity duration-500 ${!TopThree[1] ? 'opacity-0' : 'opacity-100'}`}>
              {TopThree[1] && (
                <>
                  <div className="mb-2 text-center">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-4 border-slate-300 dark:border-slate-600 overflow-hidden shadow-lg mb-2 mx-auto">
                      <div className={`w-full h-full bg-slate-400 flex items-center justify-center text-white text-xl font-bold`}>{TopThree[1].avatar}</div>
                    </div>
                    <p className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white line-clamp-1">{TopThree[1].name}</p>
                    <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 line-clamp-1">{TopThree[1].school}</p>
                    <div className="mt-1 font-mono font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-xs inline-block">{TopThree[1].score}</div>
                  </div>
                  <div className={`w-full rounded-t-2xl flex flex-col items-center justify-start pt-4 border-t-4 shadow-sm ${getPodiumStyle(2).height} ${getPodiumStyle(2).color}`}>
                    <span className="text-4xl font-black opacity-50">2</span>
                  </div>
                </>
              )}
            </div>

            {/* Rank 1 */}
            <div className={`order-2 flex flex-col items-center w-1/3 max-w-[140px] md:max-w-[180px] z-10 -mb-2 transition-opacity duration-500 ${!TopThree[0] ? 'opacity-0' : 'opacity-100'}`}>
              {TopThree[0] && (
                <>
                  <div className="mb-2 text-center relative">
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 z-20">{getPodiumStyle(1).icon}</div>
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-yellow-400 overflow-hidden shadow-xl mb-2 mx-auto relative z-10">
                      <div className={`w-full h-full bg-yellow-500 flex items-center justify-center text-white text-2xl font-bold`}>{TopThree[0].avatar}</div>
                    </div>
                    <p className="font-bold text-sm sm:text-base text-slate-900 dark:text-white line-clamp-1">{TopThree[0].name}</p>
                    <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 line-clamp-1">{TopThree[0].school}</p>
                    <div className="mt-1 font-mono font-bold text-yellow-700 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30 px-3 py-1 rounded text-sm inline-block">{TopThree[0].score}</div>
                  </div>
                  <div className={`w-full rounded-t-2xl flex flex-col items-center justify-start pt-4 border-t-4 shadow-md ${getPodiumStyle(1).height} ${getPodiumStyle(1).color}`}>
                    <span className="text-5xl font-black opacity-50">1</span>
                  </div>
                </>
              )}
            </div>

            {/* Rank 3 */}
            <div className={`order-3 flex flex-col items-center w-1/3 max-w-[140px] md:max-w-[180px] transition-opacity duration-500 ${!TopThree[2] ? 'opacity-0' : 'opacity-100'}`}>
              {TopThree[2] && (
                <>
                  <div className="mb-2 text-center">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-4 border-orange-300 dark:border-orange-600 overflow-hidden shadow-lg mb-2 mx-auto">
                      <div className={`w-full h-full bg-orange-500 flex items-center justify-center text-white text-xl font-bold`}>{TopThree[2].avatar}</div>
                    </div>
                    <p className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white line-clamp-1">{TopThree[2].name}</p>
                    <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 line-clamp-1">{TopThree[2].school}</p>
                    <div className="mt-1 font-mono font-bold text-orange-700 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/30 px-2 py-0.5 rounded text-xs inline-block">{TopThree[2].score}</div>
                  </div>
                  <div className={`w-full rounded-t-2xl flex flex-col items-center justify-start pt-4 border-t-4 shadow-sm ${getPodiumStyle(3).height} ${getPodiumStyle(3).color}`}>
                    <span className="text-4xl font-black opacity-50">3</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* 3. DAFTAR PERINGKAT (Rank 4+) */}
          {RestList.length > 0 && (
            <div className="space-y-3 pb-8">
              {RestList.map((user) => (
                <div 
                  key={user.id}
                  className="flex items-center gap-4 p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group"
                >
                  {/* Rank Number */}
                  <div className="w-8 text-center font-bold text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors">
                      #{user.rank}
                  </div>
                  {/* Avatar */}
                  <div className={`w-10 h-10 rounded-full ${user.avatarColor} flex items-center justify-center text-white font-bold text-sm shadow-sm flex-shrink-0`}>
                      {user.avatar}
                  </div>
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base truncate">{user.name}</h4>
                      <p className="text-xs text-slate-500 truncate">{user.school}</p>
                  </div>
                  {/* Score */}
                  <div className="text-right">
                      <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-0.5">Skor IRT</span>
                      <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-lg">{user.score}</span>
                  </div>
                </div>
              ))}
              <div className="text-center py-4 text-sm text-slate-400">
                  Menampilkan Top 50 Nasional
              </div>
            </div>
          )}
        </>
      )}

      {/* 4. STICKY USER RANK */}
      {user && currentUserRankEntry && (
        <div className="fixed bottom-[60px] lg:bottom-0 left-0 right-0 z-30 lg:pl-64 animate-fade-in">
          <div className="bg-gradient-to-r from-[#1e3a8a] to-indigo-900 dark:from-slate-900 dark:to-indigo-950 text-white p-4 lg:p-6 shadow-[0_-4px_20px_rgba(0,0,0,0.2)] border-t border-white/10 flex items-center justify-between w-full backdrop-blur-md">
              <div className="flex items-center gap-4 max-w-7xl mx-auto w-full px-4">
                <div className="flex flex-col items-center justify-center w-12 h-12 bg-white/10 rounded-xl border border-white/20 backdrop-blur-sm">
                    <span className="text-[10px] font-bold opacity-80 uppercase">Rank</span>
                    <span className="text-xl font-bold">#{currentUserRankEntry.rank}</span>
                </div>
                <div className="flex-1">
                    <p className="font-bold text-sm sm:text-base">Posisi Kamu</p>
                    <p className="text-xs text-blue-200">
                      {currentUserRankEntry.rank === 1 ? 'Kamu berada di puncak! 👑' : 'Ayo push rank lagi! 🔥'}
                    </p>
                </div>
                <div className="text-right">
                    <span className="block text-[10px] font-bold text-blue-200 uppercase tracking-wide mb-0.5">Skor Terbaik</span>
                    <span className="font-mono font-bold text-2xl text-emerald-400">{currentUserRankEntry.score}</span>
                </div>
              </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Leaderboard;