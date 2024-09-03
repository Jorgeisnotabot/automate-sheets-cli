#!/usr/bin/env node

import { Command } from 'commander';
import { google } from 'googleapis'
import { JWT } from 'google-auth-library';
import { GOOGLE_SHEETS_CLIENT_EMAIL, GOOGLE_SHEETS_PRIVATE_KEY } from './config';

const program = new Command();

program
    .command('create')
    .description('Create a new Google Sheet')
    .option('-n, --name <name>', 'Name of the Google Sheet')
    .action(async (options) => {
        const auth = new JWT({
            email: GOOGLE_SHEETS_CLIENT_EMAIL,
            key: GOOGLE_SHEETS_PRIVATE_KEY?.replaceAll(/\\n/g, '\n'),
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


    program 
        .command('transfer')
        .description('Transfer ownership of a Google Sheet')
        .option('-f, --file <file>', 'ID of the Google Sheet')
        .option('-e, --email <email>', 'Email of the new owner')
        .action(async (options) => {
            const auth = new JWT({
                email: GOOGLE_SHEETS_CLIENT_EMAIL,
                key: GOOGLE_SHEETS_PRIVATE_KEY?.replaceAll(/\\n/g, '\n'),
                scopes: [
                    'https://www.googleapis.com/auth/drive',
                    'https://www.googleapis.com/auth/drive.file', 
                    'https://www.googleapis.com/auth/spreadsheets',
                  ],
          });

          const drive = google.drive({ version: 'v3', auth });

          try {
            await drive.permissions.create({
              fileId: options.file,
              requestBody: {
                role: 'owner',
                type: 'user',
                emailAddress: options.email,
              },
              transferOwnership: true,
            });
            console.log(`Transferred ownership of Google Sheet to: ${options.email}`);

          } catch (error) {
            console.error('Error transferring ownership:', error);
          }
          
      });

        program
  .command('delete-sheets')
  .description('Delete all Google Sheets created by the service account')
  .action(async () => {

    const auth = new JWT({
        email: GOOGLE_SHEETS_CLIENT_EMAIL,
        key: GOOGLE_SHEETS_PRIVATE_KEY?.replaceAll(/\\n/g, '\n'),
        scopes: [
            'https://www.googleapis.com/auth/drive',
            'https://www.googleapis.com/auth/drive.file', 
            'https://www.googleapis.com/auth/spreadsheets',
          ],
  });

  const drive = google.drive({ version: 'v3', auth });

    try {
      const res = await drive.files.list({
        q: `'${GOOGLE_SHEETS_CLIENT_EMAIL}' in owners and mimeType='application/vnd.google-apps.spreadsheet'`,
        fields: 'files(id, name)',
      });

      const files = res.data.files;
      if (!files || files.length === 0) {
        console.log('No Google Sheets found.');
        return;
      }

      for (const file of files) {
        if (file.id) {
          await drive.files.delete({ fileId: file.id });
          console.log(`Deleted Google Sheet: ${file.name} (ID: ${file.id})`);
        } else {
          console.warn(`Skipping file with missing ID: ${file.name}`);
        }
      }
    } catch (error) {
      console.error('Error deleting Google Sheets:', error);
    }
  });

                    

program.parse(process.argv);