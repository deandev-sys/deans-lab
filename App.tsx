import React, { useState, useEffect } from 'react';
import { ExamPackage, ExamSession, UserResponse, ExamResult, User } from './types';
import { calculateIRTScore, getAnalysisBySubject } from './services/irtService';
import Sidebar from './components/Sidebar';
import CBTInterface from './components/CBTInterface';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import Catalog from './pages/Catalog';
import Results from './pages/Results';
import AdminPanel from './pages/Admin';
import Leaderboard from './pages/Leaderboard';
import Profile from './pages/Profile';
import Toast, { ToastType } from './components/Toast';
import { supabase } from './src/lib/supabase';
import { Award, Lock, Menu, X, ShieldCheck, CreditCard, BookOpen, Loader2 } from 'lucide-react';
import { MOCK_EXAM_PACKAGES } from './constants';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<string>('landing');
  const [user, setUser] = useState<User | null>(null);
  const [activeSession, setActiveSession] = useState<ExamSession | null>(null);
  const [results, setResults] = useState<ExamResult[]>([]);
  const [packages, setPackages] = useState<ExamPackage[]>([]);
  const [viewingResult, setViewingResult] = useState<ExamResult | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("Menyiapkan Amunisi..."); 
  
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  const showToast = (message: string, type: ToastType = 'success') => {
    setToast({ message, type });
  };

  const fetchFullPackageData = async (pkgId: string) => {
    const { data, error } = await supabase
      .from('packages')
      .select('*, subtests(*), questions(*)')
      .eq('id', pkgId)
      .single();

    if (error || !data) return null;

    let subtests = [];
    if (data.subtests && data.subtests.length > 0) {
      const sortedSubtests = data.subtests.sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
      
      subtests = sortedSubtests.map((st: any) => ({
        id: st.id,
        title: st.title,
        durationMinutes: st.duration_minutes,
        questions: data.questions
          .filter((q: any) => q.subject === st.title)
          .map((q: any) => {
            const formattedChoices = q.choices ? Object.entries(q.choices).map(([id, text]) => ({ id, text: text as string })) : [];
            return {
              ...q,
              text: q.question_text, 
              id: q.id.toString(),
              choices: formattedChoices,
              correctAnswer: q.correct_answer,
              imageUrl: q.image_url
            };
          })
      }));
    } else {
      // --- PERBAIKAN: Jaring Pengaman (Fallback) untuk Paket Lama yang belum ada Subtes manual ---
      const subjects = [...new Set(data.questions?.map((q: any) => q.subject) || [])];
      subtests = subjects.map((subjectName: any) => ({
        id: `${data.id}-${subjectName}`,
        title: subjectName,
        durationMinutes: 30, // Default 30 Menit
        questions: data.questions
          .filter((q: any) => q.subject === subjectName)
          .map((q: any) => {
            const formattedChoices = q.choices ? Object.entries(q.choices).map(([id, text]) => ({ id, text: text as string })) : [];
            return {
              ...q,
              text: q.question_text, 
              id: q.id.toString(),
              choices: formattedChoices,
              correctAnswer: q.correct_answer,
              imageUrl: q.image_url
            };
          })
      }));
    }
    
    return { 
      ...data, 
      isPremium: data.is_premium, 
      packageType: data.package_type || 'FULL',
      subject: data.subject || 'ALL',
      topic: data.topic || 'Campuran',
      subtests: subtests 
    };
  };

  const fetchActiveSession = async (userId: string) => {
    const { data, error } = await supabase
      .from('active_sessions')
      .select('session_data')
      .eq('user_id', userId)
      .single();

    let sessionToRestore = null;

    if (data && data.session_data) {
       sessionToRestore = data.session_data;
       localStorage.setItem('deans_active_session', JSON.stringify(data.session_data));
       showToast('Sesi ujian sebelumnya dipulihkan!', 'info');
    } else {
       const savedSession = localStorage.getItem('deans_active_session');
       if (savedSession) {
         sessionToRestore = JSON.parse(savedSession);
       }
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
    await supabase.from('active_sessions').upsert({
      user_id: currentUserId,
      session_data: session,
      updated_at: new Date().toISOString()
    });
  };

  const fetchPackages = async () => {
    setIsLoading(true);
    // --- PERBAIKAN: Sedot 'id' dan 'subject' soal saja biar ringan tapi bisa dihitung ---
    const { data, error } = await supabase
      .from('packages')
      .select('*, subtests(id, title, duration_minutes, created_at), questions(id, subject)');

    if (data) {
      const formattedPackages = data.map((pkg: any) => {
        let subtests = [];
        
        if (pkg.subtests && pkg.subtests.length > 0) {
          const sortedSubtests = pkg.subtests.sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
          subtests = sortedSubtests.map((st: any) => ({
            id: st.id,
            title: st.title,
            durationMinutes: st.duration_minutes,
            // Cuma inject list ID biar panjang array (jumlah soal) kebaca di Katalog
            questions: pkg.questions ? pkg.questions.filter((q:any) => q.subject === st.title) : [] 
          }));
        } else {
          // --- PERBAIKAN: Fallback untuk Katalog Paket Lama ---
          const subjects = [...new Set(pkg.questions?.map((q: any) => q.subject) || [])];
          subtests = subjects.map((subjectName: any) => ({
             id: `${pkg.id}-${subjectName}`,
             title: subjectName,
             durationMinutes: 30,
             questions: pkg.questions ? pkg.questions.filter((q:any) => q.subject === subjectName) : []
          }));
        }
        
        return { 
          ...pkg, 
          isPremium: pkg.is_premium, 
          packageType: pkg.package_type || 'FULL',
          subject: pkg.subject || 'ALL',
          topic: pkg.topic || 'Campuran',
          lynkUrl: pkg.lynk_url,
          subtests: subtests 
        };
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
      
      let { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
      
      if (!profile) {
         const { data: newProfile, error } = await supabase.from('profiles').insert([{
           id: session.user.id,
           email: session.user.email,
           full_name: session.user.user_metadata.full_name || 'Sobat Ambis',
           role: 'student', 
           owned_packages: ['free-01']
         }]).select().single();
         
         if (!error) profile = newProfile;
      }

      const currentUser: User = {
        id: session.user.id,
        name: profile?.full_name || session.user.user_metadata.full_name || 'Sobat Ambis',
        email: session.user.email || '',
        role: profile?.role || 'student',
        ownedPackages: profile?.owned_packages || ['free-01'],
        school: profile?.school || '',       
        targetPtn: profile?.target_ptn || '' 
      };
      
      setUser(currentUser);
      fetchUserResults(session.user.id);
      fetchActiveSession(session.user.id); 
      
      setCurrentPage(prev => prev === 'landing' ? 'dashboard' : prev);
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) syncUser(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        syncUser(session);
      } else {
        setUser(null);
        setResults([]);
        setCurrentPage('landing');
      }
    });

    return () => subscription.unsubscribe();
  }, []); 

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
    if (error) showToast(error.message, 'error');
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('deans_active_session');
    setUser(null);
    setActiveSession(null);
    setCurrentPage('landing');
    setIsSidebarOpen(false);
    showToast('Sampai jumpa lagi, pejuang PTN!', 'info');
  };

  const navigateTo = (page: string) => {
    setIsLoading(true);
    setTimeout(() => {
      setCurrentPage(page);
      setIsSidebarOpen(false);
      setIsLoading(false);
    }, 450); 
  };

  const startExam = async (pkg: ExamPackage) => {
    setLoadingText("Mengunduh Soal ke Perangkat...");
    setIsLoading(true);
    
    let fullPkg = await fetchFullPackageData(pkg.id);
    if (!fullPkg) fullPkg = MOCK_EXAM_PACKAGES.find(p => p.id === pkg.id); 

    if (!fullPkg || fullPkg.subtests.length === 0 || fullPkg.subtests[0].questions.length === 0) {
       showToast("Soal di paket ini masih kosong, belum bisa dikerjakan!", "error");
       setIsLoading(false);
       setLoadingText("Menyiapkan Amunisi...");
       return;
    }

    setPackages(prev => prev.map(p => p.id === fullPkg.id ? fullPkg : p));

    const session: ExamSession = {
      packageId: fullPkg.id,
      currentSubtestIndex: 0,
      responses: {},
      startTime: Date.now(),
      subtestStartTime: Date.now(),
      isFinished: false
    };
    
    setActiveSession(session);
    localStorage.setItem('deans_active_session', JSON.stringify(session));
    if (user) await syncSessionToCloud(session, user.id);

    setCurrentPage('exam');
    setIsLoading(false);
    setLoadingText("Menyiapkan Amunisi...");
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
      setLoadingText("Menganalisis Skor IRT...");
      setIsLoading(true);
      const allQuestions = pkg.subtests.flatMap(s => s.questions);
      const score = calculateIRTScore(allQuestions, activeSession.responses);
      const scoreAnalysis = getAnalysisBySubject(allQuestions, activeSession.responses);
      
      const newResult = {
        user_id: user.id,
        package_id: pkg.id,
        package_title: pkg.title,
        total_score: score,
        subject_scores: scoreAnalysis,
        responses: activeSession.responses,
        date: new Date().toLocaleDateString('id-ID')
      };

      const { error } = await supabase.from('exam_results').insert([newResult]);

      if (!error) {
        showToast('Ujian selesai! Hasil tersimpan di akun kamu.', 'success');
        await supabase.from('active_sessions').delete().eq('user_id', user.id);
        localStorage.removeItem('deans_active_session');
        setActiveSession(null);
        await fetchUserResults(user.id);
        navigateTo('history');
      } else {
        showToast('Gagal menyimpan ke database: ' + error.message, 'error');
      }
      setIsLoading(false);
      setLoadingText("Menyiapkan Amunisi...");

    } else {
      const updatedSession = { 
        ...activeSession, 
        currentSubtestIndex: activeSession.currentSubtestIndex + 1,
        subtestStartTime: Date.now()
      };
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

  if (currentPage === 'landing') return <LandingPage onStart={handleLogin} />;
  
  if (currentPage === 'exam' && activeSession) {
    const pkg = packages.find(p => p.id === activeSession.packageId) || MOCK_EXAM_PACKAGES.find(p => p.id === activeSession.packageId);
    if (!pkg || !pkg.subtests || pkg.subtests.length === 0) {
      showToast("Soal belum tersedia untuk paket ini", "error");
      setCurrentPage('dashboard');
      return null;
    }
    const subtest = pkg.subtests[activeSession.currentSubtestIndex];
    if (!subtest || !subtest.questions || subtest.questions.length === 0) return <div className="p-20 text-center font-bold">Memuat soal... (Atau Soal Belum Dibuat Admin)</div>;

    return (
      <CBTInterface 
        key={subtest.id}
        subtest={subtest}
        responses={activeSession.responses}
        subtestStartTime={activeSession.subtestStartTime}
        onSaveResponse={saveResponse}
        onSubtestComplete={() => completeSubtest(pkg)}
        isLastSubtest={activeSession.currentSubtestIndex === pkg.subtests.length - 1}
      />
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      {isSidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity" onClick={() => setIsSidebarOpen(false)} />}
      
      <div className={`fixed inset-y-0 left-0 z-50 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 transition-transform duration-300 ease-in-out`}>
        <Sidebar user={user} currentPath={currentPage} onNavigate={navigateTo} onLogout={handleLogout} />
      </div>

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <div className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-slate-200 shrink-0 z-30">
          <div className="flex items-center gap-2 font-bold text-[#1e3a8a]">
            <Award className="text-emerald-500" size={24} /> <span>Dean's Lab</span>
          </div>
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {isLoading && (
          <div className="fixed inset-0 md:left-64 bg-slate-50/80 backdrop-blur-sm z-[150] flex flex-col items-center justify-center animate-fade-in">
             <div className="relative">
                <div className="w-16 h-16 border-4 border-slate-200 rounded-full"></div>
                <div className="w-16 h-16 border-4 border-[#1e3a8a] border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
             </div>
             <p className="mt-6 text-[#1e3a8a] font-black uppercase tracking-[0.2em] text-xs animate-pulse">{loadingText}</p>
          </div>
        )}

        <div className="flex-1 overflow-y-auto">
          {currentPage === 'dashboard' && <Dashboard user={user} results={results} onNavigate={navigateTo} />}
          {currentPage === 'catalog' && <Catalog user={user} packages={packages} onStartExam={startExam} onBuyPackage={buyPackage} />}
          {currentPage === 'leaderboard' && <Leaderboard />}
          {currentPage === 'history' && (
              <div className="p-4 md:p-8">
                 <h1 className="text-2xl md:text-3xl font-black text-[#1e3a8a] mb-6 md:mb-8">Riwayat Ujian 📜</h1>
                 {results.length > 0 ? (
                   <div className="grid grid-cols-1 gap-4">
                     {results.slice().map(r => (
                       <div key={r.id} className="bg-white p-4 md:p-6 rounded-2xl md:rounded-3xl border border-slate-100 flex flex-col sm:flex-row justify-between sm:items-center gap-4 group">
                          <div>
                             <p className="font-bold text-slate-800 text-base md:text-lg">{(r as any).package_title || r.packageTitle}</p>
                             <p className="text-sm text-slate-400">{r.date || new Date((r as any).created_at!).toLocaleDateString()}</p>
                          </div>
                          <div className="flex items-center justify-between sm:justify-end gap-4 md:gap-8 border-t sm:border-none pt-4 sm:pt-0">
                             <div className="text-left sm:text-right">
                                <p className="text-[10px] font-bold text-slate-400 uppercase">Skor IRT</p>
                                <p className="text-xl md:text-2xl font-black text-emerald-500">{(r as any).total_score || r.totalScore}</p>
                             </div>
                             <button onClick={() => { setViewingResult(r); navigateTo('results'); }} className="bg-slate-50 text-[#1e3a8a] px-4 md:px-6 py-2 rounded-xl font-bold hover:bg-[#1e3a8a] hover:text-white transition-all text-sm md:text-base">Review</button>
                          </div>
                       </div>
                     ))}
                   </div>
                 ) : (
                   <div className="text-center py-24 bg-white rounded-[2.5rem] border-2 border-dashed border-slate-200">
                      <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
                         <Lock size={40} />
                      </div>
                      <p className="text-slate-800 font-black text-xl mb-2">Belum Ada Riwayat</p>
                      <p className="text-slate-400 font-medium px-4 max-w-sm mx-auto mb-8">Ujian yang kamu selesaikan akan muncul di sini lengkap dengan analisis skor IRT.</p>
                      <button onClick={() => navigateTo('catalog')} className="bg-[#1e3a8a] text-white px-8 py-3 rounded-2xl font-black shadow-xl shadow-blue-100">CARI PAKET TO</button>
                   </div>
                 )}
              </div>
          )}
          {currentPage === 'results' && viewingResult && <Results result={viewingResult} packages={packages} onBack={() => navigateTo('history')} />}
          {currentPage === 'admin' && user?.role === 'admin' && <AdminPanel />}
          {currentPage === 'profile' && <Profile user={user} packages={packages} onUpdateUser={setUser} />}
        </div>
      </main>
    </div>
  );
};

export default App;