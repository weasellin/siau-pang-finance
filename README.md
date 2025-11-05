# Siau-Pang Finance Tracker

A lightweight web-based personal finance visualization dashboard that uses Google Spreadsheet as the data source.

## Features

- **Google Sheets Integration**: Connect directly to your Google Spreadsheet containing transaction data
- **Visual Dashboard**: Beautiful charts and graphs showing your financial overview
- **No Backend Required**: Pure client-side application with no server or database to manage
- **Simple Data Management**: Edit categories and transactions directly in your Google Spreadsheet
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Zero Infrastructure**: No installation, no database, no complexity

## Architecture Overview

This application follows an ultra-simplified architecture:

🎯 **Data Source**: Google Spreadsheet (your single source of truth)
📊 **Application**: Client-side only visualization dashboard
🔒 **Authentication**: Google OAuth for secure access
✏️ **Data Management**: All editing happens in Google Spreadsheet
📈 **Visualization**: Charts, graphs, and financial insights

### Benefits of This Approach

- ✅ No backend server to maintain
- ✅ No database setup or migrations
- ✅ No complex data synchronization
- ✅ Full control of your data in Google Sheets
- ✅ Easy to backup and share
- ✅ Can use Google Sheets' powerful features (formulas, pivot tables, etc.)

## Tech Stack

- **Frontend**: HTML/JavaScript (Vanilla or React)
- **Styling**: Tailwind CSS or simple CSS
- **Charts**: Chart.js or Recharts for data visualization
- **Google Sheets API**: For reading data from Google Spreadsheet
- **Backend**: None (client-side only)
- **Database**: None (Google Spreadsheet serves as database)

## Getting Started

### Prerequisites

- A Google account
- A Google Spreadsheet with your transaction data

### Setting Up Your Google Spreadsheet

1. **Create a Google Spreadsheet** with the following columns:
   - **Date** (required): Transaction date (e.g., 2024-10-01)
   - **Description** (required): Transaction description
   - **Debit** (required): Amount spent (expenses) - leave empty for income
   - **Credit** (required): Amount received (income) - leave empty for expenses
   - **Balance** (required): Running balance after transaction
   - **Category** (required): Category name (e.g., Food, Salary, Transportation)

2. **Example Spreadsheet Format**:

   | Date       | Description    | Debit  | Credit  | Balance  | Category       |
   |------------|----------------|--------|---------|----------|----------------|
   | 2024-10-01 | Monthly Salary |        | 5000.00 | 5000.00  | Income:Salary  |
   | 2024-10-02 | Grocery Store  | 45.67  |         | 4954.33  | Food:Groceries |
   | 2024-10-03 | Coffee Shop    | 12.50  |         | 4941.83  | Food:Coffee    |
   | 2024-10-04 | Rent Payment   | 850.00 |         | 4091.83  | Housing:Rent   |

3. **Get the Spreadsheet ID**:
   - Open your Google Spreadsheet
   - Copy the ID from the URL: `https://docs.google.com/spreadsheets/d/{SPREADSHEET_ID}/edit`

### Installation & Usage

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd siàu-pâng-light
   ```

2. **Open the application**
   - Simply open `index.html` in your web browser (for single-file version)
   - Or follow development setup instructions if using React

3. **Connect to Google Sheets**
   - Click "Connect to Google Sheets"
   - Authorize the application to access your spreadsheet
   - Enter your Spreadsheet ID
   - View your financial dashboard!

## Project Structure

```
├── index.html            # Main application file (single-file version)
├── src/                  # Source files (if using modular approach)
│   ├── js/              # JavaScript modules
│   ├── css/             # Stylesheets
│   └── components/      # UI components
├── PRD.md               # Product Requirements Document
└── README.md            # This file
```

## Features Overview

### Dashboard
- Financial overview with total income, total expenses, and net income
- Pie chart showing expense breakdown by category
- Bar chart displaying spending by category
- Current balance display
- Time period filters

### Transactions View
- Complete list of all transactions from your Google Spreadsheet
- Sortable columns (date, amount, category)
- Filter by category, date range
- Color-coded categories for easy identification
- Read-only view (edit directly in Google Sheets)

### Visualization
- Category spending analysis
- Monthly/weekly spending trends
- Income vs expense comparison
- Balance trend over time

## Future Enhancements

The application is designed to be extensible. Future phases may include:

- Advanced filters and search
- Budget visualization (if budget data added to spreadsheet)
- Month-over-month and year-over-year comparisons
- Export to PDF reports
- Multiple spreadsheet support (switch between personal/business)
- Offline mode with local caching
- Mobile application
- Shared read-only dashboards

## Contributing

This is a personal finance application. Feel free to fork and modify for your own use.

## License

MIT License
