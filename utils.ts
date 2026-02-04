import { Upgrade, StoreUpgrade } from './types';

// Custom short number formatter (k, M)
export const formatNumber = (num: number): string => {
  if (num < 1000) {
    return num.toLocaleString('pt-BR', { maximumFractionDigits: 1 });
  }
  
  if (num < 1000000) {
    const val = num / 1000;
    const formatted = val % 1 === 0 ? val.toFixed(0) : val.toFixed(1);
    return `${formatted}k`;
  }
  
  const val = num / 1000000;
  const formatted = val % 1 === 0 ? val.toFixed(0) : val.toFixed(1);
  return `${formatted}M`;
};

export const formatCurrency = (num: number): string => {
  return new Intl.NumberFormat('pt-BR').format(Math.ceil(num));
};

export const calculateCost = (baseCost: number, count: number): number => {
  return Math.ceil(baseCost * Math.pow(1.15, count));
};

// Calculate all current multipliers based on purchased upgrades
const calculateMultipliers = (storeUpgrades: StoreUpgrade[]) => {
  let clickMultiplier = 1;
  let cursorMultiplier = 1;
  let grandmaMultiplier = 1;
  
  // "Fingers" logic
  let cookiesPerClickExtra = 0; // Starts at 0
  
  storeUpgrades.forEach(u => {
    if (!u.purchased) return;

    switch (u.type) {
      case 'cursor_multi':
        // reinforcedIndexFinger, carpalTunnel, ambidextrous
        if (u.multiplierValue) {
          clickMultiplier *= u.multiplierValue;
          cursorMultiplier *= u.multiplierValue;
        }
        break;
      
      case 'grandma_multi':
        // forwardsFromGrandma, etc.
        if (u.multiplierValue) {
          grandmaMultiplier *= u.multiplierValue;
        }
        break;

      case 'fingers_base':
        // thousandFingers: sets base extra
        if (u.flatValue) {
          cookiesPerClickExtra += u.flatValue; // Usually sets to 0.1
        }
        break;

      case 'fingers_multi':
        // millionFingers: multiplies the extra
        if (u.multiplierValue) {
          cookiesPerClickExtra *= u.multiplierValue;
        }
        break;
    }
  });

  return {
    clickMultiplier,
    cursorMultiplier,
    grandmaMultiplier,
    cookiesPerClickExtra
  };
};

export const calculateClickPower = (buildings: Upgrade[], storeUpgrades: StoreUpgrade[]): number => {
  const { clickMultiplier, cookiesPerClickExtra } = calculateMultipliers(storeUpgrades);
  
  const baseClick = 1;
  
  // Calculate non-cursor buildings count
  const nonCursorBuildingsCount = buildings
    .filter(b => b.id !== 'cursor')
    .reduce((acc, b) => acc + b.count, 0);

  // Formula: (base * multiplier) + (extra * nonCursorCount)
  return (baseClick * clickMultiplier) + (cookiesPerClickExtra * nonCursorBuildingsCount);
};

export const calculateTotalCPS = (buildings: Upgrade[], storeUpgrades: StoreUpgrade[]): number => {
  const { cursorMultiplier, grandmaMultiplier, cookiesPerClickExtra } = calculateMultipliers(storeUpgrades);

  // Helper for "Fingers" bonus on cursors
  const nonCursorBuildingsCount = buildings
    .filter(b => b.id !== 'cursor')
    .reduce((acc, b) => acc + b.count, 0);

  return buildings.reduce((total, building) => {
    let buildingCps = building.baseCps;
    
    // Apply Cursor Multipliers
    if (building.id === 'cursor') {
      // Logic: Cursor CPS = (Count * Base * Multi) + (ExtraFromFingers * NonCursorCount * Count)
      // Note: We calculate PER building here, so we just calculate the CPS of ONE cursor then multiply by count later (in reduce accumulator)
      // However, the finger bonus is usually added to the "click" action of the cursor.
      // Standard Cookie Clicker: Cursors click automatically. Their CPS represents that click.
      // So we apply the same "per non-cursor building" bonus to the Cursor's base CPS.
      
      const fingerBonus = cookiesPerClickExtra * nonCursorBuildingsCount;
      buildingCps = (buildingCps * cursorMultiplier) + fingerBonus;
    }
    
    // Apply Grandma Multipliers
    if (building.id === 'grandma') {
      buildingCps = buildingCps * grandmaMultiplier;
    }
    
    return total + (buildingCps * building.count);
  }, 0);
};