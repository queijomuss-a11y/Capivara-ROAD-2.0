import React from 'react';
import { Trophy, Coins, Play, ShoppingCart, Globe, User, LogOut, Flame } from 'lucide-react';
import { PlayerData, MapTheme } from '../types';

interface MenuProps {
  playerData: PlayerData;
  currentMap: MapTheme;
  onSetMap: (map: MapTheme) => void;
  onStart: () => void;
  onShop: () => void;
  onRanking: () => void;
  onLogout: () => void;
}

const Menu: React.FC<MenuProps> = ({ playerData, currentMap, onSetMap, onStart, onShop, onRanking, onLogout }) => {
  return (
    <div className={`absolute inset-0 flex flex-col items-center justify-center p-6 z-50 transition-colors duration-500 ${currentMap === 'volcano' ? 'bg-[#2d1111]' : 'bg-[#99c846]'}`}>
      
      {/* Account Info Top Right */}
      <div className="absolute top-4 right-4 flex items-center gap-2 bg-black/20 p-2 rounded-full pr-4">
        <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-[#99c846]">
            <User size={20} />
        </div>
        <div className="flex flex-col items-start leading-none">
            <span className="text-[10px] font-bold text-white/70">CONTA GOOGLE</span>
            <span className="text-xs font-black text-white">{playerData.name}</span>
        </div>
        <button onClick={onLogout} className="ml-2 text-white/50 hover:text-white"><LogOut size={16} /></button>
      </div>

      <div className="mb-4 text-center animate-bounce mt-10">
        <h1 className="text-5xl md:text-7xl font-black text-white drop-shadow-[0_5px_5px_rgba(0,0,0,0.3)] stroke-black tracking-tighter">
          CAPY ROAD
        </h1>
        <p className={`text-lg font-bold mt-1 ${currentMap === 'volcano' ? 'text-red-500' : 'text-green-900'}`}>
            {currentMap === 'volcano' ? '🔥 VOLCANO MODE 🔥' : 'ORIGINAL EDITION'}
        </p>
      </div>

      {/* Map Selector */}
      <div className="flex bg-black/30 p-1 rounded-xl mb-6">
          <button 
            onClick={() => onSetMap('normal')}
            className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${currentMap === 'normal' ? 'bg-green-500 text-white shadow-lg' : 'text-white/50 hover:text-white'}`}
          >
              NORMAL
          </button>
          <button 
            onClick={() => onSetMap('volcano')}
            className={`px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-1 transition-all ${currentMap === 'volcano' ? 'bg-red-600 text-white shadow-lg' : 'text-white/50 hover:text-white'}`}
          >
              <Flame size={14} /> VULCÃO
          </button>
      </div>

      <div className="bg-white/20 backdrop-blur-md rounded-2xl p-4 w-full max-w-sm mb-6 shadow-xl border-4 border-white/30 flex justify-around">
          <div className="flex flex-col items-center">
            <span className="text-xs font-bold text-yellow-100 uppercase">Recorde</span>
            <div className="flex items-center gap-1 text-2xl font-black">
                <Trophy className="text-yellow-300 w-6 h-6" />
                <span>{playerData.highScore}</span>
            </div>
          </div>
          <div className="w-px bg-white/30"></div>
          <div className="flex flex-col items-center">
            <span className="text-xs font-bold text-yellow-100 uppercase">Moedas</span>
            <div className="flex items-center gap-1 text-2xl font-black">
                <Coins className="text-yellow-400 w-6 h-6" />
                <span>{playerData.coins}</span>
            </div>
          </div>
      </div>

      <div className="flex flex-col gap-3 w-full max-w-xs">
        <button 
          onClick={onStart}
          className={`hover:brightness-110 active:scale-95 transition-transform border-b-8 text-white font-black text-2xl py-4 rounded-2xl flex items-center justify-center gap-3 shadow-lg 
            ${currentMap === 'volcano' ? 'bg-red-500 border-red-700' : 'bg-blue-500 border-blue-700'}`}
        >
          <Play fill="currentColor" /> JOGAR
        </button>

        <div className="grid grid-cols-2 gap-3">
            <button 
            onClick={onShop}
            className="bg-purple-500 hover:bg-purple-600 active:scale-95 transition-transform border-b-8 border-purple-700 text-white font-black text-lg py-3 rounded-2xl flex items-center justify-center gap-2 shadow-lg"
            >
            <ShoppingCart size={20} /> LOJA
            </button>

            <button 
            onClick={onRanking}
            className="bg-orange-500 hover:bg-orange-600 active:scale-95 transition-transform border-b-8 border-orange-700 text-white font-black text-lg py-3 rounded-2xl flex items-center justify-center gap-2 shadow-lg"
            >
            <Globe size={20} /> RANK
            </button>
        </div>
      </div>
      
      {playerData.currentSkin === 'hacker_capy' && (
          <div className="mt-4 bg-black/80 px-4 py-2 rounded-full border border-green-500 text-green-400 font-mono text-xs animate-pulse">
              SYSTEM HACKED: ADMIN ACCESS
          </div>
      )}
    </div>
  );
};

export default Menu;