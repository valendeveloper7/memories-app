import type { Request, Response } from 'express';
import { getCalendar, getHeatmap, getOverview } from './stats.service.js';

export async function overview(req: Request, res: Response): Promise<void> {
  res.json(await getOverview(req.spaceId!));
}

export async function heatmap(req: Request, res: Response): Promise<void> {
  res.json(await getHeatmap(req.spaceId!));
}

export async function calendar(req: Request, res: Response): Promise<void> {
  const year = Number(req.params.year);
  const month = Number(req.params.month);
  res.json(await getCalendar(req.spaceId!, year, month));
}
