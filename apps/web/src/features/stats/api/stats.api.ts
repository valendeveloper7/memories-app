import type { CalendarDay, HeatmapCell, StatsOverview } from 'shared';
import { http } from '@/services/http';

export const statsApi = {
  overview: () => http.get<StatsOverview>('/stats/overview').then((r) => r.data),
  heatmap: () => http.get<HeatmapCell[]>('/stats/heatmap').then((r) => r.data),
  calendar: (year: number, month: number) =>
    http.get<CalendarDay[]>(`/stats/calendar/${year}/${month}`).then((r) => r.data),
};
