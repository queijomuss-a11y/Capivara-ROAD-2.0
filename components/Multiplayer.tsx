import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Users, MessageSquare, Send, Zap, Lock } from 'lucide-react';
import { GameState, PlayerData } from '../types';

interface MultiplayerProps {
  gameState: GameState;
  playerData: PlayerData;
  onBack: () => void;
  onEnterRoom: () => void;
  onHackerUnlock: () => boolean;
}

const Multiplayer: React.FC<MultiplayerProps> = ({ gameState, playerData, onBack, onEnterRoom, onHackerUnlock }) => {
  const [messages, setMessages] = useState<{user: string, text: string, system?: boolean}[]>([
      { user: 'System', text: 'Bem-vindo ao CapyNet Global Chat.', system: true }
  ]);
  const [inputText, setInputText] = useState('');
  const [roomCode, setRoomCode] = useState('');
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputText.trim()) return;

    // Check Hacker Command
    if (inputText.trim() === '/HACKER.7779') {
        const success = onHackerUnlock();
        if (success) {
             setMessages(prev => [...prev, { 
                user: 'SYSTEM', 
                text: '⚠️ SYSTEM BREACH DETECTED. HACKER SKIN UNLOCKED. ⚠️', 
                system: true 
            }]);
        } else {
            setMessages(prev => [...prev, { 
                user: 'SYSTEM', 
                text: 'Error: Skin already unlocked.', 
                system: true 
            }]);
        }
        setInputText('');
        return;
    }

    setMessages(prev => [...prev, { user: playerData.name, text: inputText }]);
    setInputText('');

    // Simulate bot reply sometimes
    if (Math.random() > 0.8) {
        setTimeout(() => {
            const bots = ['Bot_Jao', 'SpeedRacer', 'CapyLover'];
            const bot = bots[Math.floor(Math.random() * bots.length)];
            const replies = ['kkkk', 'alguem x1?', 'como pega a skin dourada?', 'esse jogo é top'];
            const reply = replies[Math.floor(Math.random() * replies.length)];
            setMessages(prev => [...prev, { user: bot, text: reply }]);
        }, 2000);
    }
  };

  if (gameState === GameState.MULTIPLAYER_LOBBY) {
      return (
        <div className="absolute inset-0 bg-[#2d3436] flex flex-col items-center p-6 z-50">
            <div className="w-full max-w-md flex items-center justify-between mb-8">
                <button onClick={onBack} className="bg-white/10 text-white p-3 rounded-xl"><ArrowLeft /></button>
                <h2 className="text-3xl font-black text-green-400">MULTIPLAYER</h2>
                <div className="w-10"></div>
            </div>

            <div className="bg-black/30 w-full max-w-md p-6 rounded-3xl border border-white/10 text-center">
                <Users className="w-16 h-16 text-green-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-6">Criar ou Entrar em Sala</h3>
                
                <input 
                    type="text" 
                    placeholder="Código da Sala" 
                    value={roomCode}
                    onChange={e => setRoomCode(e.target.value.toUpperCase())}
                    className="w-full bg-black/50 p-4 rounded-xl text-white font-mono text-center text-xl tracking-widest outline-none border-2 border-green-500/50 focus:border-green-500 mb-4"
                />

                <button 
                    onClick={onEnterRoom}
                    className="w-full bg-green-600 hover:bg-green-500 text-white font-black text-xl py-4 rounded-xl shadow-lg transition-transform active:scale-95"
                >
                    CONECTAR
                </button>
            </div>
            <div className="mt-8 text-white/30 text-xs font-mono">
                Region: South America (BR) • Ping: 12ms
            </div>
        </div>
      );
  }

  return (
    <div className="absolute inset-0 bg-black flex flex-col z-50">
        {/* Room Header */}
        <div className="p-4 bg-gray-900 border-b border-gray-800 flex justify-between items-center shadow-md z-10">
            <button onClick={onBack} className="bg-gray-800 text-white p-2 rounded-lg"><ArrowLeft /></button>
            <div className="text-center">
                <h2 className="font-black text-green-500 text-lg">SALA #{roomCode || 'PUB01'}</h2>
                <p className="text-xs text-gray-500">4 Jogadores Online</p>
            </div>
            <div className="bg-green-500/20 text-green-400 p-2 rounded-lg"><Zap size={20} /></div>
        </div>

        {/* Fake Game Area (Visual only) */}
        <div className="flex-1 bg-gray-800 relative overflow-hidden flex items-center justify-center">
             <div className="text-white/10 font-black text-4xl rotate-12">WAITING FOR HOST...</div>
             {/* Fake players list */}
             <div className="absolute top-4 left-4 space-y-2">
                 {[playerData.name, 'Xx_Slayer_xX', 'NoobMaster69', 'Guest_99'].map((p, i) => (
                     <div key={i} className="bg-black/40 text-white text-xs px-3 py-1 rounded-full flex items-center gap-2">
                         <div className={`w-2 h-2 rounded-full ${i===0 ? 'bg-green-500' : 'bg-gray-500'}`}></div>
                         {p} {i===0 && '(Você)'}
                     </div>
                 ))}
             </div>
        </div>

        {/* Chat Area */}
        <div className="h-1/2 bg-[#1a1a1a] flex flex-col border-t border-green-900/50">
            <div className="bg-black/20 p-2 text-xs text-gray-400 font-mono text-center border-b border-white/5">
                Digite comandos especiais aqui para desbloquear segredos...
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-3 font-mono text-sm">
                {messages.map((m, i) => (
                    <div key={i} className={`flex flex-col ${m.system ? 'items-center text-center' : 'items-start'}`}>
                        {m.system ? (
                            <span className="text-red-400 text-xs font-bold border border-red-900/50 bg-red-900/10 px-2 py-1 rounded">{m.text}</span>
                        ) : (
                            <div className="bg-white/5 p-2 rounded-lg rounded-tl-none">
                                <span className={`${m.user === playerData.name ? 'text-green-400' : 'text-blue-400'} font-bold text-xs block mb-0.5`}>
                                    {m.user}
                                </span>
                                <span className="text-gray-300">{m.text}</span>
                            </div>
                        )}
                    </div>
                ))}
                <div ref={chatEndRef} />
            </div>

            <form onSubmit={handleSend} className="p-3 bg-gray-900 flex gap-2">
                <input 
                    type="text" 
                    value={inputText}
                    onChange={e => setInputText(e.target.value)}
                    placeholder="Digite sua mensagem..."
                    className="flex-1 bg-black text-white p-3 rounded-xl outline-none border border-gray-700 focus:border-green-500 font-mono"
                />
                <button type="submit" className="bg-green-600 text-white p-3 rounded-xl">
                    <Send size={20} />
                </button>
            </form>
        </div>
    </div>
  );
};

export default Multiplayer;