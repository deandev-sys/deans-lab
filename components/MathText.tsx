import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css'; // Wajib agar rumusnya punya styling!

interface MathTextProps {
  content?: string | null; // PERBAIKAN: Izinkan tipe data kosong (null/undefined)
  className?: string;
}

const MathText: React.FC<MathTextProps> = ({ content, className = '' }) => {
  // PENGAMAN ANTI-CRASH: Jika content kosong, jangan render apapun dan hentikan proses
  if (!content) {
    return null;
  }

  // Pastikan content selalu diolah sebagai string yang valid
  const safeContent = String(content);

  return (
    <div className={`prose prose-slate dark:prose-invert max-w-none ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkMath]}
        rehypePlugins={[rehypeKatex]}
      >
        {/* Mengganti baris baru (\n) menjadi <br> agar paragraf admin tetap rapi */}
        {safeContent.replace(/\n/gi, '\n\n')}
      </ReactMarkdown>
    </div>
  );
};

export default MathText;