import React, { useState, useEffect } from 'react';
import CookieButton from './components/CookieButton';
import Store from './components/Store';
import SettingsModal from './components/SettingsModal';
import { useGameLoop } from './hooks/useGameLoop';
import { formatNumber } from './utils';
import { soundService } from '../services/soundService';

const App: React.FC = () => {
  const { 
    cookies, 
    cps, 
    clickPower,
    upgrades, 
    storeUpgrades, // Renamed from cursorUpgrades
    addCookie, 
    buyUpgrade, 
    buyStoreUpgrade, // Renamed from buyCursorUpgrade
    resetGame, 
    saveGame,
    lastSaveTime
  } = useGameLoop();
  
  // Animation state for the header icon
  const [isBumping, setIsBumping] = React.useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  // Notification state
  const [showSaveNotify, setShowSaveNotify] = useState(false);

  const prevCookiesRef = React.useRef(cookies);

  // Global Audio Unlock for Mobile
  React.useEffect(() => {
    const handleInteraction = () => {
      soundService.unlockAudio();
    };
    
    window.addEventListener('pointerdown', handleInteraction);
    window.addEventListener('keydown', handleInteraction);
    
    return () => {
      window.removeEventListener('pointerdown', handleInteraction);
      window.removeEventListener('keydown', handleInteraction);
    };
  }, []);

  // Trigger animation when cookies increase
  React.useEffect(() => {
    if (cookies > prevCookiesRef.current) {
      setIsBumping(true);
      const timer = setTimeout(() => setIsBumping(false), 150);
      return () => clearTimeout(timer);
    }
    prevCookiesRef.current = cookies;
  }, [cookies]);

  // Handle Save Notification
  useEffect(() => {
    if (lastSaveTime > 0) {
      setShowSaveNotify(true);
      const timer = setTimeout(() => setShowSaveNotify(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [lastSaveTime]);

  // Save manually when leaving
  React.useEffect(() => {
    const handleUnload = () => saveGame();
    window.addEventListener('beforeunload', handleUnload);
    return () => window.removeEventListener('beforeunload', handleUnload);
  }, [saveGame]);

  // Determine cursor count for the visual ring
  const cursorCount = upgrades.find(u => u.id === 'cursor')?.count || 0;

  return (
    <div className="min-h-screen flex flex-col md:flex-row max-w-7xl mx-auto overflow-hidden">
      
      {/* Save Notification - Top Left Fixed */}
      <div className={`fixed top-4 left-4 z-50 transition-all duration-500 transform ${showSaveNotify ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'} pointer-events-none`}>
        <div className="bg-white/90 backdrop-blur text-green-700 px-3 py-1.5 rounded-full shadow-md border border-green-200 text-xs font-bold flex items-center gap-2">
          <span>💾</span> Jogo Salvo
        </div>
      </div>

      {/* LEFT COLUMN: Game Area */}
      <section className="relative w-full md:w-5/12 lg:w-4/12 flex flex-col bg-amber-50/50 p-6 z-10 shadow-xl md:shadow-none">
        
        {/* Header / Stats */}
        <header className="mb-8 text-center space-y-2">
          <div className="flex justify-between items-center px-2">
             <div className="w-8"></div> {/* Spacer to center title */}
             <div className="inline-block bg-amber-200 px-4 py-1 rounded-full text-amber-800 text-xs font-bold tracking-widest uppercase">
              Mestre do Biscoito
             </div>
             <button 
               onClick={() => setIsSettingsOpen(true)}
               className="w-8 h-8 flex items-center justify-center text-amber-800/50 hover:text-amber-800 transition-colors rounded-full hover:bg-amber-200/50"
               aria-label="Configurações"
             >
               ⚙️
             </button>
          </div>
          
          <div className="bg-white/80 backdrop-blur rounded-2xl p-4 shadow-sm border border-amber-100 mt-2">
             {/* Counter Row with Icon */}
             <div className="flex items-center justify-center gap-3 mb-1">
               {/* SVG Icon */}
               <div className={`w-10 h-10 transition-transform duration-150 ${isBumping ? 'scale-125' : 'scale-100'}`}>
                 <svg 
                   version="1.1" 
                   viewBox="0 0 512 512" 
                   className="w-full h-full drop-shadow-sm"
                   xmlns="http://www.w3.org/2000/svg"
                 >
                   <circle style={{fill:"#F6A230"}} cx="256" cy="256" r="248.396"></circle>
                   <g>
                     <path style={{fill:"#53180F"}} d="M256,512c-68.38,0-132.668-26.629-181.019-74.981C26.629,388.667,0,324.38,0,256 S26.629,123.332,74.981,74.981C123.332,26.629,187.62,0,256,0s132.667,26.629,181.019,74.981C485.371,123.332,512,187.62,512,256 s-26.629,132.667-74.981,181.019S324.38,512,256,512z M256,15.208c-64.318,0-124.786,25.046-170.266,70.527 C40.254,131.214,15.208,191.682,15.208,256s25.046,124.786,70.527,170.266c45.479,45.48,105.946,70.526,170.265,70.526 s124.786-25.046,170.266-70.527c45.48-45.479,70.526-105.947,70.526-170.265s-25.046-124.786-70.527-170.266 C380.786,40.254,320.318,15.208,256,15.208z"></path>
                     <path style={{fill:"#53180F"}} d="M411.925,411.925l-10.755-10.752c23.197-23.198,40.043-50.708,50.072-81.765l14.471,4.673 C454.939,357.452,436.841,387.008,411.925,411.925z"></path>
                     <path style={{fill:"#53180F"}} d="M471.177,303.952l-14.85-3.285c15.278-69.058-5.341-140.026-55.156-189.841l10.754-10.754 c26.647,26.648,46.098,59.841,56.246,95.99C478.004,231.085,479.043,268.393,471.177,303.952z"></path>
                   </g>
                   <circle style={{fill:"#C66500"}} cx="256" cy="256" r="16.313"></circle>
                   <path style={{fill:"#53180F"}} d="M256,279.917c-13.188,0-23.917-10.729-23.917-23.917c0-13.188,10.729-23.917,23.917-23.917 c13.188,0,23.917,10.729,23.917,23.917C279.917,269.188,269.188,279.917,256,279.917z M256,247.291 c-4.802,0-8.709,3.907-8.709,8.709s3.907,8.709,8.709,8.709s8.709-3.907,8.709-8.709S260.802,247.291,256,247.291z"></path>
                   <circle style={{fill:"#C66500"}} cx="126.368" cy="256" r="16.313"></circle>
                   <path style={{fill:"#53180F"}} d="M126.371,279.917c-13.188,0-23.917-10.729-23.917-23.917c0-13.188,10.729-23.917,23.917-23.917 s23.917,10.729,23.917,23.917C150.287,269.188,139.558,279.917,126.371,279.917z M126.371,247.291c-4.802,0-8.709,3.907-8.709,8.709 s3.907,8.709,8.709,8.709c4.802,0,8.709-3.907,8.709-8.709S131.172,247.291,126.371,247.291z"></path>
                   <circle style={{fill:"#C66500"}} cx="320.816" cy="126.368" r="16.313"></circle>
                   <path style={{fill:"#53180F"}} d="M320.815,150.287c-13.188,0-23.917-10.729-23.917-23.917s10.729-23.917,23.917-23.917 c13.188,0,23.917,10.729,23.917,23.917S334.002,150.287,320.815,150.287z M320.815,117.662c-4.802,0-8.709,3.907-8.709,8.709 c0,4.802,3.907,8.709,8.709,8.709c4.802,0,8.709-3.907,8.709-8.709C329.524,121.568,325.617,117.662,320.815,117.662z"></path>
                   <circle style={{fill:"#C66500"}} cx="385.632" cy="256" r="16.313"></circle>
                   <path style={{fill:"#53180F"}} d="M385.629,279.917c-13.188,0-23.917-10.729-23.917-23.917c0-13.188,10.729-23.917,23.917-23.917 c13.188,0,23.917,10.729,23.917,23.917C409.546,269.188,398.818,279.917,385.629,279.917z M385.629,247.291 c-4.802,0-8.709,3.907-8.709,8.709s3.906,8.709,8.709,8.709c4.802,0,8.709-3.907,8.709-8.709S390.432,247.291,385.629,247.291z"></path>
                   <circle style={{fill:"#C66500"}} cx="191.184" cy="126.368" r="16.313"></circle>
                   <path style={{fill:"#53180F"}} d="M191.185,150.287c-13.188,0-23.917-10.729-23.917-23.917s10.729-23.917,23.917-23.917 s23.917,10.729,23.917,23.917S204.373,150.287,191.185,150.287z M191.185,117.662c-4.802,0-8.709,3.907-8.709,8.709 c0,4.802,3.907,8.709,8.709,8.709s8.709-3.907,8.709-8.709C199.894,121.568,195.988,117.662,191.185,117.662z"></path>
                   <circle style={{fill:"#C66500"}} cx="320.816" cy="385.632" r="16.313"></circle>
                   <path style={{fill:"#53180F"}} d="M320.815,409.546c-13.188,0-23.917-10.729-23.917-23.917c0-13.188,10.729-23.917,23.917-23.917 c13.188,0,23.917,10.729,23.917,23.917C344.732,398.818,334.002,409.546,320.815,409.546z M320.815,376.921 c-4.802,0-8.709,3.906-8.709,8.709c0,4.802,3.907,8.709,8.709,8.709c4.802,0,8.709-3.906,8.709-8.709 C329.524,380.828,325.617,376.921,320.815,376.921z"></path>
                   <circle style={{fill:"#C66500"}} cx="191.184" cy="385.632" r="16.313"></circle>
                   <path style={{fill:"#53180F"}} d="M191.185,409.546c-13.188,0-23.917-10.729-23.917-23.917c0-13.188,10.729-23.917,23.917-23.917 s23.917,10.729,23.917,23.917C215.102,398.818,204.373,409.546,191.185,409.546z M191.185,376.921c-4.802,0-8.709,3.906-8.709,8.709 c0,4.802,3.907,8.709,8.709,8.709s8.709-3.906,8.709-8.709C199.894,380.828,195.988,376.921,191.185,376.921z"></path>
                 </svg>
               </div>
               
               <h1 className="text-4xl md:text-5xl font-extrabold text-amber-900 tracking-tight leading-none">
                {formatNumber(Math.floor(cookies))}
              </h1>
              <span className="text-xl md:text-2xl font-bold text-amber-700">
                Biscoitos
              </span>
             </div>

            <div className="mt-2 text-sm text-gray-500 font-mono bg-gray-100 inline-block px-2 py-1 rounded">
              por segundo: <span className="font-bold text-gray-700">{formatNumber(cps)}</span>
            </div>
          </div>
        </header>

        {/* The Big Cookie */}
        <div className="flex-1 flex items-center justify-center">
          <CookieButton onClick={() => addCookie(1)} cursorCount={cursorCount} clickPower={clickPower} />
        </div>

        {/* Footer Controls */}
        <footer className="mt-8 flex justify-center items-center gap-4">
          <button 
            onClick={resetGame}
            className="text-xs text-amber-800/50 hover:text-red-600 underline transition-colors"
          >
            Resetar Jogo
          </button>
          <div className="text-xs text-amber-800/30">
            v1.3.0
          </div>
        </footer>
      </section>

      {/* RIGHT COLUMN: Store Area */}
      <section className="flex-1 bg-amber-100/50 p-4 md:p-6 lg:p-8 h-[50vh] md:h-screen overflow-hidden">
        <Store 
          cookies={cookies} 
          upgrades={upgrades} 
          storeUpgrades={storeUpgrades} // Renamed from cursorUpgrades
          onBuy={buyUpgrade} 
          onBuyStoreUpgrade={buyStoreUpgrade} // Renamed from buyCursorUpgrade
        />
      </section>

      {/* Mobile overlay gradient */}
      <div className="fixed bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-amber-100 to-transparent pointer-events-none md:hidden z-20" />

      {/* Settings Modal */}
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </div>
  );
};

export default App;