import { useQuery } from '@tanstack/react-query';
import { statsApi } from '../api/stats.api';

export function useOverview() {
  return useQuery({ queryKey: ['stats', 'overview'], queryFn: statsApi.overview });
}

export function useHeatmap() {
  return useQuery({ queryKey: ['stats', 'heatmap'], queryFn: statsApi.heatmap });
}

export function useCalendar(year: number, month: number) {
  return useQuery({
    queryKey: ['stats', 'calendar', year, month],
    queryFn: () => statsApi.calendar(year, month),
  });
}
