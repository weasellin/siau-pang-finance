# Setup Guide for Siau-Pang Finance Tracker

This guide will help you set up the Google Sheets API credentials needed to run the application.

## Prerequisites

- A Google account
- A Google Spreadsheet with your financial data

## Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click on "Select a project" dropdown at the top
3. Click "New Project"
4. Enter a project name (e.g., "Siau-Pang Finance Tracker")
5. Click "Create"

## Step 2: Enable Google Sheets API

1. In the Google Cloud Console, make sure your project is selected
2. Navigate to "APIs & Services" > "Library" (from the left sidebar menu)
3. Search for "Google Sheets API"
4. Click on "Google Sheets API"
5. Click "Enable"

## Step 3: Create API Key

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "API key"
3. Copy the API key that appears
4. (Optional but recommended) Click "Restrict Key" to limit it to Google Sheets API only
5. Save the API key - you'll need it later

## Step 4: Configure OAuth Consent Screen (IMPORTANT!)

1. Go to "APIs & Services" > "OAuth consent screen"
2. If not already configured:
   - Choose "External" user type
   - Click "Create"

3. Fill in the App information page:
   - **App name**: "Siau-Pang Finance Tracker"
   - **User support email**: Select your email from dropdown
   - **App logo**: (Optional, skip for now)
   - **Application home page**: (Optional, can leave blank)
   - **Authorized domains**: (Optional for testing)
   - **Developer contact information**: Your email address
   - Click "Save and Continue"

4. **Scopes page** (Step 2 of 4):
   - Click "Add or Remove Scopes"
   - Search for "Google Sheets API"
   - Select: `.../auth/spreadsheets.readonly` (Read-only access to Google Sheets)
   - Click "Update"
   - Click "Save and Continue"

5. **Test users page** (Step 3 of 4) - **THIS IS CRITICAL!**
   - Click "Add Users"
   - Enter your Google email address (the one you'll sign in with)
   - Click "Add"
   - **IMPORTANT**: You can add up to 100 test users while in testing mode
   - Click "Save and Continue"

6. **Summary page** (Step 4 of 4):
   - Review your settings
   - Click "Back to Dashboard"

## Step 5: Create OAuth 2.0 Client ID

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. Configure the client:
   - **Application type**: "Web application"
   - **Name**: "Finance Tracker Web Client"
   - **Authorized JavaScript origins**:
     - Click "Add URI"
     - Add: `http://localhost:8000`
     - Click "Add URI" again
     - Add: `http://127.0.0.1:8000`
     - (Add your production domain later if needed)
   - **Authorized redirect URIs**: Leave empty (not needed for this app)
   - Click "Create"

4. **Save your credentials**:
   - A popup will show your Client ID and Client Secret
   - Copy the **Client ID** (you'll need this)
   - You can ignore the Client Secret for this app
   - Click "OK"

## Step 6: Configure the Application

1. Open `app.js` in your project
2. Find these lines near the top:
   ```javascript
   const CLIENT_ID = 'YOUR_CLIENT_ID.apps.googleusercontent.com';
   const API_KEY = 'YOUR_API_KEY';
   ```
3. Replace `YOUR_CLIENT_ID.apps.googleusercontent.com` with your OAuth 2.0 Client ID
4. Replace `YOUR_API_KEY` with your API Key

## Step 7: Prepare Your Google Spreadsheet

1. Create a new Google Spreadsheet (or use an existing one)
2. Make sure the first sheet is named "Sheet1" (or update the range in app.js)
3. Set up your columns in Row 1:
   - Column A: Date
   - Column B: Description
   - Column C: Debit
   - Column D: Credit
   - Column E: Balance
   - Column F: Category

4. Add your transaction data starting from Row 2

Example:
```
| A          | B              | C      | D       | E       | F              |
|------------|----------------|--------|---------|---------|----------------|
| Date       | Description    | Debit  | Credit  | Balance | Category       |
| 2024-10-01 | Monthly Salary |        | 5000.00 | 5000.00 | Income:Salary  |
| 2024-10-02 | Grocery Store  | 45.67  |         | 4954.33 | Food:Groceries |
| 2024-10-03 | Coffee Shop    | 12.50  |         | 4941.83 | Food:Coffee    |
```

5. Get your Spreadsheet ID from the URL:
   - Your spreadsheet URL looks like: `https://docs.google.com/spreadsheets/d/1ABC...XYZ/edit`
   - The ID is the part between `/d/` and `/edit`: `1ABC...XYZ`

## Step 8: Run the Application Locally

Since this is a client-side application that uses Google APIs, you need to serve it through a web server (not just open the HTML file directly).

### Option 1: Using Python

If you have Python installed:

```bash
# Python 3
cd siàu-pâng-light
python3 -m http.server 8000
```

Then open your browser to: http://localhost:8000

### Option 2: Using Node.js

If you have Node.js installed:

```bash
# Install http-server globally
npm install -g http-server

# Run the server
cd siàu-pâng-light
http-server -p 8000
```

Then open your browser to: http://localhost:8000

### Option 3: Using VS Code Live Server

1. Install the "Live Server" extension in VS Code
2. Right-click on `index.html`
3. Select "Open with Live Server"

## Step 9: Use the Application

1. Open the application in your browser
2. Click "Sign in with Google"
3. Authorize the application to access your Google Sheets
4. Enter your Spreadsheet ID
5. Click "Load Data"
6. View your financial dashboard!

## Troubleshooting

### "Access blocked: Siau-Pang Finance Tracker has not completed the Google verification process"

**This is the most common error!** Your app is in Testing mode and you need to add yourself as a test user.

**Solution:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Go to "APIs & Services" > "OAuth consent screen"
4. Scroll down to "Test users" section
5. Click "Add Users"
6. Enter your Google email address (the exact one you're trying to sign in with)
7. Click "Add"
8. Try signing in again

**Note:** While your app is in Testing mode, only test users you explicitly add can access it. This is normal for development!

### Publishing Your App (Optional - For Sharing with Others)

If you want others to use your app without adding them as test users:

1. Complete the OAuth consent screen with all required information
2. Add privacy policy and terms of service URLs (can be simple pages)
3. Submit for verification (takes a few weeks)
4. **OR** keep it in Testing mode and just add users as needed (up to 100 test users)

For personal use, staying in Testing mode is perfectly fine!

### "403 Access Not Configured" Error
- Make sure you enabled the Google Sheets API in your Google Cloud project
- Wait a few minutes for the API to be fully enabled
- Go to "APIs & Services" > "Library" and search for "Google Sheets API"
- Make sure it shows "API enabled"

### "401 Unauthorized" Error
- Check that your API Key and Client ID are correctly configured in app.js
- Make sure your OAuth consent screen is properly configured
- Verify that your current URL is listed in "Authorized JavaScript origins"
- Check that you're using the correct Client ID (not the Client Secret)

### "No data found in spreadsheet"
- Check that your spreadsheet has data starting from Row 2
- Verify the sheet name is "Sheet1" (or update the range in app.js)
- Make sure the columns are in the correct order: Date, Description, Debit, Credit, Balance, Category
- Check that there's no extra spaces in cell data

### CORS or Origin Errors
- You must run the app through a web server (not open the file directly with `file://`)
- Make sure the URL you're using is listed in "Authorized JavaScript origins"
- If using `localhost:8000`, make sure both `http://localhost:8000` and `http://127.0.0.1:8000` are added
- Clear your browser cache and try again

### "idpiframe_initialization_failed" Error
- This usually means cookies are blocked
- Check your browser settings and enable third-party cookies for Google
- Or try in an incognito/private window

## Security Notes

- Keep your API Key and Client ID secure
- Don't commit them to public repositories
- Consider using environment variables for production deployments
- The API key should be restricted to Google Sheets API only
- Only add trusted test users to your OAuth consent screen

## Deploying to Production

To deploy this application:

1. Add your production domain to "Authorized JavaScript origins" in Google Cloud Console
2. Update the OAuth consent screen with your production domain
3. Host the files on any static web hosting service (GitHub Pages, Netlify, Vercel, etc.)
4. Make sure to serve the files over HTTPS

## Need Help?

- [Google Sheets API Documentation](https://developers.google.com/sheets/api)
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Chart.js Documentation](https://www.chartjs.org/docs/latest/)
