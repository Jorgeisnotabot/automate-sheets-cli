import { config } from 'dotenv';
config();

export const { GOOGLE_SHEETS_CLIENT_EMAIL, GOOGLE_SHEETS_PRIVATE_KEY } = process.env;