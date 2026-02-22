// src/components/UI/ChangeNotification.tsx
'use client';

import { useEffect, useState } from 'react';

interface StatChange {
  stat: string;
  oldValue: number;
  newValue: number;
  change: number;
}

interface ChangeNotificationProps {
  changes: StatChange[];
  onClose: () => void;
}

export function ChangeNotification({ changes, onClose }: ChangeNotificationProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 300); // Wait for fade out
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  if (changes.length === 0) return null;

  return (
    <div 
      className={`fixed top-20 right-4 z-[9999] transition-all duration-300 ${
        visible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'
      }`}
    >
      <div className="bg-gradient-to-r from-cyan-900/90 to-purple-900/90 backdrop-blur-sm border border-cyan-500/50 rounded-lg p-4 shadow-2xl min-w-[300px]">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">✨</span>
            <h4 className="text-white font-bold">Stats Updated!</h4>
          </div>
          <button
            onClick={() => {
              setVisible(false);
              setTimeout(onClose, 300);
            }}
            className="text-gray-400 hover:text-white"
          >
            ×
          </button>
        </div>
        
        <div className="space-y-2">
          {changes.map((change, i) => (
            <div key={i} className="flex justify-between items-center">
              <span className="text-gray-300 capitalize">{change.stat}</span>
              <div className="flex items-center gap-2">
                <span className="text-gray-500 text-sm">{change.oldValue.toFixed(0)}</span>
                <span className="text-gray-400">→</span>
                <span className={`font-bold ${change.change > 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {change.newValue.toFixed(0)}
                </span>
                <span className={`text-xs ${change.change > 0 ? 'text-green-400' : 'text-red-400'}`}>
                  ({change.change > 0 ? '+' : ''}{change.change.toFixed(1)})
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}