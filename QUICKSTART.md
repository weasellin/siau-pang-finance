# Quick Start Guide

Get your Siau-Pang Finance Tracker up and running in minutes!

## What You'll Need

- ✅ A Google account
- ✅ A Google Spreadsheet with your financial data
- ✅ 10-15 minutes to set up

## Quick Setup (4 Steps)

### Step 1: Set Up Google Cloud (5 minutes)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable "Google Sheets API"
4. Create credentials:
   - API Key
   - OAuth 2.0 Client ID (Web application type)
5. Add authorized origin: `http://localhost:8000`

📖 **Detailed instructions**: See [SETUP.md](SETUP.md)

### Step 2: Configure Your Credentials (1 minute)

1. Open `app.js`
2. Replace these lines with your credentials:
   ```javascript
   const CLIENT_ID = 'YOUR_CLIENT_ID.apps.googleusercontent.com';
   const API_KEY = 'YOUR_API_KEY';
   ```

### Step 3: Prepare Your Spreadsheet (5 minutes)

Create a Google Spreadsheet with these columns:

| Date       | Description    | Debit  | Credit  | Balance  | Category       |
|------------|----------------|--------|---------|----------|----------------|
| 2024-10-01 | Monthly Salary |        | 5000.00 | 5000.00  | Income:Salary  |
| 2024-10-02 | Grocery Store  | 45.67  |         | 4954.33  | Food:Groceries |

📖 **Template & examples**: See [SPREADSHEET_TEMPLATE.md](SPREADSHEET_TEMPLATE.md)

### Step 4: Run the Application (1 minute)

```bash
# Navigate to project directory
cd siàu-pâng-light

# Start a local web server
python3 -m http.server 8000

# Open in browser
# http://localhost:8000
```

Then:
1. Click "Sign in with Google"
2. Authorize the application
3. Enter your Spreadsheet ID
4. Click "Load Data"
5. 🎉 View your financial dashboard!

## What You'll See

### Dashboard Features

- **📊 Summary Statistics**
  - Total Income
  - Total Expenses
  - Current Balance
  - Net Income

- **📈 Visualizations**
  - Spending by Category (Pie Chart)
  - Balance Trend (Line Chart)

- **📋 Transaction List**
  - Sortable columns
  - Search and filter
  - Category filtering
  - Date range filtering

## Common Issues

### "API not enabled" error
Wait a few minutes after enabling the Google Sheets API, then try again.

### "403 Access denied" error
Make sure your OAuth consent screen includes your email as a test user.

### Can't load data
1. Check your Spreadsheet ID is correct
2. Verify sheet name is "Sheet1" (or update app.js)
3. Ensure data starts from Row 2 (Row 1 = headers)

### CORS errors
You must run through a web server, not open the file directly!

## Architecture

This is a **completely client-side application**:

- ✅ No backend server needed
- ✅ No database to set up
- ✅ No npm packages to install
- ✅ Just HTML + JavaScript + CSS
- ✅ Data stays in your Google Spreadsheet

## Features

### Current Features
- ✅ Google OAuth authentication
- ✅ Real-time data sync from Google Sheets
- ✅ Summary statistics dashboard
- ✅ Interactive charts (Category breakdown, Balance trend)
- ✅ Sortable and filterable transaction list
- ✅ Search functionality
- ✅ Responsive design (mobile-friendly)
- ✅ Local storage of Spreadsheet ID

### Limitations
- 📖 Read-only view (edit in Google Sheets)
- 📖 Requires Google account
- 📖 Needs internet connection to load data

## Next Steps

### Customize the App

1. **Change the sheet name**: Edit `app.js` line 62
   ```javascript
   range: 'YourSheetName!A2:F',
   ```

2. **Adjust date range for balance chart**: Edit `app.js` line 173
   ```javascript
   const recentTransactions = [...transactions].reverse().slice(-60); // Show last 60 transactions
   ```

3. **Change currency format**: Edit `app.js` line 310
   ```javascript
   currency: 'TWD' // or 'EUR', 'GBP', etc.
   ```

### Add More Features

Want to extend the application? Ideas:
- Budget tracking visualization
- Month-over-month comparisons
- Export to PDF reports
- Multiple spreadsheet support
- Dark mode theme
- Custom date ranges

## Deploy to Production

Want to share this with others or access it online?

1. **Host on GitHub Pages** (Free!)
   ```bash
   # Push to GitHub
   git init
   git add .
   git commit -m "Initial commit"
   git push

   # Enable GitHub Pages in repository settings
   ```

2. **Update OAuth origins**
   - Add your GitHub Pages URL to authorized origins
   - Example: `https://yourusername.github.io`

3. **Share the link!**

## Security Reminders

⚠️ **Important Security Notes:**

- Keep your API Key and Client ID private
- Don't commit credentials to public repositories
- Only add trusted test users to OAuth consent screen
- Use API restrictions in Google Cloud Console
- Your financial data stays in your Google account

## Need Help?

- 📖 Full setup instructions: [SETUP.md](SETUP.md)
- 📊 Spreadsheet template: [SPREADSHEET_TEMPLATE.md](SPREADSHEET_TEMPLATE.md)
- 📋 Product requirements: [PRD.md](PRD.md)
- 📚 Project overview: [README.md](README.md)

## Troubleshooting

Still stuck? Check:

1. ✅ Google Sheets API is enabled
2. ✅ OAuth consent screen is configured
3. ✅ Test users are added
4. ✅ Credentials are correct in app.js
5. ✅ Spreadsheet has correct column structure
6. ✅ Running through a web server (not file://)
7. ✅ Browser console for error messages

---

**Happy tracking!** 💰📊✨
