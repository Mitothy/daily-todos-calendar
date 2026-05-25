import 'express-session';
import { OAuth2Client } from 'google-auth-library';

declare module 'express-session' {
  interface SessionData {
    userId: string;
    refreshToken: string;
    accessToken: string;
    user: {
      email: string;
      name: string;
      picture: string;
    };
  }
}

declare global {
  namespace Express {
    interface Request {
      auth?: OAuth2Client;
      accessToken?: string;
    }
  }
}

export {};
