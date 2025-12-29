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
  // Check if tag already has a color in CATEGORY_COLORS
  if (CATEGORY_COLORS[tagName]) {
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
  return COLOR_PALETTE[index];
};

/**
 * Get color for a category, using generated color if not in predefined list
 */
export const getCategoryColor = (category: string): string => {
  return CATEGORY_COLORS[category] || generateTagColor(category);
};



