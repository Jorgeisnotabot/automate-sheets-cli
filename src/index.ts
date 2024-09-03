#!/usr/bin/env node

import { Command } from 'commander';
import { google } from 'googleapis'
import { JWT } from 'google-auth-library';

const program = new Command();

program
    .command('create')
    .description('Create a new Google Sheet')
    .option('-n, --name <name>', 'Name of the Google Sheet')
    .action(async (options) => {
        const auth = new JWT({
            email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
            key: process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replaceAll(/\\n/g, '\n'),
            scopes: [
                    'https://www.googleapis.com/auth/drive',
                    'https://www.googleapis.com/auth/drive.file',
                    'https://www.googleapis.com/auth/spreadsheets',
                  ],
          });
        const sheets = google.sheets({ version: 'v4', auth });

        const response = await sheets.spreadsheets.create({
            requestBody: {
                properties: {
                    title: options.name
                }
            }
        });

        console.log(`Created new Google Sheet: ${response.data.spreadsheetUrl}`);
    });

program.parse(process.argv);