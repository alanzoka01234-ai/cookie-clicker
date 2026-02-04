import React, { useState, useEffect } from 'react';
import { soundService } from '../services/soundService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [enabled, setEnabled] = useState(soundService.getEnabled());
  const [volume, setVolume] = useState(soundService.getVolume() * 100);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setEnabled(soundService.getEnabled());
      setVolume(soundService.getVolume() * 100);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVal = e.target.checked;
    setEnabled(newVal);
    soundService.setEnabled(newVal);
  };

  const handleVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value);
    setVolume(val);
    soundService.setVolume(val / 100);
  };

  const testSound = () => {
    soundService.playClick();
    setToast("Som OK! 🎵");
    setTimeout(() => setToast(null), 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden transform transition-all">
        {/* Header */}
        <div className="bg-amber-500 p-4 text-white font-bold flex justify-between items-center shadow-sm">
          <h3 className="text-lg flex items-center gap-2">⚙️ Configurações</h3>
          <button 
            onClick={onClose} 
            className="hover:bg-amber-600 rounded p-1 transition-colors w-8 h-8 flex items-center justify-center"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          
          {/* Toggle */}
          <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
            <label className="font-bold text-gray-700 select-none cursor-pointer" htmlFor="sfx-toggle">
              Efeitos Sonoros
            </label>
            <div className="relative inline-block w-12 mr-2 align-middle select-none transition duration-200 ease-in">
              <input 
                type="checkbox" 
                id="sfx-toggle"
                checked={enabled} 
                onChange={handleToggle}
                className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer transition-transform duration-200 ease-in-out checked:translate-x-full checked:border-amber-500"
                style={{ right: enabled ? '0' : 'auto', left: enabled ? 'auto' : '0' }}
              />
              <label 
                htmlFor="sfx-toggle" 
                className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer transition-colors ${enabled ? 'bg-amber-500' : 'bg-gray-300'}`}
              ></label>
            </div>
          </div>

          {/* Volume */}
          <div className="space-y-3 p-2 bg-gray-50 rounded-lg">
            <div className="flex justify-between items-center">
              <label className="font-bold text-gray-700">Volume SFX</label>
              <span className="text-sm font-mono text-gray-500 bg-white px-2 py-0.5 rounded border">{volume}%</span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="100" 
              value={volume} 
              onChange={handleVolume}
              disabled={!enabled}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-amber-500 disabled:opacity-50"
            />
          </div>

          {/* Test Button */}
          <div className="relative">
            <button 
              onClick={testSound}
              disabled={!enabled}
              className="w-full py-3 bg-white hover:bg-amber-50 text-amber-700 font-bold rounded-lg transition-all border-2 border-amber-200 hover:border-amber-400 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              🔊 Testar Som
            </button>
            
            {/* Toast */}
            {toast && (
              <div className="absolute left-1/2 -translate-x-1/2 -top-12 bg-gray-800 text-white text-xs py-1 px-3 rounded-full shadow-lg whitespace-nowrap animate-bounce">
                {toast}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 text-center border-t border-gray-100">
          <button 
            onClick={onClose} 
            className="w-full px-4 py-2 bg-amber-500 text-white rounded-lg font-bold hover:bg-amber-600 transition-colors shadow-md active:transform active:translate-y-0.5"
          >
            Concluir
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;