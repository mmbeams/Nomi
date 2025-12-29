export interface Note {
  id: string;
  content: string;
  category: string;
  created_at: number;
  source_url?: string;
  description?: string;
  is_favorite?: boolean;
}

export type View = 'landing' | 'history' | 'detail';

export const CATEGORY_COLORS: Record<string, string> = {
  'Daily Life': '#FF4444', // Red
  'Todos': '#FF6B6B', // Coral
  'Work': '#4ECDC4', // Teal
  'Dev': '#4285F4', // Blue
  'Inspo': '#FF9500', // Orange
  'Ideas': '#9B59B6', // Purple
  'Learning': '#3498DB', // Light Blue
  'Health': '#2ECC71', // Green
  'Finance': '#F39C12', // Gold
  'Projects': '#E74C3C', // Dark Red
};

export const BACKEND_URL = 'http://localhost:3001';




