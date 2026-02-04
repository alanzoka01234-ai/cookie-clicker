import React from 'react';
import { Upgrade, StoreUpgrade } from '../types';
import { calculateCost, formatCurrency, formatNumber } from '../utils';
import { soundService } from '../services/soundService';

interface Props {
  cookies: number;
  upgrades: Upgrade[];
  storeUpgrades: StoreUpgrade[];
  onBuy: (id: string) => void;
  onBuyStoreUpgrade: (id: string) => void;
}

const Store: React.FC<Props> = ({ cookies, upgrades, storeUpgrades, onBuy, onBuyStoreUpgrade }) => {
  return (
    <div className="flex flex-col h-full bg-white/50 backdrop-blur-sm rounded-xl border border-amber-200 shadow-xl overflow-hidden">
      <div className="p-4 bg-amber-500 text-white shadow-md z-10 flex-none">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <span>🏪</span> Loja de Upgrades
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
        {/* 
            Mobile: grid-cols-1 (1 coluna) -> Construções primeiro, depois Upgrades.
            Desktop: md:grid-cols-2 (2 colunas lado a lado).
            gap-6: Espaçamento confortável entre as seções no mobile.
        */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6">
          
          {/* COLUNA 1: CONSTRUÇÕES */}
          <div className="space-y-2">
            <div className="sticky top-0 bg-white/90 backdrop-blur-sm z-10 py-2 border-b border-amber-200 mb-2">
              <h3 className="text-sm font-bold text-amber-800 uppercase tracking-wider">
                Construções
              </h3>
            </div>
            
            {upgrades.map((upgrade) => {
              const cost = calculateCost(upgrade.baseCost, upgrade.count);
              const canAfford = cookies >= cost;

              return (
                <button
                  key={upgrade.id}
                  onClick={() => onBuy(upgrade.id)}
                  onPointerDown={() => canAfford && soundService.playClick()}
                  disabled={!canAfford}
                  className={`w-full group relative flex items-center gap-3 p-3 rounded-lg border-2 transition-all duration-200 text-left
                    ${canAfford 
                      ? 'bg-white border-amber-200 hover:border-amber-400 hover:shadow-md cursor-pointer active:scale-[0.98]' 
                      : 'bg-gray-50 border-gray-100 opacity-60 cursor-not-allowed grayscale-[0.5]'
                    }
                  `}
                >
                  {/* Icon Box */}
                  <div className={`w-12 h-12 flex-none flex items-center justify-center text-2xl bg-amber-100 rounded-md shadow-inner transition-transform group-hover:scale-110`}>
                    {upgrade.icon}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-1">
                      <h3 className="font-bold text-gray-800 truncate text-sm">{upgrade.name}</h3>
                      <span className="text-lg font-bold text-amber-900/20 group-hover:text-amber-900/40 transition-colors">
                        {upgrade.count}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center text-xs">
                      <div className={`font-bold flex items-center gap-1 ${canAfford ? 'text-green-600' : 'text-red-400'}`}>
                        <span>🍪</span> {formatCurrency(cost)}
                      </div>
                      <div className="text-gray-500">
                        +{formatNumber(upgrade.baseCps)} CPS
                      </div>
                    </div>
                  </div>

                  {/* Hover Description Tooltip (Desktop) */}
                  <div className="absolute hidden md:group-hover:block left-full top-1/2 -translate-y-1/2 ml-2 w-48 bg-gray-800 text-white text-xs p-3 rounded shadow-xl pointer-events-none z-50">
                    <div className="font-bold mb-1 text-amber-400">{upgrade.name}</div>
                    <div className="mb-2 italic opacity-80">"{upgrade.description}"</div>
                    <div className="border-t border-gray-600 pt-1 mt-1">
                       Produz <span className="font-bold">{formatNumber(upgrade.baseCps)}</span> cps
                    </div>
                    {/* Arrow */}
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 bg-gray-800 rotate-45"></div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* COLUNA 2: MELHORIAS (Store Upgrades) */}
          <div className="space-y-2">
            <div className="sticky top-0 bg-white/90 backdrop-blur-sm z-10 py-2 border-b border-blue-200 mb-2">
              <h3 className="text-sm font-bold text-blue-800 uppercase tracking-wider">
                Melhorias
              </h3>
            </div>

            {storeUpgrades.map((upgrade) => {
              // Find the building this upgrade depends on
              const reqBuilding = upgrades.find(u => u.id === upgrade.triggerId);
              const currentCount = reqBuilding ? reqBuilding.count : 0;
              const unlocked = currentCount >= upgrade.reqCount;
              const canAfford = cookies >= upgrade.baseCost;
              const isBuyable = unlocked && canAfford && !upgrade.purchased;

              // Define colors based on type (Cursor vs Grandma)
              const isCursor = upgrade.triggerId === 'cursor';
              const bgPurchased = isCursor ? 'bg-green-200' : 'bg-pink-200';
              const bgNormal = isCursor ? 'bg-blue-100' : 'bg-pink-100';
              const borderNormal = isCursor ? 'border-blue-200' : 'border-pink-200';
              const hoverBorder = isCursor ? 'hover:border-blue-400' : 'hover:border-pink-400';
              
              return (
                <button
                  key={upgrade.id}
                  onClick={() => isBuyable && onBuyStoreUpgrade(upgrade.id)}
                  disabled={!isBuyable}
                  className={`w-full group relative flex items-center gap-3 p-3 rounded-lg border-2 transition-all duration-200 text-left
                    ${upgrade.purchased
                      ? 'bg-green-50 border-green-200 opacity-80 cursor-default'
                      : !unlocked
                        ? 'bg-gray-100 border-gray-200 opacity-50 cursor-not-allowed'
                        : canAfford
                          ? `bg-white ${borderNormal} ${hoverBorder} hover:shadow-md cursor-pointer active:scale-[0.98]`
                          : 'bg-gray-50 border-gray-200 opacity-60 cursor-not-allowed grayscale-[0.5]'
                    }
                  `}
                >
                  {/* Icon Box */}
                  <div className={`w-12 h-12 flex-none flex items-center justify-center text-2xl rounded-md shadow-inner transition-transform group-hover:scale-110
                    ${upgrade.purchased ? 'bg-green-200' : bgNormal}
                  `}>
                    {upgrade.purchased ? '✅' : upgrade.icon}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-1">
                      <h3 className="font-bold text-gray-800 truncate text-sm">{upgrade.name}</h3>
                    </div>
                    
                    <div className="flex justify-between items-center text-xs">
                      {upgrade.purchased ? (
                        <div className="font-bold text-green-700">Comprado</div>
                      ) : !unlocked ? (
                         <div className="text-gray-500 font-bold">
                           Requer {upgrade.reqCount} {reqBuilding?.name || 'itens'}
                         </div>
                      ) : (
                        <div className={`font-bold flex items-center gap-1 ${canAfford ? 'text-green-600' : 'text-red-400'}`}>
                          <span>🍪</span> {formatCurrency(upgrade.baseCost)}
                        </div>
                      )}
                    </div>
                  </div>

                   {/* Hover Description Tooltip (Desktop) */}
                   <div className="absolute hidden md:group-hover:block right-full md:right-auto md:left-full top-1/2 -translate-y-1/2 mr-2 md:ml-2 md:mr-0 w-48 bg-gray-800 text-white text-xs p-3 rounded shadow-xl pointer-events-none z-50">
                    <div className={`font-bold mb-1 ${isCursor ? 'text-blue-300' : 'text-pink-300'}`}>{upgrade.name}</div>
                    <div className="mb-2 italic opacity-80">"{upgrade.description}"</div>
                    {upgrade.flavorText && (
                      <div className="mb-2 text-gray-500 italic text-[10px]">"{upgrade.flavorText}"</div>
                    )}
                    {!unlocked && (
                       <div className="text-red-300 font-bold mt-1">Bloqueado: Precisa de {upgrade.reqCount} {reqBuilding?.name.toLowerCase()}.</div>
                    )}
                  </div>
                </button>
              );
            })}
            
            {storeUpgrades.length === 0 && (
               <div className="text-center text-gray-400 italic text-sm p-4">
                 Mais melhorias em breve...
               </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default Store;