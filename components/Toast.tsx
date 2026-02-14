
import React, { useEffect } from 'react';
import { CheckCircle, Info, XCircle, X } from 'lucide-react';

export type ToastType = 'success' | 'info' | 'error';

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const styles = {
    success: 'bg-emerald-500 text-white',
    info: 'bg-[#1e3a8a] text-white',
    error: 'bg-red-500 text-white',
  };

  const icons = {
    success: <CheckCircle size={20} />,
    info: <Info size={20} />,
    error: <XCircle size={20} />,
  };

  return (
    <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl animate-bounce-in min-w-[320px] max-w-[90vw] ${styles[type]}`}>
      {icons[type]}
      <p className="font-bold text-sm flex-1">{message}</p>
      <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-lg transition-colors">
        <X size={18} />
      </button>
    </div>
  );
};

export default Toast;
