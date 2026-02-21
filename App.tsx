import React, { useState, useEffect } from 'react';
import { ExamPackage, ExamSession, UserResponse, ExamResult, User } from './types';
import { calculateIRTScore, getAnalysisBySubject } from './services/irtService';
import CBTInterface from './components/CBTInterface';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import Catalog from './pages/Catalog';
import Results from './pages/Results';
import AdminPanel from './pages/Admin';
import Profile from './pages/Profile';
import Subscription from './pages/Subscription';
import Toast, { ToastType } from './components/Toast';
import { supabase } from './src/lib/supabase';
import { Lock } from 'lucide-react';
import { MOCK_EXAM_PACKAGES } from './constants';

// --- KOMPONEN BARU DARI AI ---
import { Layout } from './components/Layout';
// Halaman baru (nanti dijahit di fase berikutnya)
import { Leaderboard } from './pages/Leaderboard';
import { VideoPembahasan } from './pages/VideoPembahasan';

const App: React.FC = () => {
  // ==========================================
  // STATE ASLI DARI KODE SUMBER LU
  // ==========================================
  const [currentPage, setCurrentPage] = useState<string>('landing');
  const [user, setUser] = useState<User | null>(null);
  const [activeSession, setActiveSession] = useState<ExamSession | null>(null);
  const [results, setResults] = useState<ExamResult[]>([]);
  const [packages, setPackages] = useState<ExamPackage[]>([]);
  const [viewingResult, setViewingResult] = useState<ExamResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("Menyiapkan Amunisi..."); 
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  // ==========================================
  // STATE & FUNGSI DARK MODE BARU (DARI UI AI)
  // ==========================================
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setIsDark(true);
    }
  }, []);

  useEffect(() => {
    const html = document.documentElement;
    if (isDark) {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark((prev) => !prev);

  const showToast = (message: string, type: ToastType = 'success') => {
    setToast({ message, type });
  };

  // ==========================================
  // LOGIKA SUPABASE & APLIKASI ASLI 100% UTUH
  // ==========================================
  const fetchFullPackageData = async (pkgId: string) => {
    const { data, error } = await supabase.from('packages').select('*, subtests(*), questions(*)').eq('id', pkgId).single();
    if (error || !data) return null;

    let subtests = [];
    if (data.subtests && data.subtests.length > 0) {
      const sortedSubtests = data.subtests.sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
      subtests = sortedSubtests.map((st: any) => ({
        id: st.id, title: st.title, durationMinutes: st.duration_minutes,
        questions: data.questions.filter((q: any) => q.subject === st.title).map((q: any) => {
          const formattedChoices = q.choices ? Object.entries(q.choices).map(([id, text]) => ({ id, text: text as string })) : [];
          return { ...q, text: q.question_text, id: q.id.toString(), choices: formattedChoices, correctAnswer: q.correct_answer, imageUrl: q.image_url };
        })
      }));
    } else {
      const subjects = [...new Set(data.questions?.map((q: any) => q.subject) || [])];
      subtests = subjects.map((subjectName: any) => ({
        id: `${data.id}-${subjectName}`, title: subjectName, durationMinutes: 30,
        questions: data.questions.filter((q: any) => q.subject === subjectName).map((q: any) => {
          const formattedChoices = q.choices ? Object.entries(q.choices).map(([id, text]) => ({ id, text: text as string })) : [];
          return { ...q, text: q.question_text, id: q.id.toString(), choices: formattedChoices, correctAnswer: q.correct_answer, imageUrl: q.image_url };
        })
      }));
    }
    return { ...data, isPremium: data.is_premium, packageType: data.package_type || 'FULL', subject: data.subject || 'ALL', topic: data.topic || 'Campuran', subtests: subtests };
  };

  const fetchActiveSession = async (userId: string) => {
    const { data, error } = await supabase.from('active_sessions').select('session_data').eq('user_id', userId).single();
    let sessionToRestore = null;
    if (data && data.session_data) {
       sessionToRestore = data.session_data;
       localStorage.setItem('deans_active_session', JSON.stringify(data.session_data));
       showToast('Sesi ujian sebelumnya dipulihkan!', 'info');
    } else {
       const savedSession = localStorage.getItem('deans_active_session');
       if (savedSession) sessionToRestore = JSON.parse(savedSession);
    }

    if (sessionToRestore) {
       setLoadingText("Mengunduh Ulang Soal...");
       setIsLoading(true);
       let fullPkg = await fetchFullPackageData(sessionToRestore.packageId);
       if (!fullPkg) fullPkg = MOCK_EXAM_PACKAGES.find(p => p.id === sessionToRestore.packageId); 
       if (fullPkg) {
          setPackages(prev => {
            const exists = prev.find(p => p.id === fullPkg.id);
            if (exists) return prev.map(p => p.id === fullPkg.id ? fullPkg : p);
            return [...prev, fullPkg];
          });
          setActiveSession(sessionToRestore);
          setCurrentPage('exam');
       }
       setIsLoading(false);
       setLoadingText("Menyiapkan Amunisi...");
    }
  };

  const syncSessionToCloud = async (session: ExamSession, currentUserId: string) => {
    await supabase.from('active_sessions').upsert({ user_id: currentUserId, session_data: session, updated_at: new Date().toISOString() });
  };

  const fetchPackages = async () => {
    setIsLoading(true);
    const { data, error } = await supabase.from('packages').select('*, subtests(id, title, duration_minutes, created_at), questions(id, subject)');
    if (data) {
      const formattedPackages = data.map((pkg: any) => {
        let subtests = [];
        if (pkg.subtests && pkg.subtests.length > 0) {
          const sortedSubtests = pkg.subtests.sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
          subtests = sortedSubtests.map((st: any) => ({
            id: st.id, title: st.title, durationMinutes: st.duration_minutes,
            questions: pkg.questions ? pkg.questions.filter((q:any) => q.subject === st.title) : [] 
          }));
        } else {
          const subjects = [...new Set(pkg.questions?.map((q: any) => q.subject) || [])];
          subtests = subjects.map((subjectName: any) => ({
             id: `${pkg.id}-${subjectName}`, title: subjectName, durationMinutes: 30,
             questions: pkg.questions ? pkg.questions.filter((q:any) => q.subject === subjectName) : []
          }));
        }
        return { ...pkg, isPremium: pkg.is_premium, packageType: pkg.package_type || 'FULL', subject: pkg.subject || 'ALL', topic: pkg.topic || 'Campuran', lynkUrl: pkg.lynk_url, subtests: subtests };
      });
      setPackages(formattedPackages);
    }
    if (error) showToast("Gagal memuat katalog: " + error.message, "error");
    setIsLoading(false);
  };

  const fetchUserResults = async (userId: string) => {
    const { data, error } = await supabase.from('exam_results').select('*').eq('user_id', userId).order('created_at', { ascending: false });
    if (data) setResults(data);
  };

  useEffect(() => {
    fetchPackages();
    const syncUser = async (session: any) => {
      if (!session) return;
      let { data: profile } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
      if (!profile) {
         const { data: newProfile, error } = await supabase.from('profiles').insert([{
           id: session.user.id, email: session.user.email, full_name: session.user.user_metadata.full_name || 'Sobat Ambis',
           role: 'student', owned_packages: ['free-01']
         }]).select().single();
         if (!error) profile = newProfile;
      }
      const currentUser: User = {
        id: session.user.id, name: profile?.full_name || session.user.user_metadata.full_name || 'Sobat Ambis',
        email: session.user.email || '', role: profile?.role || 'student',
        ownedPackages: profile?.owned_packages || ['free-01'], school: profile?.school || '', targetPtn: profile?.target_ptn || '' 
      };
      setUser(currentUser);
      fetchUserResults(session.user.id);
      fetchActiveSession(session.user.id); 
      setCurrentPage(prev => prev === 'landing' ? 'dashboard' : prev);
    };

    supabase.auth.getSession().then(({ data: { session } }) => { if (session) syncUser(session); });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) syncUser(session);
      else { setUser(null); setResults([]); setCurrentPage('landing'); }
    });
    return () => subscription.unsubscribe();
  }, []); 

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({ 
      provider: 'google',
      options: {
        // Baris ini yang ngasih tau Supabase untuk redirect ke URL asal tempat tombol diklik
        redirectTo: window.location.origin
      }
    });
    if (error) showToast(error.message, 'error');
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('deans_active_session');
    setUser(null); setActiveSession(null); setCurrentPage('landing');
    showToast('Sampai jumpa lagi, pejuang PTN!', 'info');
  };

  const navigateTo = (page: string) => {
    setIsLoading(true);
    setTimeout(() => { setCurrentPage(page); setIsLoading(false); }, 300); 
  };

  const startExam = async (pkg: ExamPackage) => {
    setLoadingText("Mengunduh Soal ke Perangkat..."); setIsLoading(true);
    let fullPkg = await fetchFullPackageData(pkg.id);
    if (!fullPkg) fullPkg = MOCK_EXAM_PACKAGES.find(p => p.id === pkg.id); 

    if (!fullPkg || fullPkg.subtests.length === 0 || fullPkg.subtests[0].questions.length === 0) {
       showToast("Soal di paket ini masih kosong, belum bisa dikerjakan!", "error");
       setIsLoading(false); setLoadingText("Menyiapkan Amunisi..."); return;
    }
    setPackages(prev => prev.map(p => p.id === fullPkg.id ? fullPkg : p));
    const session: ExamSession = { packageId: fullPkg.id, currentSubtestIndex: 0, responses: {}, startTime: Date.now(), subtestStartTime: Date.now(), isFinished: false };
    
    setActiveSession(session);
    localStorage.setItem('deans_active_session', JSON.stringify(session));
    if (user) await syncSessionToCloud(session, user.id);

    setCurrentPage('exam');
    setIsLoading(false); setLoadingText("Menyiapkan Amunisi...");
    showToast('Semoga beruntung, fokus!', 'info');
  };

  const saveResponse = (qId: string, answer: any, isFlagged: boolean) => {
    if (!activeSession) return;
    const updatedResponses = { ...activeSession.responses, [qId]: { questionId: qId, answer, isFlagged } };
    const updatedSession = { ...activeSession, responses: updatedResponses };
    setActiveSession(updatedSession);
    localStorage.setItem('deans_active_session', JSON.stringify(updatedSession));
    if (user) syncSessionToCloud(updatedSession, user.id);
  };

  const completeSubtest = async (pkg: ExamPackage) => {
    if (!activeSession || !user) return;
    const isLast = activeSession.currentSubtestIndex === pkg.subtests.length - 1;
    
    if (isLast) {
      setLoadingText("Menganalisis Skor IRT..."); setIsLoading(true);
      const allQuestions = pkg.subtests.flatMap(s => s.questions);
      const score = calculateIRTScore(allQuestions, activeSession.responses);
      const scoreAnalysis = getAnalysisBySubject(allQuestions, activeSession.responses);
      
      const newResult = {
        user_id: user.id, package_id: pkg.id, package_title: pkg.title,
        total_score: score, subject_scores: scoreAnalysis, responses: activeSession.responses, date: new Date().toLocaleDateString('id-ID')
      };

      const { error } = await supabase.from('exam_results').insert([newResult]);
      if (!error) {
        showToast('Ujian selesai! Hasil tersimpan di akun kamu.', 'success');
        await supabase.from('active_sessions').delete().eq('user_id', user.id);
        localStorage.removeItem('deans_active_session');
        setActiveSession(null); await fetchUserResults(user.id); navigateTo('history');
      } else { showToast('Gagal menyimpan ke database: ' + error.message, 'error'); }
      setIsLoading(false); setLoadingText("Menyiapkan Amunisi...");

    } else {
      const updatedSession = { ...activeSession, currentSubtestIndex: activeSession.currentSubtestIndex + 1, subtestStartTime: Date.now() };
      setActiveSession(updatedSession);
      localStorage.setItem('deans_active_session', JSON.stringify(updatedSession));
      if (user) await syncSessionToCloud(updatedSession, user.id);
      showToast('Subtest selesai, lanjut berikutnya!', 'info');
    }
  };

  const buyPackage = async (pkgId: string) => {
    if (!user) return;
    const newOwnedPackages = [...user.ownedPackages, pkgId];
    const updatedUser = { ...user, ownedPackages: newOwnedPackages };
    setUser(updatedUser);
    const { error } = await supabase.from('profiles').update({ owned_packages: newOwnedPackages }).eq('id', user.id);
    if (error) showToast('Gagal memverifikasi pembayaran: ' + error.message, 'error');
    else showToast('Pembayaran Berhasil! Paket telah permanen terbuka.', 'success');
  };

  // ==========================================
  // LOGIKA RENDER TINGKAT TINGGI
  // ==========================================

  // 1. Landing Page (Diluar Layout)
  if (currentPage === 'landing') return <LandingPage onStart={handleLogin} />;
  
  // 2. Layar Ujian CBT (Diluar Layout, Fullscreen)
  if (currentPage === 'exam' && activeSession) {
    const pkg = packages.find(p => p.id === activeSession.packageId) || MOCK_EXAM_PACKAGES.find(p => p.id === activeSession.packageId);
    if (!pkg || !pkg.subtests || pkg.subtests.length === 0) {
      showToast("Soal belum tersedia untuk paket ini", "error"); setCurrentPage('dashboard'); return null;
    }
    const subtest = pkg.subtests[activeSession.currentSubtestIndex];
    if (!subtest || !subtest.questions || subtest.questions.length === 0) return <div className="p-20 text-center font-bold">Memuat soal... (Atau Soal Belum Dibuat Admin)</div>;

    return (
      <CBTInterface 
        key={subtest.id} subtest={subtest} responses={activeSession.responses}
        subtestStartTime={activeSession.subtestStartTime} onSaveResponse={saveResponse}
        onSubtestComplete={() => completeSubtest(pkg)} isLastSubtest={activeSession.currentSubtestIndex === pkg.subtests.length - 1}
      />
    );
  }

  // 3. Render Isi Halaman (Di dalam Layout)
  const renderContent = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard user={user} results={results} onNavigate={navigateTo} />;
      case 'catalog':
        return <Catalog user={user} packages={packages} onStartExam={startExam} onBuyPackage={buyPackage} />;
      case 'leaderboard':
        // PERBAIKAN: Masukkan props user agar Sticky Bar peringkat muncul
        return <Leaderboard user={user} />; 
      case 'video_pembahasan':
        // PERBAIKAN FATAL: Masukkan seluruh props yang diminta agar tidak crash
        return (
          <VideoPembahasan 
            user={user} 
            packages={packages} 
            onBack={() => navigateTo('dashboard')} 
            onNavigate={navigateTo} 
          />
        );
      case 'history':
        return (
          <div className="p-4 md:p-8">
             <h1 className="text-2xl md:text-3xl font-black text-[#1e3a8a] dark:text-white mb-6 md:mb-8">Riwayat Ujian 📜</h1>
             {results.length > 0 ? (
               <div className="grid grid-cols-1 gap-4">
                 {results.slice().map(r => (
                   <div key={r.id} className="bg-white dark:bg-slate-900 p-4 md:p-6 rounded-2xl md:rounded-3xl border border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row justify-between sm:items-center gap-4 group">
                      <div>
                         <p className="font-bold text-slate-800 dark:text-slate-100 text-base md:text-lg">{(r as any).package_title || r.packageTitle}</p>
                         <p className="text-sm text-slate-400">{r.date || new Date((r as any).created_at!).toLocaleDateString()}</p>
                      </div>
                      <div className="flex items-center justify-between sm:justify-end gap-4 md:gap-8 border-t dark:border-slate-800 sm:border-none pt-4 sm:pt-0">
                         <div className="text-left sm:text-right">
                            <p className="text-[10px] font-bold text-slate-400 uppercase">Skor IRT</p>
                            <p className="text-xl md:text-2xl font-black text-emerald-500">{(r as any).total_score || r.totalScore}</p>
                         </div>
                         <button onClick={() => { setViewingResult(r); navigateTo('results'); }} className="bg-slate-50 dark:bg-slate-800 text-[#1e3a8a] dark:text-blue-400 px-4 md:px-6 py-2 rounded-xl font-bold hover:bg-[#1e3a8a] hover:text-white transition-all text-sm md:text-base">Review</button>
                      </div>
                   </div>
                 ))}
               </div>
             ) : (
               <div className="text-center py-24 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-slate-800">
                  <div className="bg-slate-50 dark:bg-slate-800 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
                     <Lock size={40} />
                  </div>
                  <p className="text-slate-800 dark:text-slate-200 font-black text-xl mb-2">Belum Ada Riwayat</p>
                  <p className="text-slate-400 font-medium px-4 max-w-sm mx-auto mb-8">Ujian yang kamu selesaikan akan muncul di sini lengkap dengan analisis skor IRT.</p>
                  <button onClick={() => navigateTo('catalog')} className="bg-[#1e3a8a] text-white px-8 py-3 rounded-2xl font-black shadow-xl shadow-blue-100 dark:shadow-none">CARI PAKET TO</button>
               </div>
             )}
          </div>
        );
      case 'results':
        return viewingResult ? <Results result={viewingResult} packages={packages} onBack={() => navigateTo('history')} /> : null;
      case 'admin':
        return user?.role === 'admin' ? <AdminPanel /> : null;
      case 'subscription':
        return <Subscription user={user} />;
      case 'profile':
        return <Profile user={user} packages={packages} onUpdateUser={setUser} />;
      default:
        return <Dashboard user={user} results={results} onNavigate={navigateTo} />;
    }
  };

  return (
    <>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      {/* Loading Animasi Asli Lu */}
      {isLoading && (
        <div className="fixed inset-0 md:left-64 bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-sm z-[150] flex flex-col items-center justify-center animate-fade-in">
           <div className="relative">
              <div className="w-16 h-16 border-4 border-slate-200 dark:border-slate-800 rounded-full"></div>
              <div className="w-16 h-16 border-4 border-[#1e3a8a] dark:border-emerald-500 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
           </div>
           <p className="mt-6 text-[#1e3a8a] dark:text-emerald-400 font-black uppercase tracking-[0.2em] text-xs animate-pulse">{loadingText}</p>
        </div>
      )}

      {/* ========================================== */}
      {/* MEMBUNGKUS DENGAN KODE LAYOUT BARU         */}
      {/* ========================================== */}
      <Layout 
        currentPath={currentPage} 
        onNavigate={navigateTo} 
        toggleTheme={toggleTheme} 
        isDark={isDark}
        user={user}
        onLogout={handleLogout}
      >
        {renderContent()}
      </Layout>
    </>
  );
};

export default App;