import React from 'react';
import { RotateCcw, Home, Trophy, Skull } from 'lucide-react';
import { RankingEntry } from '../types';

interface GameOverProps {
  score: number;
  highScore: number;
  coins: number;
  ranking: RankingEntry[];
  onRestart: () => void;
  onMenu: () => void;
}

const GameOver: React.FC<GameOverProps> = ({ score, highScore, coins, ranking, onRestart, onMenu }) => {
  return (
    <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 animate-in fade-in duration-300">
        
        <div className="text-center mb-8">
            <Skull className="w-20 h-20 text-red-500 mx-auto mb-2 animate-bounce" />
            <h1 className="text-6xl font-black text-white drop-shadow-[0_0_15px_rgba(255,0,0,0.5)]">PERDEU</h1>
        </div>

        <div className="bg-white rounded-3xl p-6 w-full max-w-sm mb-6 shadow-2xl text-center border-b-8 border-gray-300">
            <p className="text-gray-500 font-bold text-sm uppercase mb-1">Pontuação Final</p>
            <div className="text-6xl font-black text-gray-800 mb-4">{score}</div>
            
            <div className="flex justify-between items-center bg-gray-100 rounded-xl p-3">
                <div className="flex flex-col items-start">
                    <span className="text-xs font-bold text-gray-400 uppercase">Recorde</span>
                    <span className="font-black text-xl text-yellow-600 flex items-center gap-1">
                        <Trophy size={16} /> {highScore}
                    </span>
                </div>
                <div className="h-8 w-px bg-gray-300"></div>
                <div className="flex flex-col items-end">
                    <span className="text-xs font-bold text-gray-400 uppercase">Total Moedas</span>
                    <span className="font-black text-xl text-yellow-500">{coins}</span>
                </div>
            </div>
            
            {score >= 500 && (
                <div className="mt-4 bg-yellow-100 text-yellow-800 font-bold p-2 rounded-lg text-sm border border-yellow-300 animate-pulse">
                    🏆 NOVA SKIN: CAPIVARA DOURADA!
                </div>
            )}
        </div>

        {/* Mini Ranking Preview */}
        <div className="w-full max-w-sm bg-black/40 rounded-xl p-3 mb-6">
            <h3 className="text-white/80 font-bold text-xs uppercase mb-2 text-center">Top 3 Global</h3>
            {ranking.slice(0, 3).map((r, i) => (
                <div key={i} className="flex justify-between text-sm text-white py-1 border-b border-white/10 last:border-0">
                    <span>{i+1}. {r.name}</span>
                    <span className="font-mono opacity-80">{r.score}</span>
                </div>
            ))}
        </div>

        <div className="flex gap-4 w-full max-w-sm">
            <button 
                onClick={onMenu}
                className="flex-1 bg-gray-500 hover:bg-gray-600 border-b-4 border-gray-700 text-white font-bold py-4 rounded-2xl flex flex-col items-center justify-center gap-1"
            >
                <Home size={24} />
                <span className="text-xs">MENU</span>
            </button>
            <button 
                onClick={onRestart}
                className="flex-[2] bg-green-500 hover:bg-green-600 border-b-4 border-green-700 text-white font-black text-xl py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg active:translate-y-1 active:border-b-0"
            >
                <RotateCcw size={28} /> TENTAR DE NOVO
            </button>
        </div>
    </div>
  );
};

export default GameOver;