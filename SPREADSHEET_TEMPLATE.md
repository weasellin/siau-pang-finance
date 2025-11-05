# Google Spreadsheet Template

This document provides a template for setting up your Google Spreadsheet for the Siau-Pang Finance Tracker.

## Required Column Structure

Your spreadsheet **must** have these columns in **this exact order**:

| Column | Name        | Description                                    | Example       |
|--------|-------------|------------------------------------------------|---------------|
| A      | Date        | Transaction date (YYYY-MM-DD format)           | 2024-10-01    |
| B      | Description | Transaction description                        | Grocery Store |
| C      | Debit       | Amount spent (expenses) - leave blank for income | 45.67         |
| D      | Credit      | Amount received (income) - leave blank for expenses | 5000.00       |
| E      | Balance     | Running balance after this transaction         | 4954.33       |
| F      | Category    | Category name (use colon for subcategories)    | Food:Groceries|

## Sample Data

Here's sample data you can use to test the application:

```
Date        | Description           | Debit   | Credit  | Balance  | Category
2024-10-01  | Monthly Salary        |         | 5000.00 | 5000.00  | Income:Salary
2024-10-02  | Grocery Store         | 45.67   |         | 4954.33  | Food:Groceries
2024-10-03  | Coffee Shop           | 12.50   |         | 4941.83  | Food:Coffee
2024-10-04  | Rent Payment          | 850.00  |         | 4091.83  | Housing:Rent
2024-10-05  | Electric Bill         | 75.30   |         | 4016.53  | Utilities:Electric
2024-10-06  | Gas Station           | 45.00   |         | 3971.53  | Transportation:Fuel
2024-10-07  | Restaurant Dinner     | 67.89   |         | 3903.64  | Food:Dining Out
2024-10-08  | Freelance Project     |         | 1500.00 | 5403.64  | Income:Freelance
2024-10-09  | Internet Bill         | 59.99   |         | 5343.65  | Utilities:Internet
2024-10-10  | Gym Membership        | 35.00   |         | 5308.65  | Health:Fitness
2024-10-11  | Grocery Store         | 52.43   |         | 5256.22  | Food:Groceries
2024-10-12  | Movie Tickets         | 28.00   |         | 5228.22  | Entertainment:Movies
2024-10-13  | Online Shopping       | 89.99   |         | 5138.23  | Shopping:Clothing
2024-10-14  | Gas Station           | 42.00   |         | 5096.23  | Transportation:Fuel
2024-10-15  | Phone Bill            | 65.00   |         | 5031.23  | Utilities:Phone
```

## Setting Up Your Spreadsheet

1. **Create a new Google Spreadsheet**
   - Go to [Google Sheets](https://sheets.google.com)
   - Click "Blank" to create a new spreadsheet
   - Name it something like "Personal Finance 2024"

2. **Add column headers in Row 1**
   - A1: Date
   - B1: Description
   - C1: Debit
   - D1: Credit
   - E1: Balance
   - F1: Category

3. **Format the columns (optional but recommended)**
   - Select column A: Format > Number > Date
   - Select columns C, D, E: Format > Number > Currency
   - Select column F: Format > Text

4. **Add your data starting from Row 2**
   - Enter your transactions row by row
   - Leave Debit blank for income transactions
   - Leave Credit blank for expense transactions
   - Calculate Balance as: Previous Balance - Debit + Credit

## Category Suggestions

Use consistent category names for better visualization. Here are some suggestions:

### Income Categories
- Income:Salary
- Income:Freelance
- Income:Investment
- Income:Bonus
- Income:Gift
- Income:Refund
- Income:Other

### Expense Categories

**Housing**
- Housing:Rent
- Housing:Mortgage
- Housing:Property Tax
- Housing:Home Insurance
- Housing:Maintenance

**Utilities**
- Utilities:Electric
- Utilities:Water
- Utilities:Gas
- Utilities:Internet
- Utilities:Phone

**Food**
- Food:Groceries
- Food:Dining Out
- Food:Coffee
- Food:Fast Food
- Food:Delivery

**Transportation**
- Transportation:Fuel
- Transportation:Public Transit
- Transportation:Parking
- Transportation:Car Maintenance
- Transportation:Car Insurance
- Transportation:Ride Share

**Health**
- Health:Insurance
- Health:Doctor
- Health:Pharmacy
- Health:Fitness
- Health:Dental

**Entertainment**
- Entertainment:Movies
- Entertainment:Streaming Services
- Entertainment:Games
- Entertainment:Hobbies
- Entertainment:Events

**Shopping**
- Shopping:Clothing
- Shopping:Electronics
- Shopping:Home Goods
- Shopping:Personal Care
- Shopping:Gifts

**Financial**
- Financial:Bank Fees
- Financial:Credit Card Payment
- Financial:Savings
- Financial:Investment
- Financial:Insurance

**Other**
- Other:Uncategorized

## Tips for Managing Your Spreadsheet

1. **Consistent Date Format**: Always use YYYY-MM-DD format (e.g., 2024-10-15)

2. **One entry per cell**: Don't put multiple values in one cell

3. **Keep it simple**: Don't merge cells or use complex formatting

4. **Regular updates**: Update your spreadsheet regularly to keep data current

5. **Backup**: Google Sheets auto-saves, but consider downloading backups periodically

6. **Use formulas for balance**: You can use a formula in column E:
   ```
   =E2-C3+D3  (for row 3, where E2 is the previous balance)
   ```

7. **Protect your data**: Set appropriate sharing permissions on your spreadsheet

8. **Multiple sheets**: You can have multiple sheets in one spreadsheet (e.g., one per year)
   - Just update the range in app.js to point to the correct sheet

## Advanced: Using Google Sheets Formulas

You can make your spreadsheet smarter with formulas:

### Auto-calculate Balance
In cell E3 (assuming row 2 is your first transaction):
```
=E2-C3+D3
```
Then drag this formula down for all rows.

### Conditional Formatting
Highlight expenses over a certain amount:
1. Select your Debit column
2. Format > Conditional formatting
3. Format cells if > [your threshold]
4. Choose a background color

### Data Validation for Categories
Create a dropdown for categories:
1. Create a list of categories in a separate sheet
2. Select your Category column
3. Data > Data validation
4. Criteria: List from a range
5. Select your category list

## Getting Your Spreadsheet ID

After creating your spreadsheet:

1. Look at the URL in your browser
2. It will look like: `https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit`
3. Copy the `SPREADSHEET_ID` part (the long string between `/d/` and `/edit`)
4. This is what you'll enter in the application

## Sharing Your Spreadsheet

The spreadsheet doesn't need to be publicly shared. The application uses OAuth to access it with your permission. Just make sure:

1. You own the spreadsheet, or
2. You have edit access to it

The application will only **read** the data (not modify it).

## Need Help?

If your data isn't loading correctly:
1. Check that row 1 contains headers
2. Verify data starts from row 2
3. Ensure columns are in the correct order
4. Make sure dates are in YYYY-MM-DD format
5. Verify numeric values don't have extra characters (like $ or ,)
6. Check that the sheet name is "Sheet1" (or update app.js accordingly)
