import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';
import { PlayerData, MoveDirection, MapTheme } from '../types';
import { Pause, Axe, Zap, Flame, Snowflake, ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';

interface GameCanvasProps {
  playerData: PlayerData;
  mapTheme: MapTheme;
  onGameOver: (finalScore: number) => void;
  onCoinEarned: (amount: number) => void;
}

const TILE_SIZE = 42;
const MIN_TILE = -6;
const MAX_TILE = 6;
const COOLDOWN_TIME = 15000;
const FREEZE_DURATION = 5000;
const FREEZE_SFX = "https://cdn.pixabay.com/download/audio/2022/03/15/audio_736f72c476.mp3?filename=time-stop-88220.mp3"; 

const GameCanvas: React.FC<GameCanvasProps> = ({ playerData, mapTheme, onGameOver, onCoinEarned }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.OrthographicCamera | null>(null);
  const playerRef = useRef<THREE.Group | null>(null);
  const mapRef = useRef<THREE.Group | null>(null);
  const frameIdRef = useRef<number>(0);
  const metadataRef = useRef<any[]>([]);
  const movesQueueRef = useRef<any[]>([]);
  const isGameOverRef = useRef(false);
  const scoreRef = useRef(0);
  const positionRef = useRef({ row: 0, tile: 0 });
  const stepsSinceCoinRef = useRef(0);
  const isFrozenRef = useRef(false);
  const freezeAudioRef = useRef<HTMLAudioElement | null>(null);
  const treeObjectsRef = useRef<Map<string, THREE.Object3D>>(new Map()); 

  const onGameOverRef = useRef(onGameOver);
  const onCoinEarnedRef = useRef(onCoinEarned);

  useEffect(() => { onGameOverRef.current = onGameOver; }, [onGameOver]);
  useEffect(() => { onCoinEarnedRef.current = onCoinEarned; }, [onCoinEarned]);

  const [score, setScore] = useState(0);
  const [isFrozen, setIsFrozen] = useState(false);
  const [canFreeze, setCanFreeze] = useState(true);
  const [cooldownProgress, setCooldownProgress] = useState(0);

  const isCarSkin = playerData.currentSkin === 'super_car';
  const hasEffectiveAxe = playerData.hasAxe || isCarSkin;

  // --- 3D & Game Logic ---

  const createTree = (rowIdx: number, tile: number) => {
    const group = new THREE.Group();
    group.position.x = tile * TILE_SIZE;
    
    if (mapTheme === 'volcano') {
        const trunk = new THREE.Mesh(new THREE.BoxGeometry(10, 10, 25), new THREE.MeshLambertMaterial({ color: 0x221111 }));
        trunk.position.z = 12; group.add(trunk);
        const spike = new THREE.Mesh(new THREE.ConeGeometry(8, 20, 4), new THREE.MeshLambertMaterial({ color: 0x4a0404 }));
        spike.position.z = 25; spike.rotation.x = Math.PI; group.add(spike);
    } else {
        const trunk = new THREE.Mesh(new THREE.BoxGeometry(12, 12, 20), new THREE.MeshLambertMaterial({ color: 0x4d2926 }));
        trunk.position.z = 10; group.add(trunk);
        const crown = new THREE.Mesh(new THREE.BoxGeometry(30, 30, 35), new THREE.MeshLambertMaterial({ color: 0x7aa21d }));
        crown.position.z = 35; crown.castShadow = true; group.add(crown);
    }
    
    treeObjectsRef.current.set(`${rowIdx}_${tile}`, group);
    return group;
  };

  const createVehicle = (dir: boolean, isTruck: boolean = false) => {
    const car = new THREE.Group();
    const colors = mapTheme === 'volcano' ? [0xff0000, 0xff5500, 0x330000] : [0xff4757, 0x1e90ff, 0xffa502, 0x2f3542, 0x2ecc71];
    const mainColor = colors[Math.floor(Math.random() * colors.length)];
    
    const bodyW = isTruck ? 100 : 65;
    const body = new THREE.Mesh(new THREE.BoxGeometry(bodyW, 30, 16), new THREE.MeshLambertMaterial({ color: mainColor }));
    body.position.z = 12; body.castShadow = true; car.add(body);
    
    const roof = new THREE.Mesh(new THREE.BoxGeometry(35, 26, 12), new THREE.MeshLambertMaterial({ color: 0x333333 }));
    roof.position.set(isTruck ? 10 : -5, 0, 24); car.add(roof);
    
    if (mapTheme === 'volcano') {
        const glow = new THREE.Mesh(new THREE.BoxGeometry(10, 20, 5), new THREE.MeshBasicMaterial({ color: 0xffaa00 }));
        glow.position.set(-30, 0, 15); car.add(glow);
    }

    if (!dir) car.rotation.z = Math.PI;
    return car;
  };

  const buildPlayer = (skin: string) => {
    const g = new THREE.Group();
    
    if (skin === 'super_car') {
        const chassis = new THREE.Mesh(new THREE.BoxGeometry(30, 18, 10), new THREE.MeshLambertMaterial({ color: 0xcc0000 }));
        chassis.position.z = 8; g.add(chassis);
        const cabin = new THREE.Mesh(new THREE.BoxGeometry(15, 14, 8), new THREE.MeshLambertMaterial({ color: 0x000000 }));
        cabin.position.set(-2, 0, 16); g.add(cabin);
        const wGeo = new THREE.CylinderGeometry(5, 5, 2, 8);
        const wMat = new THREE.MeshLambertMaterial({color: 0x333333});
        const w1 = new THREE.Mesh(wGeo, wMat); w1.rotation.x = Math.PI/2; w1.position.set(10, 10, 5); g.add(w1);
        const w2 = new THREE.Mesh(wGeo, wMat); w2.rotation.x = Math.PI/2; w2.position.set(-10, 10, 5); g.add(w2);
        const w3 = new THREE.Mesh(wGeo, wMat); w3.rotation.x = Math.PI/2; w3.position.set(10, -10, 5); g.add(w3);
        const w4 = new THREE.Mesh(wGeo, wMat); w4.rotation.x = Math.PI/2; w4.position.set(-10, -10, 5); g.add(w4);
        const blade = new THREE.Mesh(new THREE.BoxGeometry(32, 20, 2), new THREE.MeshBasicMaterial({color: 0xffffff}));
        blade.position.set(16, 0, 5); g.add(blade);
        return g;
    }

    const eyeMat = new THREE.MeshLambertMaterial({ color: 0x000000 });
    const eyeGeo = new THREE.BoxGeometry(2, 2, 2);
    
    let mainColor = 0x795548; 
    let darkColor = 0x4e342e; 
    let isHacker = false;
    let isDiamond = false;

    if (skin === 'golden_capy') { mainColor = 0xFFD700; darkColor = 0xB8860B; }
    else if (skin === 'blue_capy') { mainColor = 0x2563eb; darkColor = 0x1e40af; }
    else if (skin === 'black_capy') { mainColor = 0x111827; darkColor = 0x000000; }
    else if (skin === 'diamond_capy') { mainColor = 0x00ffff; darkColor = 0x008b8b; isDiamond = true; }
    else if (skin === 'hacker_capy') { mainColor = 0x00ff00; darkColor = 0x003300; isHacker = true; }

    const mat = new THREE.MeshLambertMaterial({ color: mainColor });
    const darkMat = new THREE.MeshLambertMaterial({ color: darkColor });

    if (isHacker) {
        mat.wireframe = true; darkMat.wireframe = true;
        mat.emissive = new THREE.Color(0x00ff00); mat.emissiveIntensity = 0.5;
    }
    if (isDiamond) {
        mat.emissive = new THREE.Color(0x00ffff); mat.emissiveIntensity = 0.2;
        mat.opacity = 0.9; mat.transparent = true;
    }

    const body = new THREE.Mesh(new THREE.BoxGeometry(22, 34, 18), mat);
    body.position.z = 12; body.castShadow = true; g.add(body);
    const head = new THREE.Mesh(new THREE.BoxGeometry(18, 16, 15), mat);
    head.position.set(0, 18, 20); g.add(head);
    const snout = new THREE.Mesh(new THREE.BoxGeometry(18, 10, 12), darkMat);
    snout.position.set(0, 24, 16); g.add(snout);
    const earGeo = new THREE.BoxGeometry(4, 2, 4);
    const eL = new THREE.Mesh(earGeo, darkMat); eL.position.set(6, 12, 28); g.add(eL);
    const eR = eL.clone(); eR.position.x = -6; g.add(eR);
    
    if (!isHacker) {
        const eyeL = new THREE.Mesh(eyeGeo, eyeMat); eyeL.position.set(9.2, 20, 22); g.add(eyeL);
        const eyeR = eyeL.clone(); eyeR.position.x = -9.2; g.add(eyeR);
    } else {
        const hEyeMat = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        const eyeL = new THREE.Mesh(eyeGeo, hEyeMat); eyeL.position.set(9.2, 20, 22); g.add(eyeL);
        const eyeR = eyeL.clone(); eyeR.position.x = -9.2; g.add(eyeR);
    }

    if (playerData.hasAxe) {
        const axeHandle = new THREE.Mesh(new THREE.BoxGeometry(2, 2, 20), new THREE.MeshLambertMaterial({color: 0x5d4037}));
        axeHandle.position.set(12, 5, 15);
        axeHandle.rotation.x = Math.PI / 4;
        g.add(axeHandle);
        const axeBlade = new THREE.Mesh(new THREE.BoxGeometry(10, 2, 8), new THREE.MeshLambertMaterial({color: 0x9ca3af}));
        axeBlade.position.set(12, 10, 22);
        axeBlade.rotation.x = Math.PI / 4;
        g.add(axeBlade);
    }

    const legGeo = new THREE.BoxGeometry(6, 6, 8);
    const legMat = new THREE.MeshLambertMaterial({ color: 0x333333 });
    if(isHacker) legMat.wireframe = true;
    [[7, 10], [-7, 10], [7, -10], [-7, -10]].forEach(p => {
      const leg = new THREE.Mesh(legGeo, legMat);
      leg.position.set(p[0], p[1], 4); g.add(leg);
    });

    return g;
  };

  const addRows = (n: number) => {
    if (!mapRef.current) return;
    for (let i = 0; i < n; i++) {
      const rowIdx = metadataRef.current.length + 1;
      const isRoad = Math.random() > 0.5;
      const row = new THREE.Group();
      row.position.y = rowIdx * TILE_SIZE;
      let data: any = { type: isRoad ? "road" : "grass", vehicles: [], trees: [], rowId: rowIdx };

      if (isRoad) {
        const roadColor = mapTheme === 'volcano' ? 0x222222 : 0x454a59;
        const r = new THREE.Mesh(new THREE.PlaneGeometry(1200, TILE_SIZE), new THREE.MeshLambertMaterial({ color: roadColor }));
        r.receiveShadow = true; row.add(r);
        
        data.dir = Math.random() > 0.5;
        const baseSpeed = mapTheme === 'volcano' ? 250 : 130;
        data.speed = baseSpeed + Math.random() * 100;
        
        const isTruck = Math.random() > 0.8;
        const v = createVehicle(data.dir, isTruck);
        row.add(v);
        data.vehicles.push({ ref: v });
      } else {
        const groundColor = mapTheme === 'volcano' ? 0x0a0505 : 0xbaf455;
        const g = new THREE.Mesh(new THREE.BoxGeometry(1200, TILE_SIZE, 2), new THREE.MeshLambertMaterial({ color: groundColor }));
        g.receiveShadow = true; row.add(g);
        
        const treeChance = mapTheme === 'volcano' ? 4 : 2; 
        for (let t = 0; t < treeChance; t++) {
          const tIdx = Math.floor(Math.random() * (MAX_TILE - MIN_TILE)) + MIN_TILE;
          if ((tIdx !== 0 || rowIdx > 3) && !data.trees.includes(tIdx)) {
            const tree = createTree(rowIdx, tIdx);
            row.add(tree);
            data.trees.push(tIdx);
          }
        }
      }
      metadataRef.current.push(data);
      mapRef.current.add(row);
    }
  };

  const movePlayer = useCallback((d: MoveDirection) => {
    if (isGameOverRef.current || movesQueueRef.current.length > 0) return;
    
    let tRow = positionRef.current.row + (d === MoveDirection.FORWARD ? 1 : d === MoveDirection.BACKWARD ? -1 : 0);
    let tTile = positionRef.current.tile + (d === MoveDirection.RIGHT ? 1 : d === MoveDirection.LEFT ? -1 : 0);
    
    if (tRow < 0 || tTile < MIN_TILE || tTile > MAX_TILE) return;
    
    const targetRowData = metadataRef.current[tRow - 1];
    if (targetRowData?.type === "grass" && targetRowData.trees.includes(tTile)) {
        if (hasEffectiveAxe) {
            targetRowData.trees = targetRowData.trees.filter((t: number) => t !== tTile);
            const treeKey = `${targetRowData.rowId}_${tTile}`;
            const treeMesh = treeObjectsRef.current.get(treeKey);
            if (treeMesh) {
                treeMesh.visible = false; 
            }
        } else {
            return; 
        }
    }

    if (playerRef.current) {
      if (d === MoveDirection.FORWARD) playerRef.current.rotation.z = 0;
      if (d === MoveDirection.BACKWARD) playerRef.current.rotation.z = Math.PI;
      if (d === MoveDirection.LEFT) playerRef.current.rotation.z = Math.PI / 2;
      if (d === MoveDirection.RIGHT) playerRef.current.rotation.z = -Math.PI / 2;
    }

    movesQueueRef.current.push({ dir: d, tX: tTile * TILE_SIZE, tY: tRow * TILE_SIZE, progress: 0 });
  }, [hasEffectiveAxe]);

  const activateFreeze = useCallback(() => {
    if (!playerData.hasTimeFreeze || !canFreeze || isFrozenRef.current || isGameOverRef.current) return;

    setIsFrozen(true);
    isFrozenRef.current = true;
    setCanFreeze(false);

    if (!freezeAudioRef.current) {
        freezeAudioRef.current = new Audio(FREEZE_SFX);
        freezeAudioRef.current.volume = 0.8;
    }
    freezeAudioRef.current.currentTime = 0;
    freezeAudioRef.current.play().catch(e => console.log("Audio autoplay might be blocked", e));

    setTimeout(() => {
      setIsFrozen(false);
      isFrozenRef.current = false;
      let elapsed = 0;
      const interval = 100;
      const cdTimer = setInterval(() => {
        elapsed += interval;
        const pct = Math.min(100, (elapsed / COOLDOWN_TIME) * 100);
        setCooldownProgress(pct);
        if (elapsed >= COOLDOWN_TIME) {
          clearInterval(cdTimer);
          setCanFreeze(true);
          setCooldownProgress(0);
        }
      }, interval);
    }, FREEZE_DURATION);
  }, [playerData.hasTimeFreeze, canFreeze]);

  useEffect(() => {
    if (!canvasRef.current) return;

    isGameOverRef.current = false;
    positionRef.current = { row: 0, tile: 0 };
    scoreRef.current = 0;
    metadataRef.current = [];
    movesQueueRef.current = [];
    stepsSinceCoinRef.current = 0;
    treeObjectsRef.current.clear();
    setScore(0);

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    const map = new THREE.Group();
    mapRef.current = map;
    scene.add(map);

    const startGroundColor = mapTheme === 'volcano' ? 0x0a0505 : 0xbaf455;
    for (let i = 0; i > -5; i--) {
      const g = new THREE.Mesh(new THREE.BoxGeometry(1200, TILE_SIZE, 2), new THREE.MeshLambertMaterial({ color: startGroundColor }));
      g.position.y = i * TILE_SIZE;
      map.add(g);
    }
    addRows(30);

    const player = buildPlayer(playerData.currentSkin);
    playerRef.current = player;
    scene.add(player);

    scene.add(new THREE.AmbientLight(0xffffff, 0.8));
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.7);
    dirLight.position.set(-100, -200, 300);
    dirLight.castShadow = true;
    scene.add(dirLight);

    if (mapTheme === 'volcano') {
        const lavaLight = new THREE.PointLight(0xff6600, 1, 500);
        lavaLight.position.set(0, 0, 100);
        scene.add(lavaLight);
        scene.fog = new THREE.Fog(0x2d1111, 200, 900);
        rendererRef.current?.setClearColor(0x2d1111);
    } else {
        scene.fog = null;
        rendererRef.current?.setClearColor(0x99c846);
    }

    const camera = new THREE.OrthographicCamera();
    camera.up.set(0, 0, 1);
    camera.position.set(300, -300, 300);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current, antialias: true });
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setClearColor(mapTheme === 'volcano' ? 0x2d1111 : 0x99c846);
    rendererRef.current = renderer;

    const resize = () => {
        const width = window.innerWidth;
        const height = window.innerHeight;
        const r = width / height;
        const s = 150;
        camera.left = -s * r; camera.right = s * r;
        camera.top = s; camera.bottom = -s;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
    };
    resize();
    window.addEventListener('resize', resize);

    const isHacker = playerData.currentSkin === 'hacker_capy';
    let moveSpeed = 0.25;
    if (['golden_capy', 'blue_capy', 'black_capy', 'diamond_capy', 'super_car'].includes(playerData.currentSkin)) {
        moveSpeed = 0.5;
    }
    if (isHacker || playerData.currentSkin === 'super_car') moveSpeed = 0.8;

    const animate = () => {
      frameIdRef.current = requestAnimationFrame(animate);

      if (!isGameOverRef.current) {
        if (!isFrozenRef.current) {
          metadataRef.current.forEach((r, idx) => {
            const rowY = (idx + 1) * TILE_SIZE;
            const distToRow = Math.abs(rowY - player.position.y);
            const hackerAura = isHacker && distToRow < 200;

            r.vehicles?.forEach((v: any) => {
              if (hackerAura) {
                  v.ref.position.x += (Math.random() - 0.5) * 2; 
              } else {
                  v.ref.position.x += (r.dir ? 1 : -1) * r.speed * 0.016;
              }
              if (v.ref.position.x > 500) v.ref.position.x = -500;
              if (v.ref.position.x < -500) v.ref.position.x = 500;
              const dx = Math.abs(v.ref.position.x - player.position.x);
              const dy = Math.abs(rowY - player.position.y);
              if (dx < 40 && dy < 20) {
                 isGameOverRef.current = true;
                 setTimeout(() => onGameOverRef.current(scoreRef.current), 500);
              }
            });
          });
        }

        if (movesQueueRef.current.length > 0) {
          const m = movesQueueRef.current[0];
          m.progress += moveSpeed;
          player.position.x = THREE.MathUtils.lerp(positionRef.current.tile * TILE_SIZE, m.tX, m.progress);
          player.position.y = THREE.MathUtils.lerp(positionRef.current.row * TILE_SIZE, m.tY, m.progress);
          player.position.z = Math.sin(m.progress * Math.PI) * 18;

          if (m.progress >= 1) {
            player.position.set(m.tX, m.tY, 0);
            positionRef.current.row += (m.dir === MoveDirection.FORWARD ? 1 : m.dir === MoveDirection.BACKWARD ? -1 : 0);
            positionRef.current.tile += (m.dir === MoveDirection.RIGHT ? 1 : m.dir === MoveDirection.LEFT ? -1 : 0);
            
            if (m.dir === MoveDirection.FORWARD) {
                stepsSinceCoinRef.current += 1;
                if (stepsSinceCoinRef.current >= 5) {
                    onCoinEarnedRef.current(2);
                    stepsSinceCoinRef.current = 0;
                }
            }
            scoreRef.current = Math.max(scoreRef.current, positionRef.current.row);
            setScore(scoreRef.current);
            
            if (positionRef.current.row > metadataRef.current.length - 15) {
                addRows(10);
            }
            movesQueueRef.current.shift();
          }
        }
      }
      camera.position.y = player.position.y - 250;
      camera.position.x = player.position.x + 250;
      camera.lookAt(player.position.x, player.position.y, 0);
      renderer.render(scene, camera);
    };
    animate();
    return () => {
      cancelAnimationFrame(frameIdRef.current);
      window.removeEventListener('resize', resize);
    };
  }, [playerData.currentSkin, hasEffectiveAxe, mapTheme]); 

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        const key = e.key.toLowerCase();
        const map: Record<string, MoveDirection> = { 
            arrowup: MoveDirection.FORWARD, w: MoveDirection.FORWARD, 
            arrowdown: MoveDirection.BACKWARD, s: MoveDirection.BACKWARD,
            arrowleft: MoveDirection.LEFT, a: MoveDirection.LEFT, 
            arrowright: MoveDirection.RIGHT, d: MoveDirection.RIGHT
        };
        if (map[key]) movePlayer(map[key]);
        if (key === ' ' || key === 'enter') activateFreeze();
        if (key === 'e') activateFreeze(); 
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [movePlayer, activateFreeze]);

  const isHackerSkin = playerData.currentSkin === 'hacker_capy';

  return (
    <div className={`relative w-full h-full transition-all duration-100 overflow-hidden ${isFrozen ? 'brightness-125 contrast-125' : ''}`} ref={containerRef}>
      
      {/* Visual Filters */}
      <div className="absolute inset-0 pointer-events-none z-0 transition-opacity duration-300 mix-blend-difference bg-white" style={{ opacity: isFrozen ? 0.2 : 0 }}></div>
      {isHackerSkin && !isFrozen && <div className="absolute inset-0 pointer-events-none z-0 opacity-10 bg-green-900 mix-blend-overlay"></div>}

      <canvas ref={canvasRef} className={`block w-full h-full transition-all duration-200 ${isFrozen ? 'invert grayscale' : ''}`} />
      
      {/* HUD: Score & Coins */}
      <div className="absolute top-4 left-0 w-full flex justify-center pointer-events-none z-10">
        <span className={`text-6xl font-black drop-shadow-md select-none ${isHackerSkin ? 'text-green-500 font-mono' : 'text-white'}`}>{score}</span>
      </div>
      <div className="absolute top-4 right-4 z-10 pointer-events-none">
         <div className="bg-black/30 backdrop-blur-sm rounded-full px-4 py-2 text-white font-bold flex items-center gap-2 border-2 border-white/20">
            <span className="text-yellow-400 text-xl">●</span>
            <span>{playerData.coins}</span>
         </div>
      </div>

      {/* Freeze Effect UI */}
      {isFrozen && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-20">
            <div className="w-[100vw] h-[100vw] rounded-full border-[20px] border-white/50 absolute animate-ping opacity-20"></div>
            <div className="text-white text-6xl font-black drop-shadow-[0_0_10px_rgba(0,0,0,0.8)] animate-bounce flex items-center gap-4 bg-black/50 p-4 rounded-xl">
                <Pause size={64} fill="currentColor" /> ZA WARUDO!
            </div>
        </div>
      )}
      
      {/* Mobile Controls Overlay */}
      <div className="absolute bottom-6 left-0 w-full flex items-end justify-center z-40 pointer-events-none px-4 pb- safe-area-bottom">
        
        {/* Ability Button (Left Side for easier thumb access if needed, or stick to right) */}
        {playerData.hasTimeFreeze && (
             <div className="pointer-events-auto absolute bottom-8 left-8">
                <button
                    onPointerDown={activateFreeze}
                    disabled={!canFreeze || isFrozen}
                    className={`w-20 h-20 rounded-full border-4 flex flex-col items-center justify-center shadow-2xl transition-all
                        ${isFrozen ? 'bg-yellow-400 border-black scale-110 animate-pulse text-black' : 
                        canFreeze ? (isHackerSkin ? 'bg-green-600 border-green-300 active:bg-green-500' : 'bg-purple-500 border-white active:bg-purple-400') + ' active:scale-95' : 
                        'bg-gray-700 border-gray-500 opacity-80'}`}
                >
                    {isHackerSkin ? <Zap size={28} className={isFrozen ? 'animate-spin' : ''} /> : <Snowflake size={28} className={isFrozen ? 'animate-spin' : ''} />}
                    {canFreeze && !isFrozen ? <span className="font-bold text-[10px] uppercase mt-1">Skill</span> : 
                     isFrozen ? <span className="font-black text-[10px] uppercase">STOP</span> :
                     <div className="w-12 px-1 h-1.5 bg-gray-900 rounded-full mt-1"><div className={`h-full ${isHackerSkin ? 'bg-green-500' : 'bg-blue-500'}`} style={{ width: `${cooldownProgress}%` }}></div></div>
                    }
                </button>
             </div>
        )}
        
        {/* D-PAD CONTROLS */}
        <div className="pointer-events-auto flex flex-col items-center gap-2 mb-2">
             {/* Up */}
             <button 
                className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-2xl border-b-4 border-white/40 active:border-b-0 active:translate-y-1 active:bg-white/40 flex items-center justify-center text-white shadow-lg transition-all"
                onPointerDown={(e) => { e.preventDefault(); movePlayer(MoveDirection.FORWARD); }}
             >
                 <ChevronUp size={40} strokeWidth={3} />
             </button>
             
             <div className="flex gap-4">
                 {/* Left */}
                 <button 
                    className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-2xl border-b-4 border-white/40 active:border-b-0 active:translate-y-1 active:bg-white/40 flex items-center justify-center text-white shadow-lg transition-all"
                    onPointerDown={(e) => { e.preventDefault(); movePlayer(MoveDirection.LEFT); }}
                 >
                     <ChevronLeft size={40} strokeWidth={3} />
                 </button>
                 
                 {/* Down */}
                 <button 
                    className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-2xl border-b-4 border-white/40 active:border-b-0 active:translate-y-1 active:bg-white/40 flex items-center justify-center text-white shadow-lg transition-all"
                    onPointerDown={(e) => { e.preventDefault(); movePlayer(MoveDirection.BACKWARD); }}
                 >
                     <ChevronDown size={40} strokeWidth={3} />
                 </button>

                 {/* Right */}
                 <button 
                    className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-2xl border-b-4 border-white/40 active:border-b-0 active:translate-y-1 active:bg-white/40 flex items-center justify-center text-white shadow-lg transition-all"
                    onPointerDown={(e) => { e.preventDefault(); movePlayer(MoveDirection.RIGHT); }}
                 >
                     <ChevronRight size={40} strokeWidth={3} />
                 </button>
             </div>
        </div>

        {/* Axe Indicator */}
        {hasEffectiveAxe && (
          <div className="absolute top-20 left-4 bg-black/40 backdrop-blur p-2 rounded-xl border-2 border-white/20 pointer-events-none">
              {isCarSkin ? <Flame className="text-red-500 w-6 h-6 animate-pulse" /> : <Axe className="text-white w-6 h-6" />}
          </div>
        )}

      </div>
      
      {/* Map Theme Indicator */}
      {mapTheme === 'volcano' && (
          <div className="absolute top-20 left-4 lg:top-4 lg:left-24 bg-red-900/80 text-white px-3 py-1 rounded-full text-xs font-black border border-red-500 animate-pulse pointer-events-none">
              VOLCANO
          </div>
      )}

    </div>
  );
};

export default GameCanvas;