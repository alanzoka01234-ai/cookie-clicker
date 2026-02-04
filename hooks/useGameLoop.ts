import { useState, useEffect, useCallback, useRef } from 'react';
import { GameState, Upgrade, StoreUpgrade, INITIAL_UPGRADES, INITIAL_STORE_UPGRADES } from '../types';
import { calculateCost, calculateTotalCPS, calculateClickPower } from '../utils';

const STORAGE_KEY = 'biscoito_clicker_save_v3';
const TICK_RATE_MS = 100; // Update 10 times a second
const AUTOSAVE_INTERVAL_MS = 10000; // Salva automaticamente a cada 10 segundos

export const useGameLoop = () => {
  const [cookies, setCookies] = useState<number>(0);
  const [lifetimeCookies, setLifetimeCookies] = useState<number>(0);
  const [upgrades, setUpgrades] = useState<Upgrade[]>(INITIAL_UPGRADES);
  const [storeUpgrades, setStoreUpgrades] = useState<StoreUpgrade[]>(INITIAL_STORE_UPGRADES);
  const [loaded, setLoaded] = useState(false);
  const [lastSaveTime, setLastSaveTime] = useState<number>(0);

  // 1. Load from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed: GameState = JSON.parse(saved);
        setCookies(parsed.cookies || 0);
        setLifetimeCookies(parsed.lifetimeCookies || 0);
        
        // Merge saved buildings
        const mergedUpgrades = INITIAL_UPGRADES.map(initUp => {
          const savedUp = parsed.upgrades.find(u => u.id === initUp.id);
          return savedUp ? { ...initUp, count: savedUp.count } : initUp;
        });
        setUpgrades(mergedUpgrades);

        // Merge saved store upgrades (purchased status)
        const savedStoreUpgradeIds = parsed.storeUpgrades || (parsed as any).cursorUpgrades || [];
        
        const mergedStoreUpgrades = INITIAL_STORE_UPGRADES.map(initU => ({
          ...initU,
          purchased: savedStoreUpgradeIds.includes(initU.id)
        }));
        setStoreUpgrades(mergedStoreUpgrades);

      } catch (e) {
        console.error("Failed to load save", e);
      }
    }
    setLoaded(true);
  }, []);

  // 2. Save function (Standardized)
  const saveGame = useCallback(() => {
    if (!loaded) return;
    const state: GameState = {
      cookies,
      lifetimeCookies,
      startTime: Date.now(),
      upgrades,
      storeUpgrades: storeUpgrades.filter(u => u.purchased).map(u => u.id)
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    setLastSaveTime(Date.now());
  }, [cookies, lifetimeCookies, upgrades, storeUpgrades, loaded]);

  // Keep a ref to the latest save function to avoid resetting the interval
  const saveGameRef = useRef(saveGame);
  useEffect(() => {
    saveGameRef.current = saveGame;
  }, [saveGame]);

  // 3. Auto-save Interval
  useEffect(() => {
    if (!loaded) return;

    const interval = setInterval(() => {
      saveGameRef.current();
    }, AUTOSAVE_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [loaded]);

  // 4. Save on Critical Events (Purchases)
  // Monitora mudanças em upgrades (construções) ou storeUpgrades (melhorias)
  // para salvar imediatamente após uma compra.
  useEffect(() => {
    if (loaded) {
      saveGame();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [upgrades, storeUpgrades, loaded]);

  // Game Loop (Ticks)
  useEffect(() => {
    if (!loaded) return;

    const interval = setInterval(() => {
      const cps = calculateTotalCPS(upgrades, storeUpgrades);
      if (cps > 0) {
        const cookiesPerTick = cps * (TICK_RATE_MS / 1000);
        setCookies(prev => prev + cookiesPerTick);
        setLifetimeCookies(prev => prev + cookiesPerTick);
      }
    }, TICK_RATE_MS);

    return () => clearInterval(interval);
  }, [upgrades, storeUpgrades, loaded]);

  const clickPower = calculateClickPower(upgrades, storeUpgrades);

  const addCookie = (amount: number = 1) => {
    const effectiveAmount = amount * clickPower;
    setCookies(prev => prev + effectiveAmount);
    setLifetimeCookies(prev => prev + effectiveAmount);
  };

  const buyUpgrade = (upgradeId: string) => {
    setUpgrades(prev => prev.map(u => {
      if (u.id !== upgradeId) return u;
      
      const cost = calculateCost(u.baseCost, u.count);
      if (cookies >= cost) {
        setCookies(c => c - cost);
        return { ...u, count: u.count + 1 };
      }
      return u;
    }));
  };

  const buyStoreUpgrade = (upgradeId: string) => {
    setStoreUpgrades(prev => {
      const upgrade = prev.find(u => u.id === upgradeId);
      if (!upgrade || upgrade.purchased) return prev;
      
      const reqBuilding = upgrades.find(u => u.id === upgrade.triggerId);
      const currentCount = reqBuilding ? reqBuilding.count : 0;
      
      if (currentCount < upgrade.reqCount) return prev; 

      if (cookies >= upgrade.baseCost) {
        setCookies(c => c - upgrade.baseCost);
        return prev.map(u => u.id === upgradeId ? { ...u, purchased: true } : u);
      }
      return prev;
    });
  };

  const resetGame = () => {
    if (window.confirm("Tem certeza que deseja resetar todo o progresso?")) {
      localStorage.removeItem(STORAGE_KEY);
      setCookies(0);
      setLifetimeCookies(0);
      setUpgrades(INITIAL_UPGRADES);
      setStoreUpgrades(INITIAL_STORE_UPGRADES);
    }
  };

  const cps = calculateTotalCPS(upgrades, storeUpgrades);

  return {
    cookies,
    cps,
    clickPower,
    upgrades,
    storeUpgrades,
    addCookie,
    buyUpgrade,
    buyStoreUpgrade,
    resetGame,
    saveGame,
    lastSaveTime
  };
};