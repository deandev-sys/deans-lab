import React, { useState, useEffect } from 'react';
import { Question, Subtest, UserResponse, QuestionType } from '../types';
import { ChevronLeft, ChevronRight, Flag, Grid, X, Clock, AlertCircle, Lock, BookOpen, HelpCircle } from 'lucide-react';
import MathText from './MathText';

interface CBTInterfaceProps {
  subtest: Subtest;
  responses: Record<string, UserResponse>;
  subtestStartTime: number; 
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
  
  // --- LOGIKA ASLI: Timer Anti-Tidur & Storage ---
  const calculateRemainingTime = () => {
    const savedTime = localStorage.getItem(`deans_timer_${subtest.id}`);
    if (savedTime) return parseInt(savedTime, 10);
    return subtest.durationMinutes * 60;
  };

  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(calculateRemainingTime());
  const [isGridOpen, setIsGridOpen] = useState(false); // Mengganti showNav jadi isGridOpen (UI Baru)
  const [showConfirm, setShowConfirm] = useState(false);
  const [mobileView, setMobileView] = useState<'passage' | 'question'>('question');

  useEffect(() => {
    setCurrentIndex(0);
    setTimeLeft(calculateRemainingTime());
  }, [subtest.id]);

  useEffect(() => {
    if (timeLeft <= 0) {
      localStorage.removeItem(`deans_timer_${subtest.id}`);
      onSubtestComplete();
      return;
    }

    let lastTick = Date.now();
    const timer = setInterval(() => {
      const now = Date.now();
      const deltaSeconds = Math.round((now - lastTick) / 1000);
      const deduction = deltaSeconds > 5 ? 1 : deltaSeconds;

      setTimeLeft(prev => {
        const newTime = prev - deduction;
        const finalTime = newTime > 0 ? newTime : 0;
        
        localStorage.setItem(`deans_timer_${subtest.id}`, finalTime.toString());
        
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
  }, [subtest.id]);

  if (!subtest || !subtest.questions || subtest.questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-slate-50 dark:bg-slate-950">
        <AlertCircle size={48} className="text-orange-500 mb-4" />
        <p className="font-black text-[#1e3a8a] dark:text-blue-400 text-xl">SOAL TIDAK DITEMUKAN</p>
        <button onClick={() => window.location.reload()} className="mt-4 text-blue-600 dark:text-blue-300 font-bold underline">Kembali ke Katalog</button>
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
    if (isAllAnswered) setShowConfirm(true);
  };

  return (
    <div className="flex flex-col h-screen bg-white dark:bg-slate-950 overflow-hidden font-sans">
      
      {/* 1. STICKY HEADER (UI AI Style) */}
      <header className="h-16 md:h-20 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 md:px-8 bg-white dark:bg-slate-950 z-20 shrink-0 shadow-sm">
        <div>
           <h2 className="font-bold text-slate-900 dark:text-white truncate max-w-[150px] sm:max-w-xs md:max-w-md md:text-xl uppercase tracking-tight">
             {subtest.title}
           </h2>
           <p className="text-xs md:text-sm text-slate-500 font-bold mt-0.5">Soal {currentIndex + 1} / {subtest.questions.length}</p>
        </div>
        
        <div className="flex items-center gap-3 md:gap-6">
           {/* Timer Container */}
           <div className={`flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 bg-slate-100 dark:bg-slate-900 rounded-lg md:rounded-xl border border-slate-200 dark:border-slate-800 ${timeLeft < 300 ? 'ring-2 ring-red-500/50' : ''}`}>
               <Clock size={16} className={`${timeLeft < 300 ? 'text-red-500 animate-pulse' : 'text-slate-500'} md:w-5 md:h-5`} />
               <span className={`font-mono font-bold text-sm md:text-xl tracking-wider ${timeLeft < 300 ? 'text-red-500' : 'text-slate-900 dark:text-white'}`}>
                 {formatTime(timeLeft)}
               </span>
           </div>

           {/* Finish Button (Desktop) */}
           <button 
             onClick={handleFinishAttempt}
             disabled={!isAllAnswered}
             className={`hidden md:flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-black uppercase transition-all active:scale-95 ${
               isAllAnswered 
                 ? 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-md shadow-emerald-500/20' 
                 : 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed border border-slate-200 dark:border-slate-700'
             }`}
           >
             {!isAllAnswered && <Lock size={14} />}
             {isLastSubtest ? 'Selesai Ujian' : 'Lanjut Subtes'}
           </button>
        </div>
      </header>

      {/* 2. MOBILE TABS FOR PASSAGE VS QUESTION (Logika Asli) */}
      {currentQuestion.passage && (
        <div className="flex md:hidden border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 shrink-0 z-20">
          <button onClick={() => setMobileView('passage')} className={`flex-1 flex items-center justify-center gap-2 py-4 text-xs font-black tracking-widest transition-all ${mobileView === 'passage' ? 'bg-white dark:bg-slate-950 text-[#1e3a8a] dark:text-blue-400 border-b-2 border-[#1e3a8a] dark:border-blue-400' : 'text-slate-400'}`}>
            <BookOpen size={16} /> BACAAN
          </button>
          <button onClick={() => setMobileView('question')} className={`flex-1 flex items-center justify-center gap-2 py-4 text-xs font-black tracking-widest transition-all ${mobileView === 'question' ? 'bg-white dark:bg-slate-950 text-[#1e3a8a] dark:text-blue-400 border-b-2 border-[#1e3a8a] dark:border-blue-400' : 'text-slate-400'}`}>
            <HelpCircle size={16} /> SOAL
          </button>
        </div>
      )}

      {/* 3. MAIN SCROLLABLE CONTENT */}
      <main className="flex-1 flex flex-col md:flex-row overflow-hidden relative bg-slate-50 dark:bg-slate-950">
        
        {/* Teks Bacaan (Passage) */}
        <div className={`flex-1 md:w-1/2 overflow-y-auto scroll-container border-r border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 transition-all h-full ${currentQuestion.passage ? (mobileView === 'passage' ? 'block' : 'hidden md:block') : 'hidden'}`}>
          <div className="p-5 md:p-10 max-w-4xl mx-auto pb-32">
            <div className="flex items-center gap-3 mb-6">
              <span className="w-8 h-1 bg-[#1e3a8a] dark:bg-blue-500 rounded-full"></span>
              <h2 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Teks Bacaan</h2>
            </div>
            <MathText 
              content={currentQuestion.passage} 
              className="text-slate-800 dark:text-slate-200 text-base md:text-lg leading-relaxed md:leading-loose font-serif" 
            />
          </div>
        </div>

        {/* Area Pertanyaan */}
        <div className={`flex-1 overflow-y-auto scroll-container bg-white dark:bg-slate-950 transition-all h-full ${mobileView === 'question' ? 'block' : 'hidden md:block'}`}>
          <div className="p-4 md:p-10 max-w-3xl mx-auto pb-40"> {/* pb-40 for bottom nav space */}
            
            {/* Question Text & Image */}
            <div className="mb-8">
              {currentQuestion.imageUrl && (
                <div className="mb-6 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-2 rounded-2xl w-fit max-w-full">
                  <img 
                    src={currentQuestion.imageUrl} 
                    alt="Ilustrasi Soal" 
                    className="max-w-full h-auto rounded-xl object-contain max-h-[40vh]"
                  />
                </div>
              )}
              <MathText 
                content={currentQuestion.text} 
                className="text-lg md:text-2xl leading-relaxed text-slate-900 dark:text-slate-100 font-medium md:font-bold" 
              />
            </div>

            {/* Answer Options */}
            <div className="space-y-3 md:space-y-4">
              
              {/* Type: Pilihan Ganda Biasa */}
              {currentQuestion.type === QuestionType.MULTIPLE_CHOICE && currentQuestion.choices?.map((choice) => {
                const isSelected = currentResponse.answer === choice.id;
                return (
                  <button 
                    key={choice.id} 
                    onClick={() => handleAnswerChange(choice.id)} 
                    className={`w-full text-left p-4 md:p-5 rounded-xl md:rounded-2xl border-2 transition-all duration-200 flex items-start gap-4 md:gap-5 group
                      ${isSelected 
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10' 
                        : 'border-slate-200 dark:border-slate-800 hover:border-emerald-200 dark:hover:border-emerald-900 bg-white dark:bg-slate-900'
                      }`}
                  >
                    <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full md:rounded-xl flex items-center justify-center text-sm md:text-base font-bold flex-shrink-0 transition-colors mt-0.5
                         ${isSelected ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 group-hover:bg-slate-200 dark:group-hover:bg-slate-700'}
                    `}>
                        {choice.id}
                    </div>
                    <MathText 
                      content={choice.text} 
                      className={`text-base md:text-lg pt-1 md:pt-1.5 ${isSelected ? 'text-slate-900 dark:text-white font-bold' : 'text-slate-600 dark:text-slate-300 font-medium'}`} 
                    />
                  </button>
                )
              })}

              {/* Type: Pilihan Ganda Kompleks (Benar/Salah) */}
              {currentQuestion.type === QuestionType.COMPLEX_MULTIPLE_CHOICE && currentQuestion.statements?.map((s, idx) => {
                const userVals = (currentResponse.answer as boolean[]) || Array(currentQuestion.statements?.length).fill(null);
                return (
                  <div key={s.id} className="p-5 md:p-6 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col gap-4">
                    <p className="text-sm md:text-base font-bold text-slate-700 dark:text-slate-200 leading-relaxed">{s.text}</p>
                    <div className="flex gap-3">
                      <button onClick={() => { const newVals = [...userVals]; newVals[idx] = true; handleAnswerChange(newVals); }} className={`flex-1 py-3 rounded-xl font-bold text-xs md:text-sm border-2 transition-all ${userVals[idx] === true ? 'bg-emerald-500 text-white border-emerald-500' : 'border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>BENAR</button>
                      <button onClick={() => { const newVals = [...userVals]; newVals[idx] = false; handleAnswerChange(newVals); }} className={`flex-1 py-3 rounded-xl font-bold text-xs md:text-sm border-2 transition-all ${userVals[idx] === false ? 'bg-red-500 text-white border-red-500' : 'border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>SALAH</button>
                    </div>
                  </div>
                );
              })}

              {/* Type: Isian Singkat */}
              {currentQuestion.type === QuestionType.SHORT_ANSWER && (
                <input 
                  type="text" 
                  placeholder="Ketik jawaban singkat di sini..." 
                  value={currentResponse.answer || ''} 
                  onChange={(e) => handleAnswerChange(e.target.value)} 
                  className="w-full p-5 md:p-6 text-lg md:text-2xl font-bold border-2 border-slate-300 dark:border-slate-700 rounded-2xl focus:border-emerald-500 dark:focus:border-emerald-500 outline-none bg-white dark:bg-slate-900 text-slate-900 dark:text-white transition-all shadow-inner" 
                />
              )}
            </div>
            
          </div>
        </div>
      </main>

      {/* 4. STICKY BOTTOM ACTION BAR (Mobile-First Style) */}
      <footer className="fixed bottom-0 left-0 right-0 p-3 md:p-4 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 flex items-center gap-2 md:gap-4 z-30">
         <div className="w-full max-w-5xl mx-auto flex items-center gap-2 md:gap-4 px-2">
             
             {/* Prev Button */}
             <button 
                onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
                disabled={currentIndex === 0}
                className="p-3 md:px-6 md:py-4 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 disabled:opacity-30 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center justify-center font-bold"
             >
                 <ChevronLeft size={24} /> <span className="hidden md:inline ml-1 uppercase text-sm tracking-widest">Prev</span>
             </button>

             {/* Grid Drawer Button */}
             <button 
                onClick={() => setIsGridOpen(true)}
                className="flex-1 py-3 md:py-4 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors shadow-sm"
             >
                 <Grid size={20} />
                 <span className="hidden sm:inline uppercase tracking-widest text-sm">Daftar Soal</span>
                 <span className="sm:hidden uppercase tracking-widest text-xs">Grid</span>
             </button>

             {/* Flag Button */}
             <button 
                onClick={toggleFlag}
                className={`p-3 md:px-6 md:py-4 rounded-xl border-2 transition-colors flex items-center gap-2 font-bold uppercase tracking-widest text-sm
                  ${currentResponse.isFlagged 
                    ? 'bg-amber-100 border-amber-300 text-amber-600 dark:bg-amber-500/20 dark:border-amber-500/50 dark:text-amber-400 shadow-sm' 
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
             >
                 <Flag size={20} fill={currentResponse.isFlagged ? 'currentColor' : 'none'} />
                 <span className="hidden md:inline">Ragu</span>
             </button>

             {/* Next / Finish Button */}
             {currentIndex === subtest.questions.length - 1 ? (
                 <button 
                    onClick={handleFinishAttempt}
                    className={`p-3 md:px-8 md:py-4 rounded-xl font-black uppercase tracking-widest text-sm flex items-center justify-center transition-all md:hidden ${
                      isAllAnswered ? 'bg-emerald-600 text-white shadow-lg' : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
                    }`}
                 >
                    {isLastSubtest ? 'Kumpul' : 'Lanjut'}
                 </button>
             ) : (
                 <button 
                    onClick={() => setCurrentIndex(prev => Math.min(subtest.questions.length - 1, prev + 1))}
                    className="p-3 md:px-6 md:py-4 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:opacity-90 transition-opacity flex items-center justify-center font-bold shadow-md"
                 >
                    <span className="hidden md:inline mr-1 uppercase text-sm tracking-widest">Next</span> <ChevronRight size={24} />
                 </button>
             )}
         </div>
      </footer>

      {/* 5. QUESTIONS GRID DRAWER (Overlay) */}
      {isGridOpen && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsGridOpen(false)}></div>
            <div className="relative bg-white dark:bg-slate-900 w-full max-w-3xl sm:rounded-[2.5rem] rounded-t-[2rem] p-6 md:p-8 shadow-2xl max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom duration-300">
                
                <div className="flex items-center justify-between mb-8">
                    <div>
                      <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Navigasi Soal</h3>
                      <p className="text-sm font-bold text-slate-400 mt-1 uppercase tracking-widest">{subtest.title}</p>
                    </div>
                    <button onClick={() => setIsGridOpen(false)} className="p-3 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700">
                        <X size={24} />
                    </button>
                </div>
                
                <div className="grid grid-cols-5 sm:grid-cols-8 gap-3 md:gap-4 mb-8">
                    {subtest.questions.map((q, idx) => {
                        const resp = responses[q.id];
                        const isAnswered = resp?.answer !== null && resp?.answer !== undefined && resp.answer !== '';
                        const isFlagged = resp?.isFlagged;
                        
                        return (
                            <button
                                key={q.id}
                                onClick={() => {
                                    setCurrentIndex(idx);
                                    setIsGridOpen(false);
                                }}
                                className={`aspect-square rounded-xl md:rounded-2xl font-black text-base md:text-lg flex items-center justify-center border-2 transition-all relative
                                    ${currentIndex === idx ? 'ring-4 ring-slate-300 dark:ring-slate-700 ring-offset-2 dark:ring-offset-slate-900' : ''}
                                    ${isFlagged ? 'bg-amber-100 border-amber-400 text-amber-700 dark:bg-amber-500/20 dark:border-amber-500/50 dark:text-amber-400' :
                                      isAnswered ? 'bg-emerald-500 border-emerald-500 text-white shadow-md' :
                                      'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-100'}
                                `}
                            >
                                {idx + 1}
                                {isFlagged && <div className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-amber-500 rounded-full shadow-sm" />}
                            </button>
                        )
                    })}
                </div>

                <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8 text-xs font-bold text-slate-500 uppercase tracking-widest bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl">
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-emerald-500 rounded-md"></div> Dijawab
                    </div>
                     <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-amber-100 border-2 border-amber-400 rounded-md relative">
                          <div className="absolute top-0 right-0 w-1.5 h-1.5 bg-amber-500 rounded-full"></div>
                        </div> Ragu-ragu
                    </div>
                     <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-slate-50 border-2 border-slate-200 rounded-md"></div> Kosong
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* 6. MODAL KONFIRMASI SELESAI */}
      {showConfirm && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[200] flex items-center justify-center p-6">
           <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] max-w-md w-full p-8 md:p-10 shadow-2xl animate-in zoom-in-95 duration-200">
              <div className="bg-orange-100 dark:bg-orange-900/30 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-orange-500">
                 <AlertCircle size={40} />
              </div>
              <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white text-center mb-2">
                 {isLastSubtest ? 'Selesaikan Ujian?' : 'Akhiri Subtes?'}
              </h2>
              
              <div className="bg-slate-50 dark:bg-slate-800 rounded-3xl p-6 my-8 border border-slate-100 dark:border-slate-700">
                 <div className="flex justify-between items-center mb-3">
                    <span className="text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-widest">Progress Jawaban</span>
                    <span className="font-black text-slate-800 dark:text-white">{answeredCount} / {subtest.questions.length}</span>
                 </div>
                 <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${(answeredCount/subtest.questions.length)*100}%` }}></div>
                 </div>
                 <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-4 font-medium leading-relaxed">
                    {answeredCount < subtest.questions.length 
                      ? "⚠️ Masih ada soal yang belum dijawab. Waktu yang tersisa akan hangus." 
                      : "Kamu sudah menjawab semua soal di subtes ini. Luar biasa!"}
                 </p>
              </div>

              <div className="flex flex-col gap-3">
                 <button 
                  onClick={() => {
                    setShowConfirm(false);
                    onSubtestComplete();
                  }}
                  className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-white rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl shadow-emerald-500/20 transition-all"
                 >
                  Ya, Kumpulkan
                 </button>
                 <button 
                  onClick={() => setShowConfirm(false)}
                  className="w-full py-4 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                 >
                  Cek Ulang
                 </button>
              </div>
           </div>
        </div>
      )}

    </div>
  );
};

export default CBTInterface;