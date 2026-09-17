/**
 * config.js
 * Game configuration constants.
 */

/** @const {Array} */
const CATS = [{id:'calculate',name:'Calculate',icon:'🧮',desc:'Math'},{id:'memorize',name:'Memorize',icon:'🧠',desc:'Sequences'},{id:'analyze',name:'Analyze',icon:'🔍',desc:'Patterns'},{id:'visualize',name:'Visualize',icon:'🧊',desc:'3D cubes'},{id:'weigh',name:'Weigh',icon:'⚖️',desc:'Heaviest'},{id:'countup',name:'Count Up',icon:'🎯',desc:'Tap order'},{id:'react',name:'React',icon:'⚡',desc:'Stroop'}];

/** @const {number} */
const CAT_TIME = 45;

/** @const {Array} */
const RANKS = [{min:0,n:'Amoeba',i:'🦠'},{min:200,n:'Goldfish',i:'🐠'},{min:400,n:'Rabbit',i:'🐰'},{min:650,n:'Dolphin',i:'🐬'},{min:900,n:'Owl',i:'🦉'},{min:1200,n:'Elephant',i:'🐘'},{min:1600,n:'Einstein',i:'😼'},{min:2000,n:'Galaxy Brain',i:'🌌'}];

/** @const {Array} */
const OBJ = [{e:'🔴'},{e:'🟦'},{e:'🟢'},{e:'🔶'},{e:'🟣'},{e:'⭐'},{e:'🔺'},{e:'💎'},{e:'🟡'},{e:'🧊'},{e:'🪨'},{e:'🏀'},{e:'🍎'},{e:'🎾'},{e:'🧱'}];

/**
 * High-contrast textured palettes for Count Up rotating disks
 * @const {Array<{bg: string, border: string}>}
 */
const CU_TEXTURES = [
  // 0: Crimson Vinyl Groove
  {
    bg: 'repeating-radial-gradient(circle at center, #d91b42 0, #d91b42 4px, #b01033 4px, #b01033 7px, #ff3860 7px, #ff3860 10px)',
    border: 'rgba(255, 200, 215, 0.85)'
  },
  // 1: Amber Sunburst Turbine
  {
    bg: 'radial-gradient(circle at 35% 30%, rgba(255,255,255,0.3) 0%, transparent 45%), repeating-conic-gradient(from 0deg, #d49000 0deg 20deg, #f5b700 20deg 40deg, #a86c00 40deg 60deg)',
    border: 'rgba(255, 245, 180, 0.85)'
  },
  // 2: Emerald Jade Marble
  {
    bg: 'radial-gradient(circle at 30% 25%, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0.1) 35%, transparent 60%), radial-gradient(circle at center, #1b9e54 30%, #0d6835 75%, #074723 100%)',
    border: 'rgba(190, 255, 215, 0.85)'
  },
  // 3: Cobalt Tech Ripple
  {
    bg: 'repeating-radial-gradient(circle at center, #1d6cd9 0, #1d6cd9 3px, #134ba0 3px, #134ba0 6px), repeating-conic-gradient(from 45deg, rgba(255,255,255,0.14) 0deg 30deg, transparent 30deg 60deg)',
    border: 'rgba(200, 225, 255, 0.85)'
  },
  // 4: Vivid Violet Pinwheel
  {
    bg: 'radial-gradient(circle at 35% 30%, rgba(255,255,255,0.3) 0%, transparent 50%), repeating-conic-gradient(from 0deg, #7c2dd9 0deg 30deg, #9b4cf0 30deg 60deg, #5919a3 60deg 90deg)',
    border: 'rgba(235, 210, 255, 0.85)'
  },
  // 5: Neon Cyan Energy Ring
  {
    bg: 'repeating-radial-gradient(circle at center, #0ca8a8 0, #0ca8a8 4px, #077979 4px, #077979 7px), repeating-conic-gradient(from 15deg, rgba(255,255,255,0.15) 0deg 25deg, transparent 25deg 50deg)',
    border: 'rgba(195, 255, 255, 0.85)'
  },
  // 6: Blaze Tangerine Gear
  {
    bg: 'radial-gradient(circle at 35% 35%, rgba(255,255,255,0.35) 0%, transparent 40%), repeating-conic-gradient(from 0deg, #e65c00 0deg 18deg, #ff7e24 18deg 36deg, #b84500 36deg 54deg)',
    border: 'rgba(255, 225, 195, 0.85)'
  },
  // 7: Electric Magenta Orbit
  {
    bg: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.4) 0%, transparent 45%), repeating-radial-gradient(circle at center, #d41775 0, #d41775 4px, #9e0d54 4px, #9e0d54 8px)',
    border: 'rgba(255, 205, 235, 0.85)'
  }
];

