import React, { useState } from 'react';
import { 
  LayoutDashboard, BookOpen, History, User as UserIcon, Moon, Sun, 
  Menu, LogOut, GraduationCap, Trophy, PlayCircle, ShieldAlert, Crown 
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  user: any; 
  currentPath: string; 
  onNavigate: (path: string) => void;
  onLogout: () => void; 
  toggleTheme: () => void;
  isDark: boolean;
}

export const Layout: React.FC<LayoutProps> = ({ 
  children, user, currentPath, onNavigate, onLogout, toggleTheme, isDark 
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Jika sedang ujian, jangan tampilkan sidebar (fullscreen)
  const isExamMode = currentPath === 'exam';
  if (isExamMode) {
    return <main className="min-h-screen w-full bg-white dark:bg-slate-950">{children}</main>;
  }

  // Komponen Helper untuk Menu Navigasi Biasa
  const NavItem = ({ path, icon: Icon, label }: { path: string; icon: React.ElementType; label: string }) => {
    const isActive = currentPath === path;
    return (
      <button
        onClick={() => {
            onNavigate(path);
            setIsSidebarOpen(false);
        }}
        className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all duration-200 group
          ${isActive 
            ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 font-semibold shadow-sm' 
            : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
      >
        <Icon size={22} className={`${isActive ? 'stroke-current' : 'group-hover:text-slate-700 dark:group-hover:text-slate-200'}`} />
        <span className="text-sm font-medium">{label}</span>
      </button>
    );
  };

  // Mengambil huruf pertama nama untuk Avatar
  const userInitials = user?.name?.charAt(0).toUpperCase() || 'U';

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-slate-950 transition-colors duration-300">
      
      {/* ========================================== */}
      {/* DESKTOP SIDEBAR (Sisi Kiri)                  */}
      {/* ========================================== */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transform transition-transform duration-300 lg:translate-x-0 lg:static lg:block ${isSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          {/* Logo Brand */}
          <div className="p-6 flex items-center gap-3 border-b border-slate-100 dark:border-slate-800">
            <div className="bg-emerald-500 p-2 rounded-lg text-white">
                <GraduationCap size={24} />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-[#1e3a8a] dark:text-white">Dean's Lab</h1>
          </div>

          {/* List Menu Navigasi Terjahit */}
          <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto custom-scrollbar">
            <NavItem path="dashboard" icon={LayoutDashboard} label="Beranda" />
            <NavItem path="catalog" icon={BookOpen} label="Katalog TO" />
            <NavItem path="leaderboard" icon={Trophy} label="Peringkat" />
            <NavItem path="video_pembahasan" icon={PlayCircle} label="Video Bahas" />
            <NavItem path="history" icon={History} label="Riwayat Ujian" />
            
            {/* MENU SPESIAL: BERLANGGANAN VIP */}
            <button
              onClick={() => {
                  onNavigate('subscription');
                  setIsSidebarOpen(false);
              }}
              className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all duration-200 group my-2 border
                ${currentPath === 'subscription'
                  ? 'bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-yellow-200 dark:border-yellow-700/50 text-yellow-700 dark:text-yellow-400 font-bold shadow-sm'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:bg-yellow-50 dark:hover:bg-yellow-900/10 hover:text-yellow-600 dark:hover:text-yellow-500'
                }`}
            >
              <Crown size={22} className={`${currentPath === 'subscription' ? 'stroke-current' : 'group-hover:text-yellow-600 dark:group-hover:text-yellow-500'}`} />
              <span className="text-sm font-medium">Berlangganan VIP</span>
            </button>
            {/* END MENU SPESIAL */}

            <NavItem path="profile" icon={UserIcon} label="Profil Saya" />
            
            {/* LOGIKA ASLI: Cek Admin Panel */}
            {user?.role === 'admin' && (
               <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
                  <NavItem path="admin" icon={ShieldAlert} label="Admin Panel" />
               </div>
            )}
          </nav>

          {/* Tombol Logout */}
          <div className="p-4 border-t border-slate-100 dark:border-slate-800">
             <button onClick={onLogout} className="flex items-center gap-3 w-full px-4 py-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-colors text-sm font-medium">
                <LogOut size={20} />
                <span>Keluar</span>
             </button>
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay (Gelap dibelakang menu) */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 z-40 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* ========================================== */}
      {/* MAIN CONTENT AREA (Kanan / Tengah)           */}
      {/* ========================================== */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        
        {/* TOP HEADER */}
        <header className="h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 lg:px-8 z-30 sticky top-0 shrink-0">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
            >
              <Menu size={24} />
            </button>
            <h2 className="text-lg font-bold lg:hidden text-[#1e3a8a] dark:text-white capitalize">
              {currentPath.replace('_', ' ')}
            </h2>
          </div>

          <div className="flex items-center gap-4">
             {/* Tombol VIP Akses Cepat di Header (Opsional, khusus layar besar) */}
             <button
               onClick={() => onNavigate('subscription')}
               className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-yellow-200 dark:hover:bg-yellow-900/50 transition-colors"
             >
               <Crown size={14} /> VIP
             </button>

             {/* Tombol Dark Mode */}
             <button
              onClick={toggleTheme}
              className="p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
             >
                {isDark ? <Sun size={20} /> : <Moon size={20} />}
             </button>
             
             {/* Profil Avatar (Diambil dari props user) */}
             <div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => onNavigate('profile')}>
               <span className="hidden md:block text-sm font-bold text-slate-700 dark:text-slate-300">
                  {user?.name?.split(' ')[0] || 'User'}
               </span>
               <div className="h-9 w-9 rounded-full bg-[#1e3a8a] dark:bg-emerald-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                  {userInitials}
               </div>
             </div>
          </div>
        </header>

        {/* CONTAINER KONTEN HALAMAN */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8 pb-24 lg:pb-8 scroll-smooth relative custom-scrollbar">
          <div className="max-w-6xl mx-auto w-full">
            {children}
          </div>
        </main>

        {/* ========================================== */}
        {/* MOBILE BOTTOM NAVIGATION                     */}
        {/* ========================================== */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-around px-2 py-2 z-40 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
            {[
              { id: 'dashboard', icon: LayoutDashboard, label: 'Beranda' },
              { id: 'catalog', icon: BookOpen, label: 'Katalog' },
              { id: 'subscription', icon: Crown, label: 'VIP Pass' }, // Ditambahkan di menu tengah bawah!
              { id: 'history', icon: History, label: 'Riwayat' }
            ].map((item) => (
               <button 
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-colors 
                    ${currentPath === item.id 
                      ? (item.id === 'subscription' ? 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20' : 'text-[#1e3a8a] dark:text-emerald-400 bg-blue-50 dark:bg-emerald-500/10') 
                      : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
               >
                  <item.icon size={20} className={currentPath === item.id ? "fill-current/20" : ""} />
                  <span className="text-[10px] font-bold">{item.label}</span>
               </button>
            ))}
        </div>
      </div>
    </div>
  );
};