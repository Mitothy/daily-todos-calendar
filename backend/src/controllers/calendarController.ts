import { Request, Response } from 'express';
import { getMonthEvents } from '../services/googleCalendarService.js';
import { getColorId, HEX_COLORS } from '../utils/colorMapper.js';

export async function getMonthData(req: Request, res: Response) {
  try {
    const year = parseInt(req.params.year);
    const month = parseInt(req.params.month);

    if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
      return res.status(400).json({ error: 'Invalid year or month' });
    }

    const data = await getMonthEvents(req.auth!, year, month);
    res.json(data);
  } catch (error: any) {
    console.error('Get month data error:', error.message);
    res.status(500).json({ error: 'Failed to get month data' });
  }
}

export function getColors(_req: Request, res: Response) {
  const colorMap: Record<number, string> = {};
  for (let i = 0; i <= 6; i++) {
    colorMap[i] = getColorId(i);
  }
  res.json({ colorMap, hexColors: HEX_COLORS });
}
