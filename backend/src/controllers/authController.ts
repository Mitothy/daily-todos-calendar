import { Request, Response } from 'express';
import { google } from 'googleapis';
import { createOAuth2Client } from '../config/googleAuth.js';

export async function googleAuth(req: Request, res: Response) {
  try {
    const { code } = req.body;
    if (!code) {
      return res.status(400).json({ error: 'Authorization code is required' });
    }

    // Debug: log what we're sending to Google
    console.log('DEBUG - GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID);
    console.log('DEBUG - GOOGLE_REDIRECT_URI:', process.env.GOOGLE_REDIRECT_URI);

    const oauth2Client = createOAuth2Client();
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Get user info
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const userInfo = await oauth2.userinfo.get();

    // Store refresh token in session
    req.session.refreshToken = tokens.refresh_token || undefined;
    req.session.user = {
      email: userInfo.data.email || '',
      name: userInfo.data.name || '',
      picture: userInfo.data.picture || '',
    };
    req.session.userId = userInfo.data.id || '';

    res.json({
      accessToken: tokens.access_token,
      user: req.session.user,
    });
  } catch (error: any) {
    console.error('Auth error:', error.message);
    res.status(401).json({ error: 'Authentication failed' });
  }
}

export async function refreshToken(req: Request, res: Response) {
  try {
    if (!req.session.refreshToken) {
      return res.status(401).json({ error: 'No refresh token' });
    }

    const oauth2Client = createOAuth2Client();
    oauth2Client.setCredentials({
      refresh_token: req.session.refreshToken,
    });

    const { credentials } = await oauth2Client.refreshAccessToken();

    res.json({ accessToken: credentials.access_token });
  } catch (error: any) {
    console.error('Refresh error:', error.message);
    res.status(401).json({ error: 'Token refresh failed' });
  }
}

export function authStatus(req: Request, res: Response) {
  if (req.session.refreshToken && req.session.user) {
    return res.json({ authenticated: true, user: req.session.user });
  }
  res.json({ authenticated: false });
}

export function logout(req: Request, res: Response) {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Logout failed' });
    }
    res.clearCookie('dailyTasks.sid');
    res.json({ message: 'Logged out successfully' });
  });
}
