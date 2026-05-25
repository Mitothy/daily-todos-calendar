import session from 'express-session';

const isProduction = process.env.NODE_ENV === 'production';

export function createSessionConfig() {
  return session({
    secret: process.env.SESSION_SECRET || 'dev-secret-change-me',
    resave: false,
    saveUninitialized: false,
    name: 'dailyTasks.sid',
    cookie: {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    },
  });
}
