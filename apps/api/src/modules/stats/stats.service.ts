import { Types } from 'mongoose';
import type { CalendarDay, HeatmapCell, StatsOverview } from 'shared';
import { AlbumModel } from '../albums/album.model.js';
import { MemoryModel } from '../memories/memory.model.js';
import { SpaceModel } from '../spaces/space.model.js';

const DAY_MS = 24 * 60 * 60 * 1000;

/** Resumen de estadísticas del Space. */
export async function getOverview(spaceId: string): Promise<StatsOverview> {
  const match = { spaceId: new Types.ObjectId(spaceId) };

  const [counts] = await MemoryModel.aggregate<{ total: number; photos: number; videos: number }>([
    { $match: match },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        photos: { $sum: { $cond: [{ $eq: ['$type', 'photo'] }, 1, 0] } },
        videos: { $sum: { $cond: [{ $eq: ['$type', 'video'] }, 1, 0] } },
      },
    },
  ]);

  const [albums, years, busiest, favMonth, topLoc, space] = await Promise.all([
    AlbumModel.countDocuments({ spaceId }),
    MemoryModel.distinct('actualDate', match).then(
      (dates) => new Set(dates.map((d: Date) => d.getFullYear())).size,
    ),
    MemoryModel.aggregate([
      { $match: match },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$actualDate' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 1 },
    ]),
    MemoryModel.aggregate([
      { $match: match },
      { $group: { _id: { $month: '$actualDate' }, count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 1 },
    ]),
    MemoryModel.aggregate([
      { $match: { ...match, 'location.name': { $exists: true } } },
      { $group: { _id: '$location.name', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 1 },
    ]),
    SpaceModel.findById(spaceId).select('anniversaryDate'),
  ]);

  return {
    totalMemories: counts?.total ?? 0,
    photos: counts?.photos ?? 0,
    videos: counts?.videos ?? 0,
    albums,
    yearsRegistered: years,
    daysTogether: space?.anniversaryDate
      ? Math.floor((Date.now() - space.anniversaryDate.getTime()) / DAY_MS)
      : undefined,
    topLocation: topLoc[0]?._id,
    busiestDay: busiest[0] ? { date: busiest[0]._id, count: busiest[0].count } : undefined,
    favoriteMonth: favMonth[0] ? { month: favMonth[0]._id, count: favMonth[0].count } : undefined,
  };
}

/** Mapa de calor: recuento de recuerdos por día en el último año. */
export async function getHeatmap(spaceId: string): Promise<HeatmapCell[]> {
  const since = new Date(Date.now() - 365 * DAY_MS);
  const rows = await MemoryModel.aggregate<{ _id: string; count: number }>([
    { $match: { spaceId: new Types.ObjectId(spaceId), actualDate: { $gte: since } } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$actualDate' } },
        count: { $sum: 1 },
      },
    },
  ]);
  return rows.map((r) => ({ date: r._id, count: r.count }));
}

/** Días con recuerdos de un mes concreto, con miniatura representativa. */
export async function getCalendar(
  spaceId: string,
  year: number,
  month: number,
): Promise<CalendarDay[]> {
  const from = new Date(year, month - 1, 1);
  const to = new Date(year, month, 1);

  const rows = await MemoryModel.aggregate<{
    _id: string;
    count: number;
    thumbnailUrl?: string;
    mediaUrl?: string;
  }>([
    { $match: { spaceId: new Types.ObjectId(spaceId), actualDate: { $gte: from, $lt: to } } },
    { $sort: { actualDate: 1 } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$actualDate' } },
        count: { $sum: 1 },
        thumbnailUrl: { $first: '$thumbnailUrl' },
        mediaUrl: { $first: '$mediaUrl' },
      },
    },
  ]);

  return rows.map((r) => ({
    date: r._id,
    count: r.count,
    thumbnailUrl: r.thumbnailUrl ?? r.mediaUrl,
  }));
}
