import { Request, Response, NextFunction } from 'express';
import { createOAuth2Client } from '../config/googleAuth.js';

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session.refreshToken) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    const oauth2Client = createOAuth2Client();
    oauth2Client.setCredentials({
      refresh_token: req.session.refreshToken,
    });

    req.auth = oauth2Client;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid session' });
  }
}
