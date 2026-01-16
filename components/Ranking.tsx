import React from 'react';
import { ArrowLeft, Trophy, Medal } from 'lucide-react';
import { RankingEntry } from '../types';

interface RankingProps {
  data: RankingEntry[];
  onBack: () => void;
}

const Ranking: React.FC<RankingProps> = ({ data, onBack }) => {
  return (
    <div className="absolute inset-0 bg-[#99c846] flex flex-col z-50 overflow-hidden">
      <div className="p-4 flex items-center justify-between bg-black/10">
        <button 
          onClick={onBack}
          className="bg-white text-[#99c846] p-2 rounded-xl font-bold shadow-md active:scale-95 transition-transform"
        >
          <ArrowLeft size={28} />
        </button>
        <h2 className="text-3xl font-black text-white drop-shadow-md flex items-center gap-2">
            <GlobeIcon /> MUNDIAL
        </h2>
        <div className="w-10"></div> {/* Spacer */}
      </div>

      <div className="flex-1 overflow-y-auto p-4 pb-20">
        <div className="flex flex-col gap-3 max-w-md mx-auto">
            {data.map((entry, index) => (
                <div 
                    key={index}
                    className={`relative p-4 rounded-2xl flex items-center justify-between border-b-4 shadow-sm transition-transform hover:scale-[1.02]
                        ${entry.isPlayer ? 'bg-blue-500 border-blue-700 text-white z-10 scale-105' : 'bg-white border-gray-200 text-gray-700'}
                    `}
                >
                    <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-xl 
                            ${index === 0 ? 'bg-yellow-400 text-yellow-800' : 
                              index === 1 ? 'bg-gray-300 text-gray-700' : 
                              index === 2 ? 'bg-orange-300 text-orange-800' : 
                              'bg-black/10 text-current opacity-70'}
                        `}>
                            {index + 1}
                        </div>
                        <div className="flex flex-col">
                            <span className="font-bold text-lg leading-tight">{entry.name}</span>
                            {index === 0 && <span className="text-[10px] font-black uppercase text-yellow-600 flex items-center gap-1">👑 Líder</span>}
                        </div>
                    </div>
                    <div className="font-black text-2xl font-mono">
                        {entry.score}
                    </div>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};

const GlobeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-globe"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>
);

export default Ranking;