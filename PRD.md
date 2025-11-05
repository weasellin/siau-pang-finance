# **Product Requirements Document: Siau-Pang Finance Tracker**

## **1\. Introduction**

### **1.1 Purpose**

This document outlines the requirements for a web-based personal finance visualization application. The primary goal is to provide users with an intuitive interface to visualize and analyze their income and expenses, using Google Spreadsheet as the single source of truth for all transaction data and categorization.

### **1.2 Scope**

This PRD covers the core functionalities required for a Minimum Viable Product (MVP), focusing on data visualization and financial insights. All data management, editing, and categorization is handled directly in Google Spreadsheet, significantly simplifying the application architecture.

### **1.3 Vision**

To empower individuals with clear and comprehensive visualization of their financial habits through an easy-to-use, lightweight financial dashboard that leverages Google Spreadsheet as the data source.

## **2\. Goals & Objectives**

* **Financial Visibility:** Enable users to easily visualize their income and expenditures from Google Spreadsheet data.
* **Spending Awareness:** Provide visual tools for users to understand where their money is going through charts and graphs.
* **Simplicity:** Eliminate the need for backend database, user authentication, and complex data management.
* **Ease of Use:** Offer a clean, intuitive, and user-friendly interface focused purely on visualization.
* **Data Management:** Leverage Google Spreadsheet for all data entry, editing, categorization, and persistence.

## **3\. Key Features**

### **3.1 User Authentication & Security**

* \[ \] **Google Authentication:** Users authenticate via Google OAuth to access their Google Spreadsheet data.
* \[ \] **No Data Storage:** Application does not store any financial data locally or on a backend server.

### **3.2 Data Source Management**

* \[ \] **Google Spreadsheet Integration:** Connect to user's Google Spreadsheet containing transaction data.
* \[ \] **Expected Spreadsheet Format:**
  * Required columns: Date, Description, Debit, Credit, Balance, Category
  * Debit: Amount spent (expenses)
  * Credit: Amount received (income)
  * Balance: Running balance after each transaction
  * Users manage all data directly in Google Spreadsheet

### **3.3 Visualization Dashboard**

* \[ \] **Transaction Overview:** Display summary statistics (total income, total expenses, net income).
* \[ \] **Category Breakdown:** Pie chart showing spending distribution by category.
* \[ \] **Time-based Analysis:** Line/bar charts showing spending trends over time.
* \[ \] **Transaction List:** Sortable and filterable view of all transactions (read-only).

### **3.4 Data Management**

* \[ \] **Edit in Spreadsheet:** All data editing, categorization, and annotation happens directly in Google Spreadsheet.
* \[ \] **Real-time Sync:** Application refreshes data from Google Spreadsheet on demand or automatically.
* \[ \] **No Local Database:** Eliminates need for SQLite or any backend database.

## **4\. User Experience (UX) & Interface**

* \[ \] **Clean & Intuitive Design:** A minimalist and modern user interface focused on visualization and insights.
* \[ \] **Responsive Design:** The application should be fully functional and aesthetically pleasing on various devices (desktop, tablet, mobile).
* \[ \] **Data Visualization:** Clear charts and graphs to provide quick insights into spending patterns (pie charts, bar charts, line charts, trend analysis).
* \[ \] **Read-Only Interface:** No complex forms or data entry within the app - all editing happens in Google Spreadsheet.
* \[ \] **Quick Refresh:** Easy button to sync latest data from Google Spreadsheet.

## **5\. Technical Considerations & Recommended Stack**

Given the simplified architecture using Google Spreadsheet as the data source, the following lightweight stack is recommended:

### **5.1 Frontend: HTML + JavaScript (Vanilla or React)**

* **Option 1 - Single HTML File:** Ultra-simple approach with vanilla JavaScript, minimal dependencies
* **Option 2 - React:** If more complex visualizations are needed, React with charting libraries
* **Styling:** **Tailwind CSS** or simple CSS for clean, responsive design
* **Benefits:** Extremely simple architecture, no build process needed for Option 1, fast loading

### **5.2 Backend: None Required**

* **Why:** With Google Spreadsheet as the data source, no backend server is needed
* **Google Sheets API:** Direct client-side integration with Google Sheets API
* **Benefits:** Zero infrastructure to manage, no deployment complexity, completely client-side application

### **5.3 Database: None Required**

* **Why:** Google Spreadsheet serves as the database, eliminating need for SQLite or any other database
* **Data Persistence:** All data persisted in user's Google Spreadsheet
* **Benefits:** No database management, no migrations, users have full control of their data

## **6\. Future Enhancements (Optional)**

* \[ \] **Advanced Filters:** Client-side filtering based on dates, amounts, descriptions, categories.
* \[ \] **Budget Visualization:** If budget data is added to spreadsheet, display budget vs actual spending.
* \[ \] **Trend Analysis:** Month-over-month comparisons, year-over-year trends.
* \[ \] **Export Features:** Generate PDF reports from visualized data.
* \[ \] **Multiple Spreadsheet Support:** Switch between different Google Spreadsheets (e.g., personal vs business).
* \[ \] **Offline Mode:** Cache data locally for viewing when offline.
* \[ \] **Mobile Application:** Native iOS/Android app with same Google Sheets integration.
* \[ \] **Shared Dashboards:** Share read-only visualization dashboards with family members.
