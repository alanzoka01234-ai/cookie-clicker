export interface Upgrade {
  id: string;
  name: string;
  description: string;
  baseCost: number;
  baseCps: number; // Cookies Per Second
  count: number;
  icon: string;
}

export interface StoreUpgrade {
  id: string;
  name: string;
  description: string;
  flavorText?: string;
  baseCost: number;
  
  // Unlock Requirements
  triggerId: string; // The building ID required (e.g., 'cursor', 'grandma')
  reqCount: number;  // How many of that building required
  
  // Effect Data
  type: 'cursor_multi' | 'grandma_multi' | 'fingers_base' | 'fingers_multi';
  multiplierValue?: number; // For multipliers (e.g. 2)
  flatValue?: number;      // For base fingers addition
  
  purchased: boolean;
  icon: string;
}

export interface GameState {
  cookies: number;
  lifetimeCookies: number;
  startTime: number;
  upgrades: Upgrade[];
  storeUpgrades: string[]; // IDs of purchased store upgrades
}

export const INITIAL_UPGRADES: Upgrade[] = [
  {
    id: 'cursor',
    name: 'Cursor Automático',
    description: 'Clica automaticamente uma vez a cada 10 segundos.',
    baseCost: 15,
    baseCps: 0.1,
    count: 0,
    icon: '👆'
  },
  {
    id: 'grandma',
    name: 'Vovó',
    description: 'Uma vovó simpática para assar mais biscoitos.',
    baseCost: 100,
    baseCps: 1,
    count: 0,
    icon: '👵'
  },
  {
    id: 'farm',
    name: 'Fazenda de Biscoitos',
    description: 'Cultive biscoitos diretamente da terra.',
    baseCost: 1100,
    baseCps: 8,
    count: 0,
    icon: '🚜'
  },
  {
    id: 'bakery',
    name: 'Fábrica',
    description: 'Produção em massa de biscoitos deliciosos.',
    baseCost: 12000,
    baseCps: 47,
    count: 0,
    icon: '🏭'
  },
  {
    id: 'mine',
    name: 'Mina de Chocolate',
    description: 'Extração de chocolate puro do subsolo.',
    baseCost: 130000,
    baseCps: 260,
    count: 0,
    icon: '⛏️'
  },
  {
    id: 'lab',
    name: 'Laboratório de Alquimia',
    description: 'Transforma ouro em biscoitos.',
    baseCost: 1400000,
    baseCps: 1400,
    count: 0,
    icon: '🧪'
  }
];

export const INITIAL_STORE_UPGRADES: StoreUpgrade[] = [
  // --- CURSOR UPGRADES ---
  {
    id: 'reinforcedIndexFinger',
    name: 'Indicador Reforçado',
    description: 'O mouse e os cursores são duas vezes mais eficientes.',
    flavorText: 'prod prod',
    baseCost: 100,
    triggerId: 'cursor',
    reqCount: 1,
    type: 'cursor_multi',
    multiplierValue: 2,
    purchased: false,
    icon: '☝️'
  },
  {
    id: 'carpalTunnelPreventionCream',
    name: 'Creme Anti-Túnel do Carpo',
    description: 'O mouse e os cursores são duas vezes mais eficientes.',
    flavorText: 'it... it hurts to click...',
    baseCost: 500,
    triggerId: 'cursor',
    reqCount: 1,
    type: 'cursor_multi',
    multiplierValue: 2,
    purchased: false,
    icon: '🧴'
  },
  {
    id: 'ambidextrous',
    name: 'Ambidestro',
    description: 'O mouse e os cursores são duas vezes mais eficientes.',
    flavorText: 'Look ma, both hands!',
    baseCost: 10000,
    triggerId: 'cursor',
    reqCount: 10,
    type: 'cursor_multi',
    multiplierValue: 2,
    purchased: false,
    icon: '👐'
  },
  {
    id: 'thousandFingers',
    name: 'Mil Dedos',
    description: 'O mouse e os cursores ganham +0.1 cookies para cada prédio que não seja cursor.',
    flavorText: 'clickity',
    baseCost: 100000,
    triggerId: 'cursor',
    reqCount: 25,
    type: 'fingers_base',
    flatValue: 0.1,
    purchased: false,
    icon: '🖐️'
  },
  {
    id: 'millionFingers',
    name: 'Um Milhão de Dedos',
    description: 'Multiplica o ganho de Mil Dedos por 5.',
    flavorText: 'clickityclickity',
    baseCost: 10000000,
    triggerId: 'cursor',
    reqCount: 50,
    type: 'fingers_multi',
    multiplierValue: 5,
    purchased: false,
    icon: '🙌'
  },

  // --- GRANDMA UPGRADES ---
  {
    id: 'forwardsFromGrandma',
    name: 'Encaminhados da Vovó',
    description: 'Vovós são duas vezes mais eficientes.',
    flavorText: 'RE: RE: RE: olha esse biscoito',
    baseCost: 1000,
    triggerId: 'grandma',
    reqCount: 1,
    type: 'grandma_multi',
    multiplierValue: 2,
    purchased: false,
    icon: '👵'
  },
  {
    id: 'steelPlatedRollingPins',
    name: 'Rolos de Aço',
    description: 'Vovós são duas vezes mais eficientes.',
    flavorText: 'Duro na queda.',
    baseCost: 5000,
    triggerId: 'grandma',
    reqCount: 5,
    type: 'grandma_multi',
    multiplierValue: 2,
    purchased: false,
    icon: '👵'
  },
  {
    id: 'lubricatedDentures',
    name: 'Dentaduras Lubrificadas',
    description: 'Vovós são duas vezes mais eficientes.',
    flavorText: 'Para aquela mastigada suave.',
    baseCost: 50000,
    triggerId: 'grandma',
    reqCount: 25,
    type: 'grandma_multi',
    multiplierValue: 2,
    purchased: false,
    icon: '👵'
  },
  {
    id: 'pruneJuice',
    name: 'Suco de Ameixa',
    description: 'Vovós são duas vezes mais eficientes.',
    flavorText: 'Mantém tudo fluindo.',
    baseCost: 5000000,
    triggerId: 'grandma',
    reqCount: 50,
    type: 'grandma_multi',
    multiplierValue: 2,
    purchased: false,
    icon: '👵'
  }
];