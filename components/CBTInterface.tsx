import React, { useState, useEffect } from 'react';
import { Question, Subtest, UserResponse, QuestionType } from '../types';
import { ChevronLeft, ChevronRight, Flag, Timer, List, BookOpen, HelpCircle, X, AlertCircle, Lock } from 'lucide-react';

interface CBTInterfaceProps {
  subtest: Subtest;
  responses: Record<string, UserResponse>;
  subtestStartTime: number; // Kita biarkan prop ini agar struktur App.tsx tidak rusak
  onSaveResponse: (qId: string, answer: any, isFlagged: boolean) => void;
  onSubtestComplete: () => void;
  isLastSubtest: boolean;
}

const CBTInterface: React.FC<CBTInterfaceProps> = ({
  subtest,
  responses,
  subtestStartTime, 
  onSaveResponse,
  onSubtestComplete,
  isLastSubtest
}) => {
  
  // --- PERBAIKAN: Logika Timer Tahan Banting (Anti-Tidur & Anti-Throttling) ---
  const calculateRemainingTime = () => {
    // 1. Cek apakah ada sisa waktu tersimpan di HP/Laptop siswa untuk subtes ini
    const savedTime = localStorage.getItem(`deans_timer_${subtest.id}`);
    if (savedTime) {
      return parseInt(savedTime, 10);
    }
    // 2. Jika belum ada, gunakan waktu penuh (menit ke detik)
    return subtest.durationMinutes * 60;
  };

  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(calculateRemainingTime());
  const [showNav, setShowNav] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [mobileView, setMobileView] = useState<'passage' | 'question'>('question');

  // Reset Indeks & Timer saat pindah Subtest
  useEffect(() => {
    setCurrentIndex(0);
    setTimeLeft(calculateRemainingTime());
  }, [subtest.id]);

  // ENGINE TIMER UTAMA
  useEffect(() => {
    // Jika waktu sudah habis dari awal render
    if (timeLeft <= 0) {
      localStorage.removeItem(`deans_timer_${subtest.id}`);
      onSubtestComplete();
      return;
    }

    let lastTick = Date.now();

    const timer = setInterval(() => {
      const now = Date.now();
      const deltaSeconds = Math.round((now - lastTick) / 1000);

      // LOGIKA ANTI-TIDUR:
      // Jika tab ditinggal tidur/dimatikan, delta akan membengkak (misal 3600 detik).
      // Kita cegah timer bablas. Jika delta > 5 detik, anggap saja dipause dan cuma kurangi 1 detik.
      // Jika normal (1-2 detik), kurangi sesuai delta (mengatasi throttling browser).
      const deduction = deltaSeconds > 5 ? 1 : deltaSeconds;

      setTimeLeft(prev => {
        const newTime = prev - deduction;
        const finalTime = newTime > 0 ? newTime : 0;
        
        // Simpan otomatis ke storage setiap detik
        localStorage.setItem(`deans_timer_${subtest.id}`, finalTime.toString());
        
        // Auto-submit jika waktu habis di dalam interval
        if (finalTime <= 0) {
          clearInterval(timer);
          localStorage.removeItem(`deans_timer_${subtest.id}`);
          onSubtestComplete();
        }
        
        return finalTime;
      });

      lastTick = now;
    }, 1000);

    return () => clearInterval(timer);
  }, [subtest.id]); // Hanya bergantung pada pergantian subtest

  if (!subtest || !subtest.questions || subtest.questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-slate-50">
        <AlertCircle size={48} className="text-orange-500 mb-4" />
        <p className="font-black text-[#1e3a8a] text-xl">SOAL TIDAK DITEMUKAN</p>
        <button onClick={() => window.location.reload()} className="mt-4 text-blue-600 font-bold underline">Kembali ke Katalog</button>
      </div>
    );
  }

  const currentQuestion = subtest.questions[currentIndex] || subtest.questions[0];
  const currentResponse = responses[currentQuestion.id] || { 
    questionId: currentQuestion.id, 
    answer: null, 
    isFlagged: false 
  };

  const answeredCount = subtest.questions.filter(q => {
    const r = responses[q.id];
    return r?.answer !== null && r?.answer !== undefined && r?.answer !== '';
  }).length;

  const isAllAnswered = answeredCount === subtest.questions.length;

  useEffect(() => {
    setMobileView('question');
    const containers = document.querySelectorAll('.scroll-container');
    containers.forEach(c => c.scrollTo({ top: 0, behavior: 'smooth' }));
  }, [currentIndex]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleAnswerChange = (answer: any) => {
    onSaveResponse(currentQuestion.id, answer, currentResponse.isFlagged);
  };

  const toggleFlag = () => {
    onSaveResponse(currentQuestion.id, currentResponse.answer, !currentResponse.isFlagged);
  };

  const handleFinishAttempt = () => {
    if (isAllAnswered) {
      setShowConfirm(true);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-white overflow-hidden font-sans">
      <header className="h-16 md:h-20 bg-[#1e3a8a] text-white px-4 md:px-8 flex justify-between items-center shadow-lg z-30 shrink-0">
        <div className="flex flex-col md:flex-row md:items-center md:gap-4 overflow-hidden">
          <h1 className="text-sm md:text-xl font-black truncate uppercase tracking-tight">{subtest.title}</h1>
          <span className="hidden md:block h-6 w-px bg-white/20"></span>
          <p className="text-[10px] md:text-sm font-bold text-blue-200">SOAL {currentIndex + 1} / {subtest.questions.length}</p>
        </div>
        
        <div className="flex items-center gap-3 md:gap-8">
          <div className={`flex items-center gap-2 font-mono text-base md:text-2xl font-black px-4 py-1.5 rounded-xl bg-black/20 border border-white/10 ${timeLeft < 300 ? 'text-red-400 animate-pulse' : 'text-emerald-400'}`}>
            <Timer size={20} className="md:w-6 md:h-6" />
            {formatTime(timeLeft)}
          </div>
          
          <button 
            onClick={handleFinishAttempt}
            disabled={!isAllAnswered}
            className={`flex items-center gap-2 px-4 md:px-6 py-2 md:py-3 rounded-xl text-xs md:text-sm font-black uppercase transition-all shadow-lg active:scale-95 ${
              isAllAnswered 
                ? 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-900/20' 
                : 'bg-slate-400 cursor-not-allowed opacity-60'
            }`}
          >
            {!isAllAnswered && <Lock size={14} />}
            {isLastSubtest ? 'Selesai' : 'Lanjut'}
          </button>
        </div>
      </header>

      {currentQuestion.passage && (
        <div className="flex md:hidden border-b bg-slate-50 shrink-0 z-20">
          <button onClick={() => setMobileView('passage')} className={`flex-1 flex items-center justify-center gap-2 py-4 text-xs font-black tracking-widest transition-all ${mobileView === 'passage' ? 'bg-white text-[#1e3a8a] border-b-4 border-[#1e3a8a]' : 'text-slate-400'}`}>
            <BookOpen size={18} /> BACAAN
          </button>
          <button onClick={() => setMobileView('question')} className={`flex-1 flex items-center justify-center gap-2 py-4 text-xs font-black tracking-widest transition-all ${mobileView === 'question' ? 'bg-white text-[#1e3a8a] border-b-4 border-[#1e3a8a]' : 'text-slate-400'}`}>
            <HelpCircle size={18} /> SOAL
          </button>
        </div>
      )}

      <main className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        <div className={`flex-1 md:w-1/2 overflow-y-auto scroll-container border-r border-slate-200 bg-slate-50 transition-all h-full ${currentQuestion.passage ? (mobileView === 'passage' ? 'block' : 'hidden md:block') : 'hidden'}`}>
          <div className="p-6 md:p-12 max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
              <span className="w-12 h-1.5 bg-[#1e3a8a] rounded-full"></span>
              <h2 className="text-xs font-black uppercase text-slate-400 tracking-[0.3em]">Teks Bacaan Utama</h2>
            </div>
            <div className="prose prose-slate max-w-none text-slate-800 text-lg md:text-xl leading-relaxed md:leading-loose whitespace-pre-wrap font-serif">{currentQuestion.passage}</div>
            <div className="h-24 md:h-32"></div>
          </div>
        </div>

        <div className={`flex-1 md:w-1/2 overflow-y-auto scroll-container bg-white transition-all h-full ${mobileView === 'question' ? 'block' : 'hidden md:block'}`}>
          <div className="p-6 md:p-12 max-w-3xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <span className="px-4 py-1.5 bg-blue-50 text-[#1e3a8a] rounded-full text-xs font-black tracking-widest uppercase border border-blue-100">PERTANYAAN #{currentIndex + 1}</span>
              <button onClick={toggleFlag} className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black uppercase transition-all ${currentResponse.isFlagged ? 'bg-orange-500 text-white shadow-lg shadow-orange-200' : 'bg-slate-100 text-slate-400 hover:text-slate-600'}`}>
                <Flag size={16} fill={currentResponse.isFlagged ? "currentColor" : "none"} /> Ragu-Ragu
              </button>
            </div>
            <div className="mb-10">
              {currentQuestion.imageUrl && (
                <div className="mb-6 bg-slate-50 border border-slate-100 p-2 rounded-2xl w-fit max-w-full">
                  <img 
                    src={currentQuestion.imageUrl} 
                    alt="Ilustrasi Soal" 
                    className="max-w-full h-auto rounded-xl object-contain max-h-[40vh]"
                  />
                </div>
              )}
              <p className="text-xl md:text-3xl font-bold text-slate-800 leading-snug">
                {currentQuestion.text}
              </p>
            </div>
            <div className="space-y-4 md:space-y-5">
              {currentQuestion.type === QuestionType.MULTIPLE_CHOICE && currentQuestion.choices?.map((choice) => (
                <button key={choice.id} onClick={() => handleAnswerChange(choice.id)} className={`w-full text-left p-5 md:p-6 rounded-2xl border-2 transition-all flex items-start gap-5 group relative ${currentResponse.answer === choice.id ? 'border-[#1e3a8a] bg-blue-50/30 ring-4 ring-blue-50' : 'border-slate-100 hover:border-slate-300 bg-white hover:bg-slate-50 shadow-sm'}`}>
                  <span className={`w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-xl border-2 font-black shrink-0 text-sm md:text-lg transition-colors ${currentResponse.answer === choice.id ? 'bg-[#1e3a8a] text-white border-[#1e3a8a]' : 'border-slate-300 text-slate-500 bg-white group-hover:border-[#1e3a8a] group-hover:text-[#1e3a8a]'}`}>{choice.id}</span>
                  <span className={`text-base md:text-xl font-medium pt-2 md:pt-2.5 ${currentResponse.answer === choice.id ? 'text-[#1e3a8a] font-bold' : 'text-slate-700'}`}>{choice.text}</span>
                </button>
              ))}
              {currentQuestion.type === QuestionType.COMPLEX_MULTIPLE_CHOICE && currentQuestion.statements?.map((s, idx) => {
                const userVals = (currentResponse.answer as boolean[]) || Array(currentQuestion.statements?.length).fill(null);
                return (
                  <div key={s.id} className="p-6 md:p-8 bg-white border-2 border-slate-100 rounded-3xl flex flex-col gap-5 shadow-sm">
                    <p className="text-base md:text-xl font-bold text-slate-700 leading-relaxed">{s.text}</p>
                    <div className="flex gap-4">
                      <button onClick={() => { const newVals = [...userVals]; newVals[idx] = true; handleAnswerChange(newVals); }} className={`flex-1 py-4 rounded-2xl font-black text-xs md:text-base border-2 transition-all ${userVals[idx] === true ? 'bg-emerald-500 text-white border-emerald-500 shadow-xl shadow-emerald-200' : 'border-slate-100 bg-slate-50 text-slate-400 hover:border-slate-300'}`}>BENAR</button>
                      <button onClick={() => { const newVals = [...userVals]; newVals[idx] = false; handleAnswerChange(newVals); }} className={`flex-1 py-4 rounded-2xl font-black text-xs md:text-base border-2 transition-all ${userVals[idx] === false ? 'bg-red-500 text-white border-red-500 shadow-xl shadow-red-200' : 'border-slate-100 bg-slate-50 text-slate-400 hover:border-slate-300'}`}>SALAH</button>
                    </div>
                  </div>
                );
              })}
              {currentQuestion.type === QuestionType.SHORT_ANSWER && (
                <input type="text" placeholder="Ketik jawaban singkat..." value={currentResponse.answer || ''} onChange={(e) => handleAnswerChange(e.target.value)} className="w-full p-6 md:p-8 text-xl md:text-4xl font-black border-4 border-slate-100 rounded-3xl focus:border-[#1e3a8a] outline-none bg-slate-50 focus:bg-white transition-all text-[#1e3a8a]" />
              )}
            </div>
            <div className="h-32 md:h-40"></div>
          </div>
        </div>
      </main>

      <footer className="h-20 md:h-24 bg-white border-t border-slate-200 px-4 md:px-12 flex justify-between items-center shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-30 shrink-0">
        <button disabled={currentIndex === 0} onClick={() => setCurrentIndex(prev => prev - 1)} className="flex items-center gap-2 px-4 md:px-8 py-3 md:py-4 rounded-2xl font-black text-slate-500 hover:bg-slate-100 disabled:opacity-20 transition-all text-sm md:text-lg uppercase">
          <ChevronLeft size={24} /> <span className="hidden sm:inline">Sebelumnya</span>
        </button>
        <button onClick={() => setShowNav(true)} className="flex items-center gap-3 px-6 md:px-10 py-3 md:py-4 bg-slate-900 text-white rounded-2xl font-black hover:bg-black transition-all shadow-xl shadow-slate-200 text-sm md:text-lg uppercase">
          <List size={20} className="md:w-6 md:h-6" /> <span>Navigasi</span>
        </button>
        <button disabled={currentIndex === subtest.questions.length - 1} onClick={() => setCurrentIndex(prev => prev + 1)} className="flex items-center gap-2 px-4 md:px-8 py-3 md:py-4 bg-[#1e3a8a] text-white rounded-2xl font-black hover:bg-blue-800 disabled:opacity-20 transition-all shadow-xl shadow-blue-100 text-sm md:text-lg uppercase">
          <span className="hidden sm:inline">Selanjutnya</span> <ChevronRight size={24} />
        </button>
      </footer>

      {showConfirm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[200] flex items-center justify-center p-6">
           <div className="bg-white rounded-[2.5rem] max-w-lg w-full p-10 shadow-2xl animate-pop-in">
              <div className="bg-orange-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-orange-600">
                 <AlertCircle size={48} />
              </div>
              <h2 className="text-3xl font-black text-[#1e3a8a] text-center mb-4">Selesaikan Subtest?</h2>
              <div className="bg-slate-50 rounded-3xl p-6 mb-8 border border-slate-100">
                 <div className="flex justify-between items-center mb-2">
                    <span className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Progress Jawaban</span>
                    <span className="font-black text-[#1e3a8a]">{answeredCount} / {subtest.questions.length}</span>
                 </div>
                 <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500" style={{ width: `${(answeredCount/subtest.questions.length)*100}%` }}></div>
                 </div>
                 <p className="text-center text-sm text-slate-500 mt-6 font-medium">
                    {answeredCount < subtest.questions.length 
                      ? "⚠️ Masih ada soal yang belum kamu jawab. Yakin ingin mengakhiri?" 
                      : "Kamu sudah menjawab semua soal. Luar biasa!"}
                 </p>
              </div>

              <div className="flex flex-col gap-3">
                 <button 
                  onClick={() => {
                    setShowConfirm(false);
                    onSubtestComplete();
                  }}
                  className="w-full py-5 bg-emerald-500 text-white rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-emerald-600 shadow-xl shadow-emerald-100 transition-all"
                 >
                   Ya, Saya Yakin Selesai
                 </button>
                 <button 
                  onClick={() => setShowConfirm(false)}
                  className="w-full py-5 bg-slate-100 text-slate-500 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-slate-200 transition-all"
                 >
                   Cek Ulang Jawaban
                 </button>
              </div>
           </div>
        </div>
      )}

      {showNav && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex justify-end" onClick={() => setShowNav(false)}>
           <div className="w-full max-w-sm h-full bg-white shadow-2xl p-8 md:p-10 flex flex-col animate-slide-left" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-10">
                 <div><h3 className="font-black text-2xl text-[#1e3a8a] uppercase tracking-tight">Nomor Soal</h3><p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">{subtest.title}</p></div>
                 <button onClick={() => setShowNav(false)} className="p-3 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-all"><X size={28} /></button>
              </div>
              <div className="flex-1 overflow-y-auto pr-2 grid grid-cols-4 gap-4">
                 {subtest.questions.map((q, idx) => {
                    const resp = responses[q.id];
                    const isAnswered = resp?.answer !== null && resp?.answer !== undefined && resp.answer !== '';
                    const isFlagged = resp?.isFlagged;
                    let statusColor = 'bg-slate-100 text-slate-400 hover:bg-slate-200';
                    if (isFlagged) statusColor = 'bg-orange-500 text-white shadow-lg shadow-orange-100';
                    else if (isAnswered) statusColor = 'bg-emerald-500 text-white shadow-lg shadow-emerald-100';
                    return (
                       <button key={q.id} onClick={() => { setCurrentIndex(idx); setShowNav(false); }} className={`w-full aspect-square flex items-center justify-center rounded-2xl font-black text-lg transition-all ${statusColor} ${currentIndex === idx ? 'ring-4 ring-blue-500 ring-offset-4' : ''}`}>{idx + 1}</button>
                    )
                 })}
              </div>
              <button onClick={() => setShowNav(false)} className="mt-10 w-full py-5 bg-[#1e3a8a] text-white rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-blue-800 transition-all shadow-xl shadow-blue-100">Tutup Navigasi</button>
           </div>
        </div>
      )}
    </div>
  );
};

export default CBTInterface;