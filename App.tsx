import React, { useState, useEffect, useRef } from 'react';
import { GameState, PlayerData, RankingEntry, MapTheme } from './types';
import GameCanvas from './components/GameCanvas';
import Menu from './components/Menu';
import Shop from './components/Shop';
import GameOver from './components/GameOver';
import Ranking from './components/Ranking';
import Auth from './components/Auth';

const STORAGE_KEY = 'capy_road_online_v2';
const RANKING_KEY = 'capy_global_rank';

const INITIAL_DATA: PlayerData = {
  email: '',
  name: '',
  coins: 0,
  highScore: 0,
  hasTimeFreeze: false,
  hasAxe: false,
  unlockedSkins: ['capy'],
  currentSkin: 'capy'
};

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.AUTH);
  const [playerData, setPlayerData] = useState<PlayerData>(INITIAL_DATA);
  const [lastScore, setLastScore] = useState(0);
  const [globalRanking, setGlobalRanking] = useState<RankingEntry[]>([]);
  const [currentMap, setCurrentMap] = useState<MapTheme>('normal');
  
  const saveTimeoutRef = useRef<number | null>(null);

  // Load Ranking Helper
  const loadRanking = () => {
      const savedRank = localStorage.getItem(RANKING_KEY);
      if (savedRank) {
          return JSON.parse(savedRank);
      }
      return [];
  };

  // Initial Load
  useEffect(() => {
    // Attempt to load player data
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.email) {
            setPlayerData({
                ...INITIAL_DATA,
                ...parsed,
                unlockedSkins: parsed.unlockedSkins || ['capy'],
                currentSkin: parsed.currentSkin || 'capy'
            });
            // If logged in, go to menu
            setGameState(GameState.MENU);
        }
      } catch (e) {
        console.error("Failed to load save", e);
      }
    }
    
    // Always load ranking fresh
    setGlobalRanking(loadRanking());
  }, []);

  // Save Player Data (Debounced)
  useEffect(() => {
    if (playerData.email) {
        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = setTimeout(() => {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(playerData));
        }, 1000);
    }
  }, [playerData]);

  const handleLogin = (email: string, name: string) => {
    // When logging in, reload the ranking to ensure we see other players' scores 
    // from this device if they played recently.
    setGlobalRanking(loadRanking());

    setPlayerData(prev => ({ ...prev, email, name }));
    setGameState(GameState.MENU);
  };

  const handleStartGame = () => {
    setGameState(GameState.PLAYING);
  };

  const updateGlobalRanking = (score: number) => {
    // 1. Load latest from storage (in case another tab/session updated it)
    const currentRank: RankingEntry[] = loadRanking();

    const newEntry: RankingEntry = {
        name: playerData.name,
        score: score,
        isPlayer: true,
        skin: playerData.currentSkin
    };

    // 2. Update or Add
    const existingIdx = currentRank.findIndex(r => r.name === playerData.name);
    if (existingIdx >= 0) {
        // Only update if high score is beaten
        if (currentRank[existingIdx].score < score) {
            currentRank[existingIdx] = newEntry;
        }
    } else {
        currentRank.push(newEntry);
    }

    // 3. Sort & Slice (Top 100)
    const sorted = currentRank.sort((a, b) => b.score - a.score).slice(0, 100);
    
    // 4. Save & Update State
    setGlobalRanking(sorted);
    localStorage.setItem(RANKING_KEY, JSON.stringify(sorted));
  };

  const handleGameOver = (finalScore: number) => {
    setLastScore(finalScore);
    
    let newSkins = [...playerData.unlockedSkins];
    let newCurrentSkin = playerData.currentSkin;
    
    // Diamond Capy Unlock (1000 pts)
    if (finalScore >= 1000 && !newSkins.includes('diamond_capy')) {
      newSkins.push('diamond_capy');
      newCurrentSkin = 'diamond_capy';
      alert("💎 PARABÉNS! VOCÊ ATINGIU 1000 PONTOS! CAPIVARA DE DIAMANTE DESBLOQUEADA!");
    }

    // Golden Capy Unlock (500 pts)
    if (finalScore >= 500 && !newSkins.includes('golden_capy')) {
      newSkins.push('golden_capy');
      if (newCurrentSkin !== 'diamond_capy' && newCurrentSkin !== 'hacker_capy') {
          newCurrentSkin = 'golden_capy'; 
      }
    }

    // Immediate Save on Game Over
    const updatedData = { 
        ...playerData, 
        highScore: Math.max(playerData.highScore, finalScore),
        unlockedSkins: newSkins,
        currentSkin: newCurrentSkin
    };
    
    setPlayerData(updatedData);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData));
    
    // Update Rank with final score
    updateGlobalRanking(finalScore);
    
    setGameState(GameState.GAME_OVER);
  };

  const handleUnlockCode = (code: string) => {
      if (code === '/HACKER.7779') {
        if (!playerData.unlockedSkins.includes('hacker_capy')) {
            setPlayerData(prev => ({
                ...prev,
                unlockedSkins: [...prev.unlockedSkins, 'hacker_capy'],
                currentSkin: 'hacker_capy'
            }));
            return true;
        }
      }
      return false;
  };

  const buyItem = (itemId: string, cost: number) => {
    if (playerData.coins < cost) return false;

    setPlayerData(prev => {
        const updates: any = { coins: prev.coins - cost };
        if (itemId === 'time_freeze') updates.hasTimeFreeze = true;
        else if (itemId === 'axe') updates.hasAxe = true;
        else if (itemId.includes('_capy') || itemId === 'super_car') {
            if (!prev.unlockedSkins.includes(itemId)) {
                updates.unlockedSkins = [...prev.unlockedSkins, itemId];
                updates.currentSkin = itemId;
            }
        }
        return { ...prev, ...updates };
    });
    return true;
  };

  const equipSkin = (skinId: string) => {
    if (playerData.unlockedSkins.includes(skinId)) {
        setPlayerData(prev => ({ ...prev, currentSkin: skinId }));
    }
  };

  const handleLogout = () => {
      setPlayerData(INITIAL_DATA); // Reset local state
      localStorage.removeItem(STORAGE_KEY); // Optional: Clear session if desired, but user asked for account switching
      setGameState(GameState.AUTH);
  };

  return (
    <div className="w-full h-screen overflow-hidden font-sans text-white select-none">
      {gameState === GameState.AUTH && (
          <Auth onLogin={handleLogin} />
      )}

      {gameState === GameState.MENU && (
        <Menu 
          playerData={playerData}
          currentMap={currentMap}
          onSetMap={setCurrentMap}
          onStart={handleStartGame} 
          onShop={() => setGameState(GameState.SHOP)}
          onRanking={() => setGameState(GameState.RANKING)}
          onLogout={handleLogout}
        />
      )}

      {gameState === GameState.SHOP && (
        <Shop 
          playerData={playerData}
          onBuy={buyItem} 
          onEquip={equipSkin}
          onBack={() => setGameState(GameState.MENU)}
          onEnterCode={handleUnlockCode}
        />
      )}

      {gameState === GameState.RANKING && (
        <Ranking 
          data={globalRanking} 
          onBack={() => setGameState(GameState.MENU)}
        />
      )}

      {gameState === GameState.GAME_OVER && (
        <GameOver 
            score={lastScore}
            highScore={playerData.highScore}
            coins={playerData.coins}
            ranking={globalRanking}
            onRestart={handleStartGame}
            onMenu={() => setGameState(GameState.MENU)}
        />
      )}

      {gameState === GameState.PLAYING && (
        <GameCanvas 
          playerData={playerData}
          mapTheme={currentMap}
          onGameOver={handleGameOver}
          onCoinEarned={(amount) => setPlayerData(prev => ({ ...prev, coins: prev.coins + amount }))}
        />
      )}
    </div>
  );
};

export default App;