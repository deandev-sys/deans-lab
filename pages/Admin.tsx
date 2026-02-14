import React, { useState, useEffect, useRef } from 'react';
import { Package, Plus, Trash2, Eye, Database, TrendingUp, X, Save, Edit3, Book, AlertCircle, Loader2, ChevronRight, MessageSquareQuote, UploadCloud, Download, Award, Link as LinkIcon } from 'lucide-react';
import { supabase } from '../src/lib/supabase';
import { ExamPackage, Question } from '../types';

// --- FUNGSI PARSER CSV (Tetap sama) ---
const parseCSV = (csvText: string) => {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentCell = '';
  let inQuotes = false;
  
  for (let i = 0; i < csvText.length; i++) {
    const char = csvText[i];
    if (inQuotes) {
      if (char === '"' && csvText[i + 1] === '"') {
        currentCell += '"'; i++;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        currentCell += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ',') {
        currentRow.push(currentCell);
        currentCell = '';
      } else if (char === '\n' || char === '\r') {
        if (char === '\r' && csvText[i + 1] === '\n') i++;
        currentRow.push(currentCell);
        rows.push(currentRow);
        currentRow = [];
        currentCell = '';
      } else {
        currentCell += char;
      }
    }
  }
  if (currentRow.length || currentCell) {
    currentRow.push(currentCell);
    rows.push(currentRow);
  }
  return rows;
};

// --- DAFTAR MAPEL DAN TOPIK ---
const SUBJECT_TOPICS: Record<string, string[]> = {
  'Penalaran Umum': ['Campuran', 'Penalaran Induktif', 'Penalaran Deduktif', 'Penalaran Kuantitatif'],
  'Pengetahuan Kuantitatif': ['Campuran', 'Bilangan', 'Aljabar & Fungsi', 'Geometri', 'Statistika & Peluang'],
  'PPU': ['Campuran', 'Ide Pokok & Kesimpulan', 'Kepaduan Paragraf', 'Makna Kata'],
  'PBM': ['Campuran', 'Ejaan (PUEBI)', 'Tanda Baca', 'Kalimat Efektif'],
  'Literasi Bahasa Indonesia': ['Campuran', 'Teks Sastra', 'Teks Informasi'],
  'Literasi Bahasa Inggris': ['Campuran', 'Main Idea', 'Detail Information', 'Vocabulary in Context'],
  'Penalaran Matematika': ['Campuran', 'Aritmatika Sosial', 'Geometri Aplikatif', 'Data & Ketidakpastian']
};

const AdminPanel: React.FC = () => {
  const [packages, setPackages] = useState<any[]>([]);
  const [currentView, setCurrentView] = useState<'list' | 'package-form' | 'question-editor' | 'subtest-manager'>('list');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPkg, setSelectedPkg] = useState<any>(null);
  
  // Package Form States
  const [newPkgTitle, setNewPkgTitle] = useState('');
  const [newPkgPrice, setNewPkgPrice] = useState('');
  const [newPkgLynkUrl, setNewPkgLynkUrl] = useState(''); // <--- STATE BARU
  const [newPkgType, setNewPkgType] = useState<'FULL' | 'MINI'>('FULL');
  const [newPkgSubject, setNewPkgSubject] = useState('Penalaran Umum');
  const [newPkgTopic, setNewPkgTopic] = useState('Campuran');

  // Question Form States
  const [editQId, setEditQId] = useState<string | null>(null); 
  const [qSubject, setQSubject] = useState('Penalaran Umum');
  const [qPassage, setQPassage] = useState('');
  const [qText, setQText] = useState('');
  const [qImageUrl, setQImageUrl] = useState('');
  const [qChoices, setQChoices] = useState({ A: '', B: '', C: '', D: '', E: '' });
  const [qCorrect, setQCorrect] = useState('A');
  const [qExplanation, setQExplanation] = useState('');
  const [qType, setQType] = useState('MULTIPLE_CHOICE');
  const [qShortAnswer, setQShortAnswer] = useState('');
  const [qStatements, setQStatements] = useState([
    { id: 's1', text: '', correctValue: true },
    { id: 's2', text: '', correctValue: false },
    { id: 's3', text: '', correctValue: true }
  ]);
  const [pkgQuestions, setPkgQuestions] = useState<any[]>([]); 
  
  // Subtest Form States
  const [stTitle, setStTitle] = useState('Penalaran Umum');
  const [stDuration, setStDuration] = useState('30');
  const [pkgSubtests, setPkgSubtests] = useState<any[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchAdminPackages = async () => {
    setIsLoading(true);
    const { data, error } = await supabase.from('packages').select('*').order('created_at', { ascending: false });
    if (data) setPackages(data);
    setIsLoading(false);
  };

  useEffect(() => { fetchAdminPackages(); }, []);

  const handleSavePackage = async () => {
    if (!newPkgTitle) return alert("Isi judul dulu, Dean!");
    setIsLoading(true);
    
    const finalSubject = newPkgType === 'FULL' ? 'ALL' : newPkgSubject;
    const finalTopic = newPkgType === 'FULL' ? 'Campuran' : newPkgTopic;

    // Logic Simpan ke Supabase (termasuk lynk_url)
    const { error } = await supabase.from('packages').insert([{
      id: `pkg-${Date.now()}`,
      title: newPkgTitle,
      price: parseInt(newPkgPrice) || 0,
      is_premium: parseInt(newPkgPrice) > 0,
      package_type: newPkgType, 
      subject: finalSubject,    
      topic: finalTopic,
      lynk_url: newPkgLynkUrl, // <--- SIMPAN KE DB
      created_at: new Date().toISOString()
    }]);

    if (!error) {
      alert("Paket dibuat! Sekarang mari tambah soalnya.");
      fetchAdminPackages();
      setNewPkgTitle('');
      setNewPkgPrice('');
      setNewPkgLynkUrl(''); // Reset field
      setNewPkgType('FULL');
      setCurrentView('list');
    } else {
      alert("Gagal menyimpan paket: " + error.message);
    }
    setIsLoading(false);
  };

  const handleDeletePackage = async (pkgId: string, pkgTitle: string) => {
    if (window.confirm(`🚨 YAKIN HAPUS PAKET "${pkgTitle}"?\n\nSemua Subtes dan Soal di dalamnya akan ikut lenyap permanen!`)) {
      setIsLoading(true);
      const { error } = await supabase.from('packages').delete().eq('id', pkgId);
      
      if (!error) {
        alert("Paket dan seluruh isinya berhasil dibumihanguskan! 💥");
        fetchAdminPackages(); 
      } else {
        alert("Gagal menghapus: " + error.message);
      }
      setIsLoading(false);
    }
  };

  // ... (Reset Question Form logic sama)
  const resetQuestionForm = () => {
    setEditQId(null);
    setQPassage(''); setQText(''); setQImageUrl(''); setQExplanation('');
    setQChoices({ A: '', B: '', C: '', D: '', E: '' });
    setQShortAnswer('');
    setQStatements([{ id: 's1', text: '', correctValue: true }, { id: 's2', text: '', correctValue: false }, { id: 's3', text: '', correctValue: true }]);
  };

  // ... (Fetch Questions, Subtests, dll sama persis)
  const fetchQuestionsForPackage = async (packageId: string) => {
    setIsLoading(true);
    const { data, error } = await supabase.from('questions').select('*').eq('package_id', packageId);
    if (data) {
      const sortedData = data.sort((a, b) => {
        const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;
        return timeB - timeA;
      });
      setPkgQuestions(sortedData);
    }
    setIsLoading(false);
  };

  const handleSaveQuestion = async () => {
    if (!qText || !selectedPkg) return alert("Soal tidak boleh kosong!");
    setIsLoading(true);

    const payload: any = {
      package_id: selectedPkg.id,
      subject: qSubject,
      passage: qPassage,
      question_text: qText,
      image_url: qImageUrl,
      explanation: qExplanation,
      type: qType 
    };

    if (qType === 'MULTIPLE_CHOICE') {
      payload.choices = qChoices;
      payload.correct_answer = qCorrect;
    } else if (qType === 'SHORT_ANSWER') {
      payload.correct_answer = qShortAnswer;
    } else if (qType === 'COMPLEX_MULTIPLE_CHOICE') {
      payload.statements = qStatements;
    }

    if (editQId) {
      const { error } = await supabase.from('questions').update(payload).eq('id', editQId);
      if (!error) {
        alert("Soal berhasil diperbarui! ✏️");
        resetQuestionForm();
        fetchQuestionsForPackage(selectedPkg.id);
      } else alert("Gagal update: " + error.message);
    } else {
      payload.id = `q-${Date.now()}`;
      const { error } = await supabase.from('questions').insert([payload]);
      if (!error) {
        alert("Soal berhasil ditambahkan! ✅");
        resetQuestionForm();
        fetchQuestionsForPackage(selectedPkg.id);
      } else alert("Gagal simpan: " + error.message);
    }
    setIsLoading(false);
  };

  const handleEditQuestion = (q: any) => {
    setEditQId(q.id);
    setQType(q.type || 'MULTIPLE_CHOICE');
    setQSubject(q.subject || 'Penalaran Umum');
    setQPassage(q.passage || '');
    setQText(q.question_text || '');
    setQImageUrl(q.image_url || '');
    setQExplanation(q.explanation || '');

    if (q.type === 'MULTIPLE_CHOICE') {
      setQChoices(q.choices || { A: '', B: '', C: '', D: '', E: '' });
      setQCorrect(q.correct_answer || 'A');
    } else if (q.type === 'SHORT_ANSWER') {
      setQShortAnswer(q.correct_answer || '');
    } else if (q.type === 'COMPLEX_MULTIPLE_CHOICE') {
      setQStatements(q.statements || [{ id: 's1', text: '', correctValue: true }]);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteQuestion = async (qId: string) => {
    if (window.confirm("Hapus soal ini secara permanen? 🗑️")) {
      setIsLoading(true);
      await supabase.from('questions').delete().eq('id', qId);
      fetchQuestionsForPackage(selectedPkg.id);
      setIsLoading(false);
    }
  };

  const fetchSubtestsForPackage = async (packageId: string) => {
    setIsLoading(true);
    const { data } = await supabase.from('subtests').select('*').eq('package_id', packageId).order('created_at', { ascending: true });
    if (data) setPkgSubtests(data);
    setIsLoading(false);
  };

  const handleSaveSubtest = async () => {
    if (!stTitle || !stDuration || !selectedPkg) return alert("Isi lengkap bro!");
    setIsLoading(true);
    const { error } = await supabase.from('subtests').insert([{
      id: `st-${Date.now()}`,
      package_id: selectedPkg.id,
      title: stTitle,
      duration_minutes: parseInt(stDuration) || 30,
      created_at: new Date().toISOString()
    }]);

    if (!error) {
      alert("Subtes berhasil dibuat!");
      fetchSubtestsForPackage(selectedPkg.id); 
    } else {
      alert("Gagal: " + error.message);
    }
    setIsLoading(false);
  };

  const handleDeleteSubtest = async (stId: string, stTitle: string) => {
    if (window.confirm(`Yakin hapus subtes "${stTitle}" beserta semua soalnya?`)) {
      setIsLoading(true);
      await supabase.from('subtests').delete().eq('id', stId);
      fetchSubtestsForPackage(selectedPkg.id);
      setIsLoading(false);
    }
  };

  // ... (CSV Upload Logic sama persis)
  const downloadTemplate = () => {
    const headers = [
      "Subject", "Question Type", "Passage (Optional)", "Image URL (Optional)", 
      "Question Text", "Opt A / Stmt 1", "Opt B / Stmt 2", "Opt C / Stmt 3", 
      "Opt D / Stmt 4", "Opt E / Stmt 5", "Answer / Correct Value", "Explanation"
    ];
    
    const sampleMC = [
      "Penalaran Umum", "MULTIPLE_CHOICE", "Teks bacaan panjang ditaruh di sini", "https://web.com/gambar.png", 
      "Berapa hasil dari 1 + 1?", "1", "2", "3", "4", "5", 
      "B", "Karena 1 ditambah 1 sama dengan 2."
    ];

    const sampleComplex = [
      "Literasi Bahasa Indonesia", "COMPLEX_MULTIPLE_CHOICE", "", "", 
      "Tentukan benar salah dari pernyataan berikut berdasarkan teks!", "Bumi itu bulat", "Matahari mengelilingi bumi", "Air mendidih pada suhu 100C", 
      "", "", "B,S,B", "Penjelasan fakta alam semesta."
    ];

    const sampleShort = [
      "Pengetahuan Kuantitatif", "SHORT_ANSWER", "", "", 
      "Berapakah akar kuadrat dari 144?", "", "", "", 
      "", "", "12", "Akar 144 adalah 12, tidak perlu dijelaskan lebih lanjut."
    ];
    
    const csvContent = headers.join(",") + "\n" + 
                       sampleMC.map(item => `"${item}"`).join(",") + "\n" +
                       sampleComplex.map(item => `"${item}"`).join(",") + "\n" +
                       sampleShort.map(item => `"${item}"`).join(",");
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "Template_Soal_Deans_Lab_V2.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedPkg) return;
    
    setIsLoading(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const csvText = event.target?.result as string;
        const rows = parseCSV(csvText);
        
        const payload = rows.slice(1).filter(r => r.length >= 11 && r[4]?.trim()).map((row, idx) => {
           const subject = row[0]?.trim() || 'Penalaran Umum';
           
           let type = 'MULTIPLE_CHOICE';
           const rawType = row[1]?.trim().toUpperCase();
           if (rawType === 'SHORT_ANSWER' || rawType === 'ISIAN SINGKAT') type = 'SHORT_ANSWER';
           if (rawType === 'COMPLEX_MULTIPLE_CHOICE' || rawType === 'BENAR SALAH') type = 'COMPLEX_MULTIPLE_CHOICE';

           const passage = row[2]?.trim() || '';
           const image_url = row[3]?.trim() || '';
           const question_text = row[4]?.trim() || '';
           
           const optA = row[5]?.trim() || '';
           const optB = row[6]?.trim() || '';
           const optC = row[7]?.trim() || '';
           const optD = row[8]?.trim() || '';
           const optE = row[9]?.trim() || '';
           
           const rawAnswer = row[10]?.trim() || '';
           const explanation = row[11]?.trim() || '';

           let choices = null;
           let correct_answer = null;
           let statements = null;

           if (type === 'MULTIPLE_CHOICE') {
              choices = { A: optA, B: optB, C: optC, D: optD, E: optE };
              correct_answer = rawAnswer.toUpperCase();
           } 
           else if (type === 'SHORT_ANSWER') {
              correct_answer = rawAnswer;
           } 
           else if (type === 'COMPLEX_MULTIPLE_CHOICE') {
              const ansArray = rawAnswer.split(',').map(a => a.trim().toUpperCase());
              const rawStatements = [optA, optB, optC, optD, optE].filter(s => s !== '');
              
              statements = rawStatements.map((txt, i) => {
                 const isTrue = ansArray[i] === 'B' || ansArray[i] === 'BENAR' || ansArray[i] === 'TRUE' || ansArray[i] === 'T';
                 return {
                    id: `s${i+1}`,
                    text: txt,
                    correctValue: isTrue
                 };
              });
           }

           return {
              id: `q-${Date.now()}-${idx}`,
              package_id: selectedPkg.id,
              subject: subject,
              passage: passage,
              image_url: image_url,
              question_text: question_text,
              type: type,
              choices: choices,
              correct_answer: correct_answer,
              statements: statements,
              explanation: explanation
           };
        });

        if (payload.length > 0) {
          const { error } = await supabase.from('questions').insert(payload);
          if (error) throw error;
          alert(`🔥 Sukses! ${payload.length} soal berhasil diunggah ke database.`);
          fetchQuestionsForPackage(selectedPkg.id); 
        } else {
          alert("CSV kosong atau formatnya salah. Harap ikuti template.");
        }
      } catch (err: any) {
        alert("Terjadi kesalahan: " + err.message);
      } finally {
        setIsLoading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="p-8 pb-24">
      <header className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-black text-[#1e3a8a]">Admin Dashboard 🛠️</h1>
          <p className="text-slate-500 mt-1">Platform Management & Bank Soal.</p>
        </div>
        <div className="flex gap-3">
          {currentView !== 'list' && (
            <button onClick={() => { setCurrentView('list'); resetQuestionForm(); }} className="bg-slate-100 text-slate-600 px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-200 transition-all">
              <Book size={20} /> Kembali
            </button>
          )}
          <button 
            onClick={() => setCurrentView('package-form')}
            className="bg-[#1e3a8a] text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-800 transition-all shadow-lg shadow-blue-100"
          >
            <Plus size={20} /> Paket Baru
          </button>
        </div>
      </header>

      {/* VIEW: DAFTAR PAKET */}
      {currentView === 'list' && (
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 text-[10px] font-black uppercase tracking-widest">
              <tr>
                <th className="px-8 py-5">Judul Paket</th>
                <th className="px-8 py-5">Tipe & Link</th>
                <th className="px-8 py-5 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {packages.map((pkg) => (
                <tr key={pkg.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-8 py-6">
                    <p className="font-bold text-slate-800 flex items-center gap-2">
                       {pkg.title} 
                       {pkg.price > 0 && <span className="px-2 py-0.5 rounded-md bg-orange-100 text-orange-600 text-[10px] font-black">PREMIUM</span>}
                    </p>
                    <p className="text-xs text-slate-400">ID: {pkg.id}</p>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col gap-1 items-start">
                       <span className={`px-3 py-1 rounded-full text-[10px] font-black ${pkg.package_type === 'FULL' ? 'bg-[#1e3a8a] text-white' : 'bg-emerald-100 text-emerald-700'}`}>
                         {pkg.package_type === 'FULL' ? 'SIMULASI FULL (7 Subtes)' : 'DRILLING MINI'}
                       </span>
                       {pkg.lynk_url && (
                         <a href={pkg.lynk_url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-[10px] font-bold text-blue-500 hover:underline mt-1">
                           <LinkIcon size={10} /> Link Checkout
                         </a>
                       )}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex justify-center gap-2">
                      <button 
                        onClick={() => { setSelectedPkg(pkg); fetchSubtestsForPackage(pkg.id); setCurrentView('subtest-manager'); }}
                        className="bg-purple-50 text-purple-600 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-purple-600 hover:text-white transition-all"
                      >
                        <Book size={14} /> Kelola Subtes
                      </button>
                      <button 
                        onClick={() => { setSelectedPkg(pkg); fetchQuestionsForPackage(pkg.id); resetQuestionForm(); setCurrentView('question-editor'); }}
                        className="bg-blue-50 text-blue-600 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-blue-600 hover:text-white transition-all"
                      >
                        <Edit3 size={14} /> Kelola Soal
                      </button>
                      <button 
                        onClick={() => handleDeletePackage(pkg.id, pkg.title)}
                        className="p-2 text-red-400 hover:bg-red-500 hover:text-white rounded-xl transition-all shadow-sm"
                        >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* VIEW: FORM PAKET BARU */}
      {currentView === 'package-form' && (
        <div className="max-w-2xl mx-auto bg-white p-10 rounded-[3rem] shadow-xl border border-slate-50">
          <h2 className="text-2xl font-black text-[#1e3a8a] mb-8">Informasi Paket 📦</h2>
          <div className="space-y-6">
            
            {/* Tipe Paket UI */}
            <div className="space-y-3">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Jenis Paket Ujian</label>
               <div className="flex gap-4">
                  <button onClick={() => setNewPkgType('FULL')} className={`flex-1 p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${newPkgType === 'FULL' ? 'border-[#1e3a8a] bg-blue-50/50 text-[#1e3a8a]' : 'border-slate-100 text-slate-400 hover:bg-slate-50'}`}>
                     <Award size={24} />
                     <span className="font-black text-sm">Simulasi FULL (7 Subtes)</span>
                  </button>
                  <button onClick={() => setNewPkgType('MINI')} className={`flex-1 p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${newPkgType === 'MINI' ? 'border-emerald-500 bg-emerald-50/50 text-emerald-600' : 'border-slate-100 text-slate-400 hover:bg-slate-50'}`}>
                     <TrendingUp size={24} />
                     <span className="font-black text-sm">Drilling MINI (Spesifik)</span>
                  </button>
               </div>
            </div>

            {newPkgType === 'MINI' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5 bg-emerald-50/30 rounded-3xl border border-emerald-100">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mata Pelajaran</label>
                    <select 
                       value={newPkgSubject} 
                       onChange={(e) => {
                          setNewPkgSubject(e.target.value);
                          setNewPkgTopic(SUBJECT_TOPICS[e.target.value][0]); 
                       }} 
                       className="w-full p-4 rounded-xl bg-white border border-slate-200 outline-none focus:ring-2 ring-emerald-200 text-sm font-bold text-slate-700"
                    >
                       {Object.keys(SUBJECT_TOPICS).map(subj => (
                          <option key={subj} value={subj}>{subj}</option>
                       ))}
                    </select>
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Materi Spesifik</label>
                    <select 
                       value={newPkgTopic} 
                       onChange={(e) => setNewPkgTopic(e.target.value)} 
                       className="w-full p-4 rounded-xl bg-white border border-slate-200 outline-none focus:ring-2 ring-emerald-200 text-sm font-bold text-slate-700"
                    >
                       {SUBJECT_TOPICS[newPkgSubject].map(topic => (
                          <option key={topic} value={topic}>{topic}</option>
                       ))}
                    </select>
                 </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Judul Try Out</label>
              <input value={newPkgTitle} onChange={(e) => setNewPkgTitle(e.target.value)} type="text" className="w-full p-4 rounded-2xl bg-slate-50 border-none outline-none focus:ring-2 ring-blue-100 transition-all" placeholder={newPkgType === 'FULL' ? "Contoh: TO Nasional #1" : "Contoh: Latihan Soal PU - Silogisme"} />
            </div>
            
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Harga (Rp)</label>
              <input value={newPkgPrice} onChange={(e) => setNewPkgPrice(e.target.value)} type="number" className="w-full p-4 rounded-2xl bg-slate-50 border-none outline-none focus:ring-2 ring-blue-100 transition-all" placeholder="0 untuk gratis" />
            </div>

            {/* FIELD BARU: LINK LYNK.ID */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <LinkIcon size={12} /> Link Checkout Lynk.id
              </label>
              <input 
                value={newPkgLynkUrl} 
                onChange={(e) => setNewPkgLynkUrl(e.target.value)} 
                type="text" 
                className="w-full p-4 rounded-2xl bg-slate-50 border-none outline-none focus:ring-2 ring-blue-100 transition-all" 
                placeholder="https://lynk.id/deanslab/..." 
              />
              <p className="text-[10px] text-slate-400">Kosongkan jika paket gratis.</p>
            </div>
            
            <button onClick={handleSavePackage} disabled={isLoading} className="w-full py-4 bg-[#1e3a8a] text-white rounded-2xl font-black shadow-lg shadow-blue-100 flex items-center justify-center gap-2">
              {isLoading ? <Loader2 className="animate-spin" /> : <Save size={20} />} SIMPAN PAKET
            </button>
          </div>
        </div>
      )}

      {/* ... SISA KODE (SUBTEST MANAGER & QUESTION EDITOR) TIDAK BERUBAH ... */}
      {/* ... Copy bagian bawah dari kode lama kamu mulai dari {currentView === 'subtest-manager' && ... sampai selesai ... */}
      
      {/* Agar tidak kepanjangan, saya cut di sini. Tapi di kode aslimu, pastikan bagian bawahnya tetap ada ya! */}
      {/* VIEW: MANAJER SUBTES */}
      {currentView === 'subtest-manager' && (
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="bg-purple-700 p-8 rounded-[2.5rem] text-white shadow-xl relative overflow-hidden">
             <div className="relative z-10">
               <p className="text-purple-200 text-xs font-bold uppercase tracking-widest mb-1">Pengaturan Waktu Ujian</p>
               <h2 className="text-2xl font-black">{selectedPkg?.title}</h2>
             </div>
             <Database className="absolute -right-4 -bottom-4 text-purple-800/50" size={120} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 col-span-1 h-fit">
              <h3 className="font-black text-slate-800 mb-6 flex items-center gap-2"><Plus size={18}/> Subtes Baru</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase">Nama Subtes</label>
                  <input value={stTitle} onChange={(e) => setStTitle(e.target.value)} type="text" className="w-full p-3 rounded-xl bg-slate-50 border-none outline-none focus:ring-2 ring-purple-200 transition-all text-sm" placeholder="cth: Penalaran Umum" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase">Durasi (Menit)</label>
                  <input value={stDuration} onChange={(e) => setStDuration(e.target.value)} type="number" className="w-full p-3 rounded-xl bg-slate-50 border-none outline-none focus:ring-2 ring-purple-200 transition-all text-sm" placeholder="30" />
                </div>
                <button onClick={handleSaveSubtest} disabled={isLoading} className="w-full py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition-all shadow-lg shadow-purple-200">
                  {isLoading ? <Loader2 className="animate-spin mx-auto" /> : 'Simpan Subtes'}
                </button>
              </div>
            </div>

            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 col-span-2">
              <h3 className="font-black text-slate-800 mb-6 flex items-center gap-2"><Book size={18}/> Daftar Subtes Aktif</h3>
              <div className="space-y-3">
                {pkgSubtests.length > 0 ? pkgSubtests.map((st, idx) => (
                  <div key={st.id} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center font-black text-purple-600 shadow-sm">{idx + 1}</div>
                      <div>
                        <p className="font-bold text-slate-700">{st.title}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">ID: {st.id}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-xl font-black text-xs">{st.duration_minutes} Menit</div>
                      <button onClick={() => handleDeleteSubtest(st.id, st.title)} className="p-2 bg-red-100 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-colors"><Trash2 size={16}/></button>
                    </div>
                  </div>
                )) : (
                  <p className="text-slate-400 italic text-sm text-center py-6">Belum ada subtes. Tambahkan di sebelah kiri.</p>
                )}
              </div>
              <p className="mt-6 text-[10px] text-slate-400 font-bold uppercase text-center bg-slate-50 p-3 rounded-xl">
                ⚠️ PERHATIAN: Nama Subtes di sini HARUS SAMA PERSIS dengan Kategori Subtes saat memasukkan soal.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* VIEW: EDITOR SOAL (Pabrik Soal) */}
      {currentView === 'question-editor' && (
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="bg-[#1e3a8a] p-8 rounded-[2.5rem] text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
             <div className="relative z-10">
               <p className="text-blue-200 text-xs font-bold uppercase tracking-widest mb-1">Editing Package</p>
               <h2 className="text-2xl font-black">{selectedPkg?.title}</h2>
             </div>
             
             <div className="relative z-10 flex gap-3">
               <button onClick={downloadTemplate} className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-3 rounded-xl text-sm font-bold backdrop-blur-sm transition-all">
                 <Download size={18} /> Template CSV
               </button>
               <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 px-4 py-3 rounded-xl text-sm font-black shadow-lg transition-all">
                 {isLoading ? <Loader2 className="animate-spin" size={18} /> : <UploadCloud size={18} />} 
                 Upload CSV
               </button>
               <input type="file" accept=".csv" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
             </div>
             <Database className="absolute -right-4 -bottom-4 text-blue-800/50" size={120} />
          </div>

          <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white ${editQId ? 'bg-orange-500' : 'bg-emerald-500'}`}>
                   {editQId ? <Edit3 size={20} /> : <Plus size={24} />}
                </div>
                <h3 className="text-xl font-black text-slate-800">{editQId ? 'Edit Soal' : 'Tambah Soal Manual'}</h3>
              </div>
              {editQId && (
                <button onClick={resetQuestionForm} className="px-4 py-2 bg-slate-100 text-slate-500 hover:bg-slate-200 rounded-xl text-xs font-bold transition-colors">Batal Edit</button>
              )}
            </div>

            <div className="space-y-8">
              {/* Pilihan Subtes */}
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Kategori Subtes</label>
                <div className="flex flex-wrap gap-2">
                  {[
                    'Penalaran Umum', 
                    'Pengetahuan Kuantitatif', 
                    'PPU', 
                    'PBM',
                    'Literasi Bahasa Indonesia', 
                    'Literasi Bahasa Inggris',
                    'Penalaran Matematika'
                  ].map(sub => (
                    <button 
                      key={sub}
                      onClick={() => setQSubject(sub)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${qSubject === sub ? 'bg-[#1e3a8a] text-white shadow-md' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
                    >
                      {sub}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tipe Soal */}
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tipe Soal</label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: 'MULTIPLE_CHOICE', label: 'Pilihan Ganda' },
                    { id: 'COMPLEX_MULTIPLE_CHOICE', label: 'Benar / Salah' },
                    { id: 'SHORT_ANSWER', label: 'Isian Singkat' }
                  ].map(type => (
                    <button 
                      key={type.id}
                      onClick={() => setQType(type.id)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${qType === type.id ? 'bg-[#1e3a8a] text-white shadow-md' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Teks Bacaan (Passage) */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Book size={14} /> Teks Bacaan (Opsional)
                </label>
                <textarea 
                  value={qPassage} 
                  onChange={(e) => setQPassage(e.target.value)} 
                  rows={4} 
                  className="w-full p-5 rounded-3xl bg-slate-50 border-none outline-none focus:ring-2 ring-blue-100 transition-all text-slate-700 font-medium leading-relaxed" 
                  placeholder="Ketik atau paste teks bacaan/paragraf panjang di sini... (Kosongkan jika soal tidak butuh teks bacaan)" 
                />
              </div>

              {/* Teks Soal */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pertanyaan</label>
                <textarea value={qText} onChange={(e) => setQText(e.target.value)} rows={3} className="w-full p-5 rounded-3xl bg-slate-50 border-none outline-none focus:ring-2 ring-blue-100 transition-all text-slate-700 font-medium" placeholder="Tulis soal di sini..." />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Link Gambar Soal (Opsional)</label>
                <input type="text" value={qImageUrl} onChange={(e) => setQImageUrl(e.target.value)} className="w-full p-4 rounded-2xl bg-slate-50 border-none outline-none focus:ring-2 ring-blue-100 transition-all text-sm" placeholder="https://contoh.com/gambar.png" />
                {qImageUrl && (
                  <div className="mt-2 p-2 bg-slate-100 rounded-xl w-fit">
                    <img src={qImageUrl} alt="Preview" className="max-h-32 rounded-lg object-contain" />
                  </div>
                )}
              </div>

              {/* Pilihan Jawaban Dinamis */}
              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Kunci Jawaban & Pilihan</label>
                
                {qType === 'MULTIPLE_CHOICE' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.keys(qChoices).map((key) => (
                      <div key={key} className="flex items-center gap-3 bg-slate-50 p-2 rounded-2xl border border-slate-100">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black ${qCorrect === key ? 'bg-emerald-500 text-white' : 'bg-white text-slate-400'}`}>{key}</div>
                        <input value={(qChoices as any)[key]} onChange={(e) => setQChoices({...qChoices, [key]: e.target.value})} type="text" className="bg-transparent outline-none flex-1 text-sm font-medium" placeholder={`Pilihan ${key}...`} />
                        <button onClick={() => setQCorrect(key)} className={`p-2 rounded-lg transition-all ${qCorrect === key ? 'text-emerald-500' : 'text-slate-200'}`}><CheckCircle size={20} /></button>
                      </div>
                    ))}
                  </div>
                )}

                {qType === 'SHORT_ANSWER' && (
                  <input 
                    type="text" 
                    value={qShortAnswer} 
                    onChange={(e) => setQShortAnswer(e.target.value)} 
                    className="w-full p-5 rounded-3xl bg-slate-50 border-none outline-none focus:ring-2 ring-emerald-200 transition-all font-black text-emerald-600 text-xl" 
                    placeholder="Ketik jawaban benar yang singkat (contoh: 140)..." 
                  />
                )}

                {qType === 'COMPLEX_MULTIPLE_CHOICE' && (
                  <div className="space-y-3">
                    {qStatements.map((stmt, idx) => (
                      <div key={stmt.id} className="flex items-center gap-3 bg-slate-50 p-2 rounded-2xl border border-slate-100">
                         <input 
                           type="text"
                           value={stmt.text}
                           onChange={(e) => {
                             const newStmts = [...qStatements];
                             newStmts[idx].text = e.target.value;
                             setQStatements(newStmts);
                           }}
                           className="bg-transparent outline-none flex-1 p-2 text-sm font-medium text-slate-700"
                           placeholder={`Pernyataan ${idx + 1}...`}
                         />
                         <button 
                           onClick={() => {
                             const newStmts = [...qStatements];
                             newStmts[idx].correctValue = !newStmts[idx].correctValue;
                             setQStatements(newStmts);
                           }}
                           className={`px-4 py-3 rounded-xl font-black text-xs transition-all tracking-widest uppercase ${stmt.correctValue ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200' : 'bg-red-500 text-white shadow-lg shadow-red-200'}`}
                         >
                           {stmt.correctValue ? 'BENAR' : 'SALAH'}
                         </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Pembahasan */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <MessageSquareQuote size={14} /> Pembahasan / Penjelasan
                </label>
                <textarea value={qExplanation} onChange={(e) => setQExplanation(e.target.value)} rows={3} className="w-full p-5 rounded-3xl bg-emerald-50/30 border-2 border-dashed border-emerald-100 outline-none focus:border-emerald-300 transition-all text-slate-700 text-sm" placeholder="Jelaskan kenapa jawaban tersebut benar..." />
              </div>

              <button onClick={handleSaveQuestion} disabled={isLoading} className={`w-full py-5 text-white rounded-[2rem] font-black shadow-xl transition-all flex items-center justify-center gap-3 uppercase tracking-widest text-sm ${editQId ? 'bg-orange-500 hover:bg-orange-600 shadow-orange-100' : 'bg-[#1e3a8a] hover:bg-blue-800 shadow-blue-100'}`}>
                {isLoading ? <Loader2 className="animate-spin" /> : <Save size={20} />} {editQId ? 'Update Soal' : 'Simpan Manual ke Database'}
              </button>
            </div>
          </div>

          <div className="bg-white p-8 md:p-10 rounded-[3rem] shadow-sm border border-slate-100 mt-8">
            <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-3"><Database size={24} className="text-[#1e3a8a]" /> Daftar Soal Aktif</h3>
            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
              {pkgQuestions.length > 0 ? pkgQuestions.map((q, idx) => (
                <div key={q.id} className="p-5 bg-slate-50 rounded-3xl border border-slate-100 flex flex-col md:flex-row justify-between items-start gap-4 hover:border-blue-200 transition-colors">
                   <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] font-black text-[#1e3a8a] bg-blue-100 px-3 py-1 rounded-full uppercase">{q.subject}</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">{q.type?.replace(/_/g, ' ')}</span>
                      </div>
                      <p className="font-medium text-slate-700 text-sm line-clamp-2">{q.question_text || "Teks soal kosong"}</p>
                   </div>
                   <div className="flex gap-2 w-full md:w-auto">
                      <button onClick={() => handleEditQuestion(q)} className="flex-1 md:flex-none px-4 py-2 bg-blue-100 text-blue-600 hover:bg-blue-600 hover:text-white rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2">
                         <Edit3 size={14} /> Edit
                      </button>
                      <button onClick={() => handleDeleteQuestion(q.id)} className="px-4 py-2 bg-red-100 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all flex items-center justify-center">
                         <Trash2 size={16} />
                      </button>
                   </div>
                </div>
              )) : (
                <div className="text-center py-10 border-2 border-dashed border-slate-200 rounded-3xl">
                   <p className="text-slate-400 font-medium">Belum ada soal di paket ini.</p>
                </div>
              )}
            </div>
          </div>

        </div>
      )}
    </div>
  );
};

const CheckCircle = ({ size, className }: any) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

export default AdminPanel;