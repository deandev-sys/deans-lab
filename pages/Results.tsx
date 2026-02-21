import React, { useState, useEffect } from 'react';
import { ExamResult, QuestionType, Question, ExamPackage } from '../types';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { Share2, RefreshCw, ChevronDown, CheckCircle, XCircle, ChevronLeft, Info, HelpCircle, Loader2 } from 'lucide-react';
import MathText from '../components/MathText';
import { supabase } from '../src/lib/supabase'; // <-- WAJIB IMPORT INI

interface ResultsProps {
  result: ExamResult;
  packages: ExamPackage[]; 
  onBack: () => void;
}

export const Results: React.FC<ResultsProps> = ({ result, packages, onBack }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'review'>('overview');
  const [showIRTInfo, setShowIRTInfo] = useState(false);
  
  // STATE BARU: Untuk menyimpan soal yang utuh beserta pembahasannya
  const [fullQuestions, setFullQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const pkgId = (result as any).package_id || result.packageId;
  const totalScore = (result as any).total_score || result.totalScore;
  const subjectScores = (result as any).subject_scores || result.subjectScores || {};

  // --- LOGIKA BARU: AUTO-FETCH DATA SOAL JIKA KOSONG ---
  useEffect(() => {
    const loadQuestions = async () => {
      setIsLoading(true);
      const pkg = packages.find(p => p.id === pkgId);
      const existingQ = pkg ? pkg.subtests.flatMap(s => s.questions || []) : [];
      
      // Cek apakah data sudah lengkap (punya teks pertanyaan). Kalau ya, langsung pakai.
      if (existingQ.length > 0 && existingQ[0].text) {
        setFullQuestions(existingQ);
        setIsLoading(false);
        return;
      }

      // Jika data tidak lengkap, fetch dari Supabase
      const { data, error } = await supabase.from('questions').select('*').eq('package_id', pkgId);
      
      if (data && !error) {
        const mappedQuestions = data.map((q: any) => ({
          ...q,
          id: q.id.toString(),
          text: q.question_text,
          correctAnswer: q.correct_answer,
          imageUrl: q.image_url,
          choices: q.choices ? Object.entries(q.choices).map(([id, text]) => ({ id, text: text as string })) : []
        }));
        setFullQuestions(mappedQuestions);
      }
      setIsLoading(false);
    };

    loadQuestions();
  }, [pkgId, packages]);

  // Logika Cek Benar/Salah
  const isCorrect = (q: Question) => {
    const resp = result.responses[q.id];
    if (!resp || resp.answer === null || resp.answer === undefined) return false;

    if (q.type === QuestionType.MULTIPLE_CHOICE || q.type === 'MULTIPLE_CHOICE') {
      return resp.answer === q.correctAnswer;
    } else if (q.type === QuestionType.SHORT_ANSWER || q.type === 'SHORT_ANSWER') {
      return String(resp.answer).trim().toLowerCase() === String(q.correctAnswer).trim().toLowerCase();
    } else if (q.type === QuestionType.COMPLEX_MULTIPLE_CHOICE || q.type === 'COMPLEX_MULTIPLE_CHOICE') {
      const userAnswers = resp.answer as boolean[];
      return q.statements?.every((s, idx) => userAnswers && userAnswers[idx] === s.correctValue) ?? false;
    }
    return false;
  };

  const chartColors = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#ef4444', '#6366f1'];
  const chartData = Object.entries(subjectScores).map(([name, score], idx) => ({
    name: name.split(' ').map(w => w[0]).join(''), 
    fullName: name,
    score: score as number,
    color: chartColors[idx % chartColors.length]
  }));

  const correctCount = fullQuestions.filter(q => isCorrect(q)).length;
  const totalCount = fullQuestions.length;
  const wrongCount = totalCount - correctCount;

  let headerText = "Luar Biasa!";
  let subHeaderText = "Hasil belajarmu mulai terlihat. Terus pertahankan!";
  if (totalScore >= 700) { headerText = "Gokil Abis! 🔥"; subHeaderText = "Kamu masuk jajaran top scorer. Keren parah!"; }
  else if (totalScore < 400) { headerText = "Tetap Semangat! 💪"; subHeaderText = "Jangan menyerah, perjalanan masih panjang. Evaluasi lagi yuk!"; }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 animate-fade-in">
        <Loader2 className="animate-spin text-[#1e3a8a] dark:text-emerald-500 mb-4" size={48} />
        <p className="font-bold text-slate-400 animate-pulse">Menyiapkan Lembar Pembahasan...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in max-w-4xl mx-auto pb-20">
      
      <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors font-bold mt-4">
        <ChevronLeft size={20} /> Kembali ke Riwayat
      </button>

      <div className="text-center py-4">
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-400 mb-2">{headerText}</h1>
        <p className="text-slate-500 dark:text-slate-400 text-lg">{subHeaderText}</p>
      </div>

      <div className="flex gap-4 border-b border-slate-200 dark:border-slate-800">
         <button 
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'overview' ? 'border-[#1e3a8a] dark:border-emerald-400 text-[#1e3a8a] dark:text-emerald-400' : 'border-transparent text-slate-400 dark:text-slate-500'}`}
         >
           Ringkasan Skor
         </button>
         <button 
          onClick={() => setActiveTab('review')}
          className={`px-4 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'review' ? 'border-[#1e3a8a] dark:border-emerald-400 text-[#1e3a8a] dark:text-emerald-400' : 'border-transparent text-slate-400 dark:text-slate-500'}`}
         >
           Review & Pembahasan
         </button>
      </div>

      {activeTab === 'overview' ? (
        <div className="space-y-8 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800 shadow-xl flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
             <div className="flex flex-col items-center md:items-start relative z-10">
                 <div className="flex items-center gap-2 mb-2 text-slate-500 dark:text-slate-400">
                    <span className="text-sm font-bold uppercase tracking-wider">Total Skor IRT</span>
                    <button 
                      onMouseEnter={() => setShowIRTInfo(true)}
                      onMouseLeave={() => setShowIRTInfo(false)}
                      onClick={() => setShowIRTInfo(!showIRTInfo)}
                      className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors relative"
                    >
                      <Info size={16} />
                      {showIRTInfo && (
                        <div className="absolute top-full left-0 mt-2 w-64 bg-slate-800 text-white p-4 rounded-2xl shadow-2xl z-50 text-xs font-medium normal-case tracking-normal">
                          <p className="font-bold text-emerald-400 mb-1">Apa itu Skor IRT?</p>
                          <p>Sistem penilaian di mana bobot nilai tiap soal berbeda. Soal yang sulit dijawab oleh banyak orang memberikan poin lebih tinggi.</p>
                        </div>
                      )}
                    </button>
                 </div>
                 <div className="text-7xl md:text-[6rem] font-black text-[#1e3a8a] dark:text-emerald-400 tracking-tighter leading-none">
                     {totalScore}
                 </div>
             </div>
             <div className="flex gap-4 relative z-10">
                 <button onClick={onBack} className="flex flex-col items-center justify-center w-24 h-24 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold gap-2 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                     <RefreshCw size={24} />
                     <span className="text-xs">Kembali</span>
                 </button>
                 <button onClick={() => alert('Fitur Share Segera Hadir!')} className="flex flex-col items-center justify-center w-24 h-24 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 font-bold gap-2 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-colors">
                     <Share2 size={24} />
                     <span className="text-xs">Pamer</span>
                 </button>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 text-center shadow-sm">
              <CheckCircle className="mx-auto text-emerald-500 mb-4" size={32} />
              <p className="text-slate-400 text-xs font-bold uppercase mb-1">Terjawab Benar</p>
              <p className="text-3xl font-black text-slate-800 dark:text-white">{correctCount}</p>
            </div>
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 text-center shadow-sm">
              <XCircle className="mx-auto text-red-500 mb-4" size={32} />
              <p className="text-slate-400 text-xs font-bold uppercase mb-1">Salah / Kosong</p>
              <p className="text-3xl font-black text-slate-800 dark:text-white">{wrongCount}</p>
            </div>
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 text-center shadow-sm">
              <HelpCircle className="mx-auto text-blue-500 mb-4" size={32} />
              <p className="text-slate-400 text-xs font-bold uppercase mb-1">Total Soal</p>
              <p className="text-3xl font-black text-slate-800 dark:text-white">{totalCount}</p>
            </div>
          </div>

          {chartData.length > 0 && (
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
              <h3 className="text-xl font-bold mb-6 text-slate-900 dark:text-white">Detail Skor Subtes</h3>
              <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                          <YAxis hide />
                          <Tooltip 
                              cursor={{fill: 'transparent'}}
                              contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff' }}
                              labelFormatter={(label, payload) => payload[0]?.payload.fullName || label}
                          />
                          <Bar dataKey="score" radius={[8, 8, 8, 8]}>
                              {chartData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                          </Bar>
                      </BarChart>
                  </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      ) : (

        <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm animate-fade-in">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Pembahasan Lengkap</h3>
              <span className="text-sm font-bold text-slate-500 bg-white dark:bg-slate-900 px-3 py-1 rounded-full shadow-sm">
                {totalCount} Soal
              </span>
          </div>
          
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {fullQuestions.map((q, idx) => {
                  const resp = result.responses[q.id];
                  const correct = isCorrect(q);
                  
                  return (
                      <div key={q.id} className="p-6 md:p-8 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors group">
                          
                          <div className="flex items-start gap-4 mb-6">
                              <div className={`mt-1 flex-shrink-0 ${correct ? 'text-emerald-500' : 'text-red-500'}`}>
                                  {correct ? <CheckCircle size={28} /> : <XCircle size={28} />}
                              </div>
                              <div className="flex-1 min-w-0">
                                  <div className="flex justify-between items-center mb-3">
                                      <h4 className="font-bold text-slate-900 dark:text-white text-lg">
                                        Soal {idx + 1} <span className="text-slate-400 dark:text-slate-500 font-normal ml-2 text-sm hidden sm:inline-block">{q.subject}</span>
                                      </h4>
                                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shrink-0 ${correct ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                                         {correct ? 'BENAR' : 'SALAH'}
                                      </span>
                                  </div>
                                  
                                  {q.passage && (
                                    <div className="p-4 mb-4 bg-slate-50 dark:bg-slate-800 rounded-2xl text-sm italic border-l-4 border-blue-300 dark:border-blue-600 overflow-x-auto">
                                      <MathText content={q.passage} className="text-slate-600 dark:text-slate-300" />
                                    </div>
                                  )}
                                  
                                  <div className="mb-6 overflow-x-auto">
                                    {q.imageUrl && <img src={q.imageUrl} alt="soal" className="max-h-40 rounded-lg mb-4" />}
                                    <MathText content={q.text} className="text-slate-800 dark:text-slate-200 font-medium" />
                                  </div>

                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                     <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-x-auto">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Jawaban Kamu</p>
                                        <div className={`font-bold ${correct ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                                           {q.type === 'COMPLEX_MULTIPLE_CHOICE' 
                                            ? (resp?.answer ? 'Selesai Dikerjakan' : 'Kosong') 
                                            : <MathText content={resp?.answer || 'Kosong'} />}
                                        </div>
                                     </div>
                                     <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/50 overflow-x-auto">
                                        <p className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase mb-2">Kunci Jawaban</p>
                                        <div className="font-bold text-blue-800 dark:text-blue-300">
                                           {q.type === 'MULTIPLE_CHOICE' ? <MathText content={q.correctAnswer} /> : 
                                            q.type === 'SHORT_ANSWER' ? <MathText content={q.correctAnswer} /> : 
                                            'Sesuai Pembahasan'}
                                        </div>
                                     </div>
                                  </div>

                                  {q.explanation && (
                                    <div className="p-5 bg-emerald-50 dark:bg-emerald-900/10 rounded-2xl border border-emerald-100 dark:border-emerald-800/50 overflow-x-auto">
                                       <div className="flex items-center gap-2 mb-3 text-emerald-700 dark:text-emerald-400 font-bold text-sm uppercase tracking-wider">
                                          <Info size={16} /> Pembahasan Pakar
                                       </div>
                                       <MathText content={q.explanation} className="text-sm text-slate-700 dark:text-slate-300" />
                                    </div>
                                  )}
                              </div>
                          </div>
                      </div>
                  )
              })}
          </div>
        </div>
      )}

    </div>
  );
};

export default Results;