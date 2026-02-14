
import { QuestionType, ExamPackage } from './types';

export const MOCK_EXAM_PACKAGES: ExamPackage[] = [
  {
    id: 'free-01',
    title: 'Try Out Nasional Gratis #1',
    price: 0,
    isPremium: false,
    isOwned: true,
    subtests: [
      {
        id: 'pu-1',
        title: 'Penalaran Umum',
        durationMinutes: 30,
        questions: [
          {
            id: 'q1',
            type: QuestionType.MULTIPLE_CHOICE,
            text: 'Manakah pernyataan yang paling benar berdasarkan teks di atas?',
            passage: 'Konsumsi gula berlebih di kalangan remaja Indonesia meningkat 40% dalam lima tahun terakhir. Hal ini memicu risiko diabetes tipe 2 pada usia produktif. Pemerintah berencana menerapkan cukai pada minuman berpemanis dalam kemasan (MBDK).',
            choices: [
              { id: 'A', text: 'Semua remaja Indonesia pasti terkena diabetes.' },
              { id: 'B', text: 'Cukai MBDK bertujuan menekan konsumsi gula remaja.' },
              { id: 'C', text: 'Diabetes hanya menyerang orang tua.' },
              { id: 'D', text: 'Konsumsi gula turun 40%.' },
              { id: 'E', text: 'Pemerintah melarang penjualan gula.' }
            ],
            correctAnswer: 'B',
            explanation: 'Sesuai konteks teks, rencana cukai adalah upaya pemerintah merespons peningkatan konsumsi gula.',
            difficulty: 2,
            subject: 'Penalaran Umum'
          },
          {
            id: 'q2',
            type: QuestionType.COMPLEX_MULTIPLE_CHOICE,
            text: 'Tentukan Benar atau Salah pernyataan berikut terkait teks!',
            passage: 'Sama seperti soal sebelumnya.',
            statements: [
              { id: 's1', text: 'Konsumsi gula remaja naik 40%.', correctValue: true },
              { id: 's2', text: 'Risiko diabetes tipe 1 yang dibahas.', correctValue: false },
              { id: 's3', text: 'Cukai akan diterapkan pada MBDK.', correctValue: true }
            ],
            explanation: 'Teks menyebutkan kenaikan 40% dan diabetes tipe 2, bukan tipe 1.',
            difficulty: 3,
            subject: 'Penalaran Umum'
          },
          {
            id: 'q3',
            type: QuestionType.SHORT_ANSWER,
            text: 'Jika konsumsi gula awal adalah 100 unit, berapakah jumlah unit setelah kenaikan 40%?',
            correctAnswer: '140',
            explanation: '100 + (40% * 100) = 140.',
            difficulty: 1,
            subject: 'Penalaran Umum'
          }
        ]
      },
      {
        id: 'pm-1',
        title: 'Pengetahuan & Pemahaman Umum',
        durationMinutes: 20,
        questions: [
          {
            id: 'q4',
            type: QuestionType.MULTIPLE_CHOICE,
            text: 'Persamaan kata (sinonim) dari "akselerasi" adalah...',
            choices: [
              { id: 'A', text: 'Perlambatan' },
              { id: 'B', text: 'Percepatan' },
              { id: 'C', text: 'Stagnasi' },
              { id: 'D', text: 'Transformasi' },
              { id: 'E', text: 'Modifikasi' }
            ],
            correctAnswer: 'B',
            explanation: 'Akselerasi berarti percepatan.',
            difficulty: 2,
            subject: 'PPU'
          }
        ]
      }
    ]
  },
  {
    id: 'premium-01',
    title: 'Eksklusif: UTBK Master Pack',
    price: 5000,
    isPremium: true,
    isOwned: false,
    subtests: [
       {
        id: 'p-pu-1',
        title: 'Penalaran Umum (Premium)',
        durationMinutes: 40,
        questions: [
          {
            id: 'pq1',
            type: QuestionType.MULTIPLE_CHOICE,
            text: 'Soal premium pertama.',
            choices: [
              { id: 'A', text: 'Jawaban A' },
              { id: 'B', text: 'Jawaban B' },
              { id: 'C', text: 'Jawaban C' },
              { id: 'D', text: 'Jawaban D' },
              { id: 'E', text: 'Jawaban E' }
            ],
            correctAnswer: 'A',
            explanation: 'Penjelasan premium.',
            difficulty: 4,
            subject: 'Penalaran Umum'
          }
        ]
      }
    ]
  }
];
