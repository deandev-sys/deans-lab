import React, { useState } from 'react';
import { ExamResult, QuestionType, Question, ExamPackage } from '../types';
import { Trophy, CheckCircle, XCircle, ChevronLeft, Info, HelpCircle } from 'lucide-react';

interface ResultsProps {
  result: ExamResult;
  packages: ExamPackage[]; // Menerima data paket asli dari App.tsx
  onBack: () => void;
}

const Results: React.FC<ResultsProps> = ({ result, packages, onBack }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'review'>('overview');
  const [showIRTInfo, setShowIRTInfo] = useState(false);
  
  // 1. CARI PAKET DI DATABASE (Bukan lagi di MOCK_EXAM_PACKAGES)
  // Kita pakai fallback || untuk menangani format data lama vs data baru dari Supabase
  const pkgId = (result as any).package_id || result.packageId;
  const pkg = packages.find(p => p.id === pkgId);
  const allQuestions = pkg ? pkg.subtests.flatMap(s => s.questions) : [];

  // 2. AMAN DARI SNAKE_CASE SUPABASE
  const totalScore = (result as any).total_score || result.totalScore;
  const packageTitle = (result as any).package_title || result.packageTitle;
  const date = result.date || new Date((result as any).created_at).toLocaleDateString('id-ID');
  const subjectScores = (result as any).subject_scores || result.subjectScores || {};

  const isCorrect = (q: Question) => {
    const resp = result.responses[q.id];
    if (!resp || resp.answer === null) return false;

    if (q.type === QuestionType.MULTIPLE_CHOICE) {
      return resp.answer === q.correctAnswer;
    } else if (q.type === QuestionType.SHORT_ANSWER) {
      return resp.answer?.trim().toLowerCase() === q.correctAnswer?.trim().toLowerCase();
    } else if (q.type === QuestionType.COMPLEX_MULTIPLE_CHOICE) {
      const userAnswers = resp.answer as boolean[];
      return q.statements?.every((s, idx) => userAnswers && userAnswers[idx] === s.correctValue) ?? false;
    }
    return false;
  };

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
      <button onClick={onBack} className="flex items-center gap-2 text-slate-500 font-bold mb-4 hover:text-[#1e3a8a] transition-colors">
        <ChevronLeft size={20} />
        Kembali ke Riwayat
      </button>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Score Card */}
        <div className="flex-1 bg-[#1e3a8a] rounded-3xl p-6 md:p-10 text-white relative overflow-hidden shadow-xl">
          <Trophy className="absolute top-1/2 -right-4 -translate-y-1/2 opacity-10 w-48 h-48" />
          <div className="flex items-center gap-2 mb-2">
            <h1 className="text-lg md:text-xl font-bold">Skor IRT Kamu</h1>
            <div className="relative">
              <button 
                onMouseEnter={() => setShowIRTInfo(true)}
                onMouseLeave={() => setShowIRTInfo(false)}
                onClick={() => setShowIRTInfo(!showIRTInfo)}
                className="p-1 hover:bg-white/20 rounded-full transition-colors"
              >
                <Info size={16} />
              </button>
              {showIRTInfo && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-white text-slate-800 p-4 rounded-2xl shadow-2xl z-50 text-xs font-medium border border-slate-100 animate-pop-in">
                  <p className="font-bold text-[#1e3a8a] mb-2">Apa itu Skor IRT?</p>
                  <p className="leading-relaxed">
                    Item Response Theory (IRT) adalah sistem penilaian di mana bobot nilai tiap soal berbeda. 
                    <span className="text-[#1e3a8a] font-bold"> Soal yang sulit dijawab oleh banyak orang memberikan poin lebih tinggi</span> dibanding soal yang mudah.
                  </p>
                </div>
              )}
            </div>
          </div>
          <p className="text-5xl md:text-7xl font-black mb-6">{totalScore}</p>
          <div className="grid grid-cols-2 gap-3">
             <div className="bg-white/10 p-3 rounded-2xl backdrop-blur-sm">
                <p className="text-[10px] uppercase font-bold text-blue-300">Package</p>
                <p className="text-sm font-bold truncate">{packageTitle}</p>
             </div>
             <div className="bg-white/10 p-3 rounded-2xl backdrop-blur-sm">
                <p className="text-[10px] uppercase font-bold text-blue-300">Tanggal</p>
                <p className="text-sm font-bold">{date}</p>
             </div>
          </div>
        </div>

        {/* Subject Stats */}
        <div className="flex-[1.5] bg-white rounded-3xl border border-slate-100 shadow-sm p-6 md:p-8">
           <h3 className="font-black text-lg mb-6">Analisis Per Subtes</h3>
           <div className="space-y-6">
              {Object.entries(subjectScores).map(([subject, score]: any) => (
                <div key={subject}>
                   <div className="flex justify-between items-end mb-2 text-sm">
                      <p className="font-bold text-slate-700">{subject}</p>
                      <p className="font-black text-[#1e3a8a]">{score}</p>
                   </div>
                   <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-emerald-500 rounded-full transition-all duration-1000"
                        style={{ width: `${(score / 1000) * 100}%` }}
                      ></div>
                   </div>
                </div>
              ))}
           </div>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex gap-4 border-b">
         <button 
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'overview' ? 'border-[#1e3a8a] text-[#1e3a8a]' : 'border-transparent text-slate-400'}`}
         >
           Ringkasan
         </button>
         <button 
          onClick={() => setActiveTab('review')}
          className={`px-4 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'review' ? 'border-[#1e3a8a] text-[#1e3a8a]' : 'border-transparent text-slate-400'}`}
         >
           Review Soal
         </button>
      </div>

      {activeTab === 'overview' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 text-center">
            <CheckCircle className="mx-auto text-emerald-500 mb-4" size={32} />
            <p className="text-slate-400 text-xs font-bold uppercase mb-1">Terjawab Benar</p>
            <p className="text-3xl font-black">{allQuestions.filter(q => isCorrect(q)).length}</p>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-slate-100 text-center">
            <XCircle className="mx-auto text-red-400 mb-4" size={32} />
            <p className="text-slate-400 text-xs font-bold uppercase mb-1">Salah / Kosong</p>
            <p className="text-3xl font-black">{allQuestions.length - allQuestions.filter(q => isCorrect(q)).length}</p>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-slate-100 text-center">
            <HelpCircle className="mx-auto text-blue-400 mb-4" size={32} />
            <p className="text-slate-400 text-xs font-bold uppercase mb-1">Total Soal</p>
            <p className="text-3xl font-black">{allQuestions.length}</p>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
           {allQuestions.map((q, idx) => {
              const resp = result.responses[q.id];
              const correct = isCorrect(q);
              
              return (
                <div key={q.id} className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
                   <div className={`p-4 md:p-6 flex justify-between items-start ${correct ? 'bg-emerald-50' : 'bg-red-50'}`}>
                      <div className="flex gap-4">
                         <span className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white flex items-center justify-center font-black text-[#1e3a8a] shadow-sm shrink-0">
                            {idx + 1}
                         </span>
                         <div>
                            <p className="text-sm md:text-base font-bold text-slate-700 mb-1">{q.subject}</p>
                            <p className="text-xs font-medium text-slate-400">Kesulitan: {q.difficulty || 3}/5</p>
                         </div>
                      </div>
                      <div className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest ${correct ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>
                         {correct ? 'BENAR' : 'SALAH'}
                      </div>
                   </div>

                   <div className="p-6 space-y-6">
                      {q.passage && (
                        <div className="p-4 bg-slate-50 rounded-2xl text-sm italic text-slate-600 border-l-4 border-blue-200">
                           {q.passage}
                        </div>
                      )}
                      
                      <p className="text-lg font-medium text-slate-800">{q.text}</p>

                      <div className="space-y-3">
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-4 rounded-2xl bg-slate-100 border border-slate-200">
                               <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Jawaban Kamu</p>
                               <p className="font-bold text-slate-700">
                                 {q.type === QuestionType.COMPLEX_MULTIPLE_CHOICE 
                                  ? (resp?.answer ? 'Selesai Dikerjakan' : 'Kosong') 
                                  : (resp?.answer || 'Kosong')}
                               </p>
                            </div>
                            <div className="p-4 rounded-2xl bg-[#1e3a8a]/5 border border-[#1e3a8a]/10">
                               <p className="text-[10px] font-bold text-[#1e3a8a] uppercase mb-2">Kunci Jawaban</p>
                               <p className="font-bold text-[#1e3a8a]">
                                 {q.type === QuestionType.MULTIPLE_CHOICE ? q.correctAnswer : 
                                  q.type === QuestionType.SHORT_ANSWER ? q.correctAnswer : 
                                  'Sesuai Pembahasan'}
                               </p>
                            </div>
                         </div>

                         {q.explanation && (
                           <div className="mt-6 p-6 bg-emerald-50 rounded-2xl border border-emerald-100">
                              <div className="flex items-center gap-2 mb-3 text-emerald-700 font-bold">
                                 <Info size={18} />
                                 Pembahasan
                              </div>
                              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                                 {q.explanation}
                              </p>
                           </div>
                         )}
                      </div>
                   </div>
                </div>
              )
           })}
        </div>
      )}
    </div>
  );
};

export default Results;