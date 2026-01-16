import React, { useState } from 'react';
import { Play } from 'lucide-react';

interface AuthProps {
  onLogin: (email: string, name: string) => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && name) {
        onLogin(email, name);
    }
  };

  return (
    <div className="absolute inset-0 bg-[#99c846] flex flex-col items-center justify-center p-6 z-50">
        <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-sm text-center">
            <h1 className="text-3xl font-black text-gray-800 mb-2">CAPY ROAD</h1>
            <p className="text-gray-500 font-bold mb-6">LOGIN NA CONTA</p>
            
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="text-left">
                    <label className="text-xs font-bold text-gray-400 ml-2">GOOGLE EMAIL</label>
                    <input 
                        type="email" 
                        required
                        className="w-full bg-gray-100 p-4 rounded-xl font-bold text-gray-800 outline-none border-2 border-transparent focus:border-blue-500"
                        placeholder="seu@email.com"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                    />
                </div>
                <div className="text-left">
                    <label className="text-xs font-bold text-gray-400 ml-2">NOME DE JOGADOR</label>
                    <input 
                        type="text" 
                        required
                        maxLength={12}
                        className="w-full bg-gray-100 p-4 rounded-xl font-bold text-gray-800 outline-none border-2 border-transparent focus:border-blue-500"
                        placeholder="Ex: CapyKing"
                        value={name}
                        onChange={e => setName(e.target.value)}
                    />
                </div>

                <button 
                    type="submit"
                    className="bg-blue-600 text-white font-black text-xl py-4 rounded-xl shadow-lg mt-4 flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors"
                >
                    <Play size={24} fill="currentColor" /> ENTRAR
                </button>
            </form>
            <p className="text-xs text-gray-400 mt-4 font-bold">
                Seus dados serão salvos na nuvem.
            </p>
        </div>
    </div>
  );
};

export default Auth;