export interface StatsOverview {
  totalMemories: number;
  photos: number;
  videos: number;
  albums: number;
  yearsRegistered: number;
  daysTogether?: number;
  topLocation?: string;
  busiestDay?: { date: string; count: number };
  favoriteMonth?: { month: number; count: number };
}

/** Celda del mapa de calor de actividad. */
export interface HeatmapCell {
  date: string; // YYYY-MM-DD
  count: number;
}

/** Día del calendario con recuento y una miniatura representativa. */
export interface CalendarDay {
  date: string; // YYYY-MM-DD
  count: number;
  thumbnailUrl?: string;
}
