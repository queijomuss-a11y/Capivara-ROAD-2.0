import React, { useState } from 'react';
import { ArrowLeft, Coins, Clock, Check, Axe, Palette, Zap, CarFront, Lock } from 'lucide-react';
import { PlayerData } from '../types';

interface ShopProps {
  playerData: PlayerData;
  onBuy: (id: string, cost: number) => boolean;
  onEquip: (id: string) => void;
  onBack: () => void;
  onEnterCode: (code: string) => boolean;
}

const Shop: React.FC<ShopProps> = ({ playerData, onBuy, onEquip, onBack, onEnterCode }) => {
  const [tab, setTab] = useState<'items' | 'skins'>('items');
  const [secretCode, setSecretCode] = useState('');

  const handleCodeSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (onEnterCode(secretCode)) {
          alert("ACESSO CONCEDIDO: SKIN HACKER DESBLOQUEADA");
          setSecretCode('');
      } else {
          alert("CÓDIGO INVÁLIDO OU JÁ UTILIZADO");
      }
  }

  return (
    <div className="absolute inset-0 bg-[#99c846] flex flex-col items-center p-4 z-50">
      <div className="w-full max-w-md flex items-center justify-between mb-4">
        <button 
          onClick={onBack}
          className="bg-white text-[#99c846] p-3 rounded-xl font-bold shadow-md hover:scale-105 transition-transform"
        >
          <ArrowLeft size={28} />
        </button>
        <div className="bg-black/20 px-6 py-2 rounded-full flex items-center gap-3 text-white font-black text-2xl border-2 border-white/20">
          <Coins className="text-yellow-400" />
          <span>{playerData.coins}</span>
        </div>
      </div>

      <div className="flex gap-2 mb-6 w-full max-w-md">
        <button 
            onClick={() => setTab('items')}
            className={`flex-1 py-3 rounded-xl font-black text-lg flex items-center justify-center gap-2 ${tab === 'items' ? 'bg-white text-green-600 shadow-lg' : 'bg-green-700/50 text-white/70'}`}
        >
            <Zap size={20} /> ITENS
        </button>
        <button 
            onClick={() => setTab('skins')}
            className={`flex-1 py-3 rounded-xl font-black text-lg flex items-center justify-center gap-2 ${tab === 'skins' ? 'bg-white text-green-600 shadow-lg' : 'bg-green-700/50 text-white/70'}`}
        >
            <Palette size={20} /> SKINS
        </button>
      </div>

      <div className="w-full max-w-md overflow-y-auto pb-20 space-y-4">
        
        {tab === 'items' && (
            <>
                {/* Time Freeze */}
                <div className="bg-white rounded-3xl p-4 shadow-xl border-b-8 border-gray-200 relative overflow-hidden">
                    <div className="flex items-start gap-4 mb-4">
                        <div className="bg-blue-100 p-4 rounded-2xl text-blue-600">
                        <Clock size={32} strokeWidth={2.5} />
                        </div>
                        <div>
                        <h3 className="text-xl font-black text-gray-800 leading-none mb-1">ZA WARUDO</h3>
                        <p className="text-gray-500 font-bold text-xs leading-tight">
                            Para o tempo por 5s. Efeito Dio Brando!
                        </p>
                        </div>
                    </div>
                    {playerData.hasTimeFreeze ? (
                        <button disabled className="w-full bg-green-500 text-white font-black py-2 rounded-xl flex items-center justify-center gap-2 opacity-80">
                            <Check strokeWidth={4} size={16} /> COMPRADO
                        </button>
                    ) : (
                        <button 
                            onClick={() => onBuy('time_freeze', 50)}
                            className={`w-full font-black py-3 rounded-xl flex items-center justify-center gap-2 border-b-4 
                            ${playerData.coins >= 50 ? 'bg-yellow-400 border-yellow-600 text-yellow-900' : 'bg-gray-300 border-gray-400 text-gray-500'}`}
                        >
                            COMPRAR <Coins size={16} /> 50
                        </button>
                    )}
                </div>

                {/* Axe */}
                <div className="bg-white rounded-3xl p-4 shadow-xl border-b-8 border-gray-200 relative overflow-hidden">
                    <div className="flex items-start gap-4 mb-4">
                        <div className="bg-red-100 p-4 rounded-2xl text-red-600">
                        <Axe size={32} strokeWidth={2.5} />
                        </div>
                        <div>
                        <h3 className="text-xl font-black text-gray-800 leading-none mb-1">MACHADO</h3>
                        <p className="text-gray-500 font-bold text-xs leading-tight">
                            Corta árvores automaticamente. Gameplay rápida!
                        </p>
                        </div>
                    </div>
                    {playerData.hasAxe ? (
                        <button disabled className="w-full bg-green-500 text-white font-black py-2 rounded-xl flex items-center justify-center gap-2 opacity-80">
                            <Check strokeWidth={4} size={16} /> COMPRADO
                        </button>
                    ) : (
                        <button 
                            onClick={() => onBuy('axe', 100)}
                            className={`w-full font-black py-3 rounded-xl flex items-center justify-center gap-2 border-b-4 
                            ${playerData.coins >= 100 ? 'bg-yellow-400 border-yellow-600 text-yellow-900' : 'bg-gray-300 border-gray-400 text-gray-500'}`}
                        >
                            COMPRAR <Coins size={16} /> 100
                        </button>
                    )}
                </div>
            </>
        )}

        {tab === 'skins' && (
            <>
                <div className="bg-black/10 p-4 rounded-2xl mb-4 text-center">
                    <form onSubmit={handleCodeSubmit} className="flex gap-2">
                        <input 
                            type="text" 
                            placeholder="CÓDIGO SECRETO" 
                            value={secretCode}
                            onChange={(e) => setSecretCode(e.target.value)}
                            className="flex-1 bg-white rounded-lg px-3 font-mono text-black uppercase outline-none border-2 border-transparent focus:border-green-500"
                        />
                        <button type="submit" className="bg-green-600 p-2 rounded-lg text-white"><Lock size={20} /></button>
                    </form>
                </div>

                <SkinCard 
                    id="capy" name="Clássica" price={0} color="bg-[#795548]" 
                    playerData={playerData} onBuy={onBuy} onEquip={onEquip} desc="A capivara original."
                />
                <SkinCard 
                    id="super_car" name="SUPER CAR" price={200} color="bg-red-600" 
                    playerData={playerData} onBuy={onBuy} onEquip={onEquip} desc="VELOCIDADE MAXIMA + CORTA ÁRVORE!"
                    icon={<CarFront size={32} className="text-white opacity-80" />}
                />
                <SkinCard 
                    id="blue_capy" name="Sonic Capy" price={60} color="bg-blue-600" 
                    playerData={playerData} onBuy={onBuy} onEquip={onEquip} desc="Corre muito mais rápido!"
                />
                <SkinCard 
                    id="black_capy" name="Shadow Capy" price={60} color="bg-gray-900" 
                    playerData={playerData} onBuy={onBuy} onEquip={onEquip} desc="Velocidade e estilo."
                />
                <SkinCard 
                    id="golden_capy" name="GOLDEN GOD" price={9999} color="bg-yellow-400" 
                    playerData={playerData} onBuy={onBuy} onEquip={onEquip} desc="Desbloqueie com 500 pontos!" locked={true}
                />
                 <SkinCard 
                    id="diamond_capy" name="DIAMOND" price={9999} color="bg-cyan-400" 
                    playerData={playerData} onBuy={onBuy} onEquip={onEquip} desc="Desbloqueie com 1000 pontos!" locked={true}
                />
                 {playerData.unlockedSkins.includes('hacker_capy') && (
                    <SkinCard 
                        id="hacker_capy" name="HACKER.EXE" price={0} color="bg-green-600" 
                        playerData={playerData} onBuy={onBuy} onEquip={onEquip} desc="SYSTEM BREACHED."
                    />
                 )}
            </>
        )}

      </div>
    </div>
  );
};

const SkinCard = ({ id, name, price, color, playerData, onBuy, onEquip, desc, locked = false, icon }: any) => {
    const owned = playerData.unlockedSkins.includes(id);
    const equipped = playerData.currentSkin === id;

    return (
        <div className={`bg-white rounded-3xl p-4 shadow-xl border-b-8 border-gray-200 flex items-center justify-between ${equipped ? 'border-green-500 bg-green-50' : ''}`}>
            <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-2xl ${color} shadow-inner border-2 border-black/10 flex items-center justify-center`}>
                    {icon}
                </div>
                <div>
                    <h3 className="text-lg font-black text-gray-800 leading-none">{name}</h3>
                    <p className="text-gray-500 text-[10px] font-bold">{desc}</p>
                </div>
            </div>
            
            <div className="min-w-[100px]">
                {equipped ? (
                    <button disabled className="w-full bg-green-600 text-white font-black text-xs py-2 rounded-lg">
                        EQUIPADO
                    </button>
                ) : owned ? (
                    <button onClick={() => onEquip(id)} className="w-full bg-blue-500 hover:bg-blue-600 text-white font-black text-xs py-2 rounded-lg border-b-4 border-blue-700 active:border-b-0 active:translate-y-1">
                        USAR
                    </button>
                ) : locked ? (
                    <div className="text-gray-400 font-bold text-xs text-center">BLOQUEADO</div>
                ) : (
                    <button 
                        onClick={() => onBuy(id, price)}
                        className={`w-full font-black text-xs py-2 rounded-lg border-b-4 flex items-center justify-center gap-1
                        ${playerData.coins >= price ? 'bg-yellow-400 border-yellow-600 text-yellow-900' : 'bg-gray-300 border-gray-400 text-gray-500'}`}
                    >
                        <Coins size={12} /> {price}
                    </button>
                )}
            </div>
        </div>
    )
}

export default Shop;