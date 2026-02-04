import { google } from 'googleapis';

export function createOAuth2Client() {
  // Use 'postmessage' for popup-based OAuth flow (frontend uses @react-oauth/google with flow: 'auth-code')
  // The redirect_uri must match what the frontend sends to Google
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    'postmessage'
  );
}

export const SCOPES = [
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile',
];
