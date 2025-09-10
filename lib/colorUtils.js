// lib/colorUtils.js
export const parseColor = (color) => {
  if (color === 'transparent') {
    return { r: 0, g: 0, b: 0, alpha: 0 };
  }
  
  if (color.startsWith('#')) {
    const hex = color.replace('#', '');
    return {
      r: parseInt(hex.substring(0, 2), 16),
      g: parseInt(hex.substring(2, 4), 16),
      b: parseInt(hex.substring(4, 6), 16),
      alpha: 1
    };
  }
  
  const colorMap = {
    'white': { r: 255, g: 255, b: 255, alpha: 1 },
    'black': { r: 0, g: 0, b: 0, alpha: 1 },
    'red': { r: 255, g: 0, b: 0, alpha: 1 },
    'green': { r: 0, g: 255, b: 0, alpha: 1 },
    'blue': { r: 0, g: 0, b: 255, alpha: 1 },
    'yellow': { r: 255, g: 255, b: 0, alpha: 1 },
    'cyan': { r: 0, g: 255, b: 255, alpha: 1 },
    'magenta': { r: 255, g: 0, b: 255, alpha: 1 },
    'gray': { r: 128, g: 128, b: 128, alpha: 1 }
  };
  
  return colorMap[color.toLowerCase()] || { r: 0, g: 0, b: 0, alpha: 1 };
};