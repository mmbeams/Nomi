import { CATEGORY_COLORS } from '../types';

// High contrast color palette (like reference image: salmon red, orange, medium blue)
const COLOR_PALETTE = [
  '#FF6B6B', // Salmon Red
  '#FF9500', // Orange
  '#4285F4', // Medium Blue/Periwinkle
  '#FF4444', // Red
  '#4ECDC4', // Teal
  '#9B59B6', // Purple
  '#3498DB', // Light Blue
  '#2ECC71', // Green
  '#F39C12', // Gold
  '#E74C3C', // Dark Red
  '#FF69B4', // Hot Pink
  '#00CED1', // Dark Turquoise
  '#FFD700', // Gold
  '#32CD32', // Lime Green
  '#FF6347', // Tomato
  '#9370DB', // Medium Purple
  '#20B2AA', // Light Sea Green
  '#FF8C00', // Dark Orange
];

/**
 * Generate a consistent color for a tag name using hash-based approach
 * Returns a color from the palette that fits the existing color scheme
 */
export const generateTagColor = (tagName: string): string => {
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/54951e98-2bff-4fbd-949e-e65bbe5ee424',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'colorGenerator.ts:29',message:'generateTagColor called',data:{tagName,hasPredefinedColor:!!CATEGORY_COLORS[tagName]},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
  // #endregion
  
  // Check if tag already has a color in CATEGORY_COLORS
  if (CATEGORY_COLORS[tagName]) {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/54951e98-2bff-4fbd-949e-e65bbe5ee424',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'colorGenerator.ts:33',message:'Using predefined color',data:{tagName,color:CATEGORY_COLORS[tagName]},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
    // #endregion
    return CATEGORY_COLORS[tagName];
  }

  // Simple hash function to convert string to number
  let hash = 0;
  for (let i = 0; i < tagName.length; i++) {
    const char = tagName.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }

  // Use absolute value and modulo to get index
  const index = Math.abs(hash) % COLOR_PALETTE.length;
  const generatedColor = COLOR_PALETTE[index];
  
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/54951e98-2bff-4fbd-949e-e65bbe5ee424',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'colorGenerator.ts:48',message:'Generated color from hash',data:{tagName,hash,index,generatedColor},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
  // #endregion
  
  return generatedColor;
};

/**
 * Get color for a category, using generated color if not in predefined list
 */
export const getCategoryColor = (category: string): string => {
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/54951e98-2bff-4fbd-949e-e65bbe5ee424',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'colorGenerator.ts:54',message:'getCategoryColor called',data:{category},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
  // #endregion
  const color = CATEGORY_COLORS[category] || generateTagColor(category);
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/54951e98-2bff-4fbd-949e-e65bbe5ee424',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'colorGenerator.ts:57',message:'getCategoryColor returning',data:{category,color},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
  // #endregion
  return color;
};



