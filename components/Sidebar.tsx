
import React from 'react';
import { Home, BookOpen, Clock, User, LogOut, ShieldAlert, Award, Trophy } from 'lucide-react';

interface SidebarProps {
  user: any;
  currentPath: string;
  onNavigate: (path: string) => void;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ user, currentPath, onNavigate, onLogout }) => {
  const navItems = [
    { label: 'Beranda', icon: Home, path: 'dashboard' },
    { label: 'Katalog TO', icon: BookOpen, path: 'catalog' },
    { label: 'Peringkat', icon: Trophy, path: 'leaderboard' },
    { label: 'Riwayat Ujian', icon: Clock, path: 'history' },
    { label: 'Profil Saya', icon: User, path: 'profile' },
  ];

  if (user?.role === 'admin') {
    navItems.push({ label: 'Admin Panel', icon: ShieldAlert, path: 'admin' });
  }

  return (
    <aside className="w-64 h-full bg-[#1e3a8a] text-white flex flex-col shrink-0">
      <div className="p-6">
        <div className="flex items-center gap-2 font-bold text-xl mb-8">
          <Award className="text-emerald-400" />
          <span>Dean's Lab</span>
        </div>
        
        <nav className="space-y-2">
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => onNavigate(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                currentPath === item.path 
                ? 'bg-[#1e40af] text-emerald-400' 
                : 'hover:bg-[#1e40af] text-slate-300'
              }`}
            >
              <item.icon size={20} />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>
      </div>

      <div className="mt-auto p-6">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-slate-300 hover:text-white transition-colors"
        >
          <LogOut size={20} />
          <span>Keluar</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
