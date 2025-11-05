// Google Sheets API Configuration
// IMPORTANT: You need to replace these with your own credentials
// Get them from: https://console.cloud.google.com/
const CLIENT_ID = '64745166491-u19mtp9gggqdnnrccjqmt2jl64hkaqbv.apps.googleusercontent.com';
const API_KEY = 'AIzaSyBSthVSBxxdqP6ZAX3tgI24fETMkp_wKXE';
const DISCOVERY_DOC = 'https://sheets.googleapis.com/$discovery/rest?version=v4';
const SCOPES = 'https://www.googleapis.com/auth/spreadsheets.readonly';

let tokenClient;
let gapiInited = false;
let gisInited = false;
let transactions = [];
let filteredTransactions = [];
let allTransactions = []; // Store all transactions before time filtering
let selectedCategories = []; // Track selected categories for filtering
let showHidden = false; // Toggle for showing hidden transactions

// Category group mappings
const CATEGORY_GROUPS = {
    'Income': ['Salary', 'Tax Return', 'Extra Income'],
    'Expense': [], // Will be default for everything not in other groups
    'Investment': ['Investment'],
    'Hidden': ['Transfer', 'Reimbursable', 'Misc']
};

// Budget configuration
// Format: { budgetName: { categories: [], amount: number, type: 'monthly' | 'annual' } }
const BUDGETS = {
    'Food & Groceries': {
        categories: ['Groceries', 'Food & Drink'],
        amount: 2500,
        type: 'monthly'
    },
    'Shopping & Gifts': {
        categories: ['Shopping', 'Gifts'],
        amount: 800,
        type: 'monthly'
    },
    'Auto & Transport': {
        categories: ['Transport', 'Car'],
        amount: 1200,
        type: 'monthly'
    },
    'Home & Bills': {
        categories: ['Home', 'Bills & Fees'],
        amount: 3500,
        type: 'monthly'
    },
    'Lifestyle & Entertainment': {
        categories: ['Sport & Hobbies', 'Education', 'Entertainment', 'Digital Device'],
        amount: 1000,
        type: 'monthly'
    },
    'Travel': {
        categories: ['Travel'],
        amount: 20000,
        type: 'annual'
    }
    // Add more budget groups as needed
};

// Category display settings (emoji + color) - Pastel Rainbow Palette
// Palette: https://coolors.co/palette/fbf8cc-fde4cf-ffcfd2-f1c0e8-cfbaf0-a3c4f3-90dbf4-8eecf5-98f5e1-b9fbc0
const CATEGORY_SETTINGS = {
    // Income (Light Green)
    'Salary': { emoji: '💰', color: '#09b596ff' },       // Light Green
    'Tax Return': { emoji: '🏛️', color: '#099e4fff' },  // Mint
    'Extra Income': { emoji: '💵', color: '#517454ff' }, // Light Green

    // Food & Groceries (Peach/Pink)
    'Groceries': { emoji: '🛒', color: '#cf8447ff' },    // Peach
    'Food & Drink': { emoji: '🍽️', color: '#ca5e4bff' }, // Light Pink

    // Shopping & Gifts (Pink/Purple)
    'Shopping': { emoji: '🛍️', color: '#e563cdff' },     // Light Purple
    'Gifts': { emoji: '🎁', color: '#e46cb6ff' },        // Light Pink

    // Transportation (Blue shades)
    'Car': { emoji: '🚗', color: '#6b9adbff' },          // Light Blue
    'Transport': { emoji: '⛽', color: '#4899b4ff' },     // Sky Blue
    'Travel': { emoji: '✈️', color: '#607ecfff' },       // Cyan

    // Home & Bills (Blue/Aqua)
    'Home': { emoji: '🏠', color: '#38a3a5' },         // Light Blue
    'Bills & Fees': { emoji: '🚰', color: '#4abe8cff' }, // Cyan

    // Lifestyle (Various pastels)
    'Sport & Hobbies': { emoji: '🏂', color: '#6175d0ff' },  // Mint
    'Education': { emoji: '📚', color: '#7e72ecff' },        // Purple
    'Entertainment': { emoji: '🎬', color: '#5e5ccbff' },    // Light Purple
    'Digital Device': { emoji: '📱', color: '#64b3ceff' },   // Sky Blue
    'Healthcare': { emoji: '🏥', color: '#5eb4d1ff' },   // Sky Blue

    // Investment (Yellow/Cream)
    'Investment': { emoji: '📈', color: '#777427ff' },   // Light Yellow

    // Hidden (Light pastels)
    'Transfer': { emoji: '🔄', color: '#E0E0E0' },     // Purple
    'Reimbursable': { emoji: '💳', color: '#E0E0E0' }, // Light Yellow
    'Misc': { emoji: '', color: '#E0E0E0' },        // Purple

    // Default
    'Uncategorized': { emoji: '❓', color: '#9d9d9dff' } // Light Gray
};

/**
 * Get category display settings (emoji and color)
 */
function getCategorySettings(category) {
    // Try exact match first
    if (CATEGORY_SETTINGS[category]) {
        return CATEGORY_SETTINGS[category];
    }

    // Try parent category (e.g., "Food:Groceries" -> "Food")
    const parentCategory = category.split(':')[0];
    if (CATEGORY_SETTINGS[parentCategory]) {
        return CATEGORY_SETTINGS[parentCategory];
    }

    // Return default
    return CATEGORY_SETTINGS['Uncategorized'];
}

/**
 * Get category group for a given category
 */
function getCategoryGroup(category) {
    // Check each group
    for (const [group, categories] of Object.entries(CATEGORY_GROUPS)) {
        // Check for exact match or prefix match (e.g., "Income:Salary" matches "Income")
        const matches = categories.some(cat => {
            if (category === cat) return true;
            if (category.startsWith(cat + ':')) return true;
            return false;
        });

        if (matches) return group;
    }

    // Default to Expense if not found in any group
    return 'Expense';
}
let categoryChart = null;
let monthlyExpensesChart = null;
let monthlyIncomeChart = null;

/**
 * Initialize the Google API client
 */
function gapiLoaded() {
    gapi.load('client', initializeGapiClient);
}

async function initializeGapiClient() {
    await gapi.client.init({
        apiKey: API_KEY,
        discoveryDocs: [DISCOVERY_DOC],
    });
    gapiInited = true;
    maybeEnableButtons();
}

/**
 * Initialize Google Identity Services
 */
function gisLoaded() {
    tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES,
        callback: '', // defined later
    });
    gisInited = true;
    maybeEnableButtons();
}

function maybeEnableButtons() {
    if (gapiInited && gisInited) {
        document.getElementById('authorizeButton').style.display = 'inline-block';
    }
}

/**
 * Handle authentication
 */
function handleAuthClick() {
    tokenClient.callback = async (resp) => {
        if (resp.error !== undefined) {
            throw (resp);
        }

        document.getElementById('signoutButton').classList.remove('hidden');
        document.getElementById('authorizeButton').classList.add('hidden');
        document.getElementById('spreadsheetInput').classList.remove('hidden');
        showSuccess('Successfully signed in! Please enter your Spreadsheet ID.');

        // If spreadsheet ID is already saved, offer to load it
        const savedSpreadsheetId = localStorage.getItem('spreadsheetId');
        if (savedSpreadsheetId) {
            showSuccess('Ready to load your spreadsheet! Click "Load Data" to continue.');
        }
    };

    if (gapi.client.getToken() === null) {
        tokenClient.requestAccessToken({prompt: 'consent'});
    } else {
        tokenClient.requestAccessToken({prompt: ''});
    }
}

function handleSignoutClick() {
    const token = gapi.client.getToken();
    if (token !== null) {
        google.accounts.oauth2.revoke(token.access_token);
        gapi.client.setToken('');

        document.getElementById('signoutButton').classList.add('hidden');
        document.getElementById('authorizeButton').classList.remove('hidden');
        document.getElementById('spreadsheetInput').classList.add('hidden');
        document.getElementById('dashboard').classList.add('hidden');
        document.getElementById('authSection').classList.remove('hidden');
        showSuccess('Signed out successfully.');
    }
}

/**
 * Load data from Google Spreadsheet
 */
async function loadSpreadsheet() {
    const spreadsheetId = document.getElementById('sheetId').value.trim();

    if (!spreadsheetId) {
        showError('Please enter a Spreadsheet ID');
        return;
    }

    // Save spreadsheet ID to localStorage
    localStorage.setItem('spreadsheetId', spreadsheetId);

    try {
        showLoading('Loading data from Google Sheets...');

        // First, get the spreadsheet metadata to find sheets matching "Account - *"
        const metadataResponse = await gapi.client.sheets.spreadsheets.get({
            spreadsheetId: spreadsheetId,
        });

        const sheets = metadataResponse.result.sheets;
        if (!sheets || sheets.length === 0) {
            showError('No sheets found in spreadsheet');
            return;
        }

        // Filter sheets that start with "Account - "
        const accountSheets = sheets.filter(sheet =>
            sheet.properties.title.startsWith('Account - ')
        );

        if (accountSheets.length === 0) {
            showError('No sheets found matching pattern "Account - *". Please make sure your sheets are named like "Account - Bank Name".');
            return;
        }

        console.log(`Found ${accountSheets.length} account sheets:`, accountSheets.map(s => s.properties.title));

        // Load data from all account sheets
        transactions = [];
        const loadedSheets = [];

        for (const sheet of accountSheets) {
            const sheetName = sheet.properties.title;

            try {
                // Fetch data from this sheet
                const response = await gapi.client.sheets.spreadsheets.values.get({
                    spreadsheetId: spreadsheetId,
                    range: `${sheetName}!A2:F`,
                });

                const rows = response.result.values;

                if (rows && rows.length > 0) {
                    // Parse transactions and add sheet name (remove "Account - " prefix for display)
                    const displayName = sheetName.replace(/^Account - /, '');
                    const sheetTransactions = rows.map(row => {
                        const category = row[5] || 'Uncategorized';
                        return {
                            date: row[0] || '',
                            description: row[1] || '',
                            debit: parseFloat(row[2]) || 0,
                            credit: parseFloat(row[3]) || 0,
                            balance: parseFloat(row[4]) || 0,
                            category: category,
                            categoryGroup: getCategoryGroup(category), // Add category group
                            account: displayName // Add account/sheet name without prefix
                        };
                    }).filter(t => t.date); // Filter out empty rows

                    transactions.push(...sheetTransactions);
                    loadedSheets.push(displayName);
                    console.log(`Loaded ${sheetTransactions.length} transactions from "${sheetName}"`);
                } else {
                    console.warn(`No data found in sheet "${sheetName}"`);
                }
            } catch (error) {
                console.error(`Error loading sheet "${sheetName}":`, error);
                // Continue loading other sheets even if one fails
            }
        }

        if (transactions.length === 0) {
            showError(`No data found in any account sheets. Make sure your sheets have data starting from row 2.`);
            return;
        }

        // Sort by date (newest first)
        transactions.sort((a, b) => new Date(b.date) - new Date(a.date));

        // Store all transactions
        allTransactions = [...transactions];

        // Show dashboard and hide auth section
        document.getElementById('authSection').classList.add('hidden');
        document.getElementById('dashboard').classList.remove('hidden');

        // Apply time range filter (default is last month in simple mode)
        initializeMonthPickers();
        applySingleMonthFilter(); // Start in simple mode

        showSuccess(`Loaded ${transactions.length} transactions from ${loadedSheets.length} account(s): ${loadedSheets.join(', ')}`);

    } catch (error) {
        console.error('Error loading spreadsheet:', error);

        let errorMessage = 'Error loading spreadsheet: ';

        if (error.status === 404) {
            errorMessage += 'Spreadsheet not found. Please check your Spreadsheet ID.';
        } else if (error.status === 403) {
            errorMessage += 'Access denied. Make sure you have permission to view this spreadsheet.';
        } else if (error.status === 400) {
            errorMessage += 'Invalid request. Please check that your spreadsheet has the correct format (columns: Date, Description, Debit, Credit, Balance, Category).';
        } else {
            errorMessage += error.message || 'Unknown error occurred.';
        }

        showError(errorMessage);
    }
}

/**
 * Initialize month pickers with default values (last month)
 */
function initializeMonthPickers() {
    const today = new Date();
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);

    // Format as YYYY-MM for month input
    const lastMonthStr = `${lastMonth.getFullYear()}-${String(lastMonth.getMonth() + 1).padStart(2, '0')}`;

    // Set all pickers to last month
    document.getElementById('singleMonth').value = lastMonthStr;
    document.getElementById('startMonth').value = lastMonthStr;
    document.getElementById('endMonth').value = lastMonthStr;
}

/**
 * Toggle between simple and advanced mode
 */
function toggleAdvancedMode() {
    const simpleMode = document.getElementById('simpleMode');
    const advancedMode = document.getElementById('advancedMode');

    if (simpleMode.style.display === 'none') {
        // Switch to simple mode
        simpleMode.style.display = 'flex';
        advancedMode.style.display = 'none';

        // Sync single month with start month
        const startMonth = document.getElementById('startMonth').value;
        document.getElementById('singleMonth').value = startMonth;

        applySingleMonthFilter();
    } else {
        // Switch to advanced mode
        simpleMode.style.display = 'none';
        advancedMode.style.display = 'flex';

        // Sync start/end month with single month
        const singleMonth = document.getElementById('singleMonth').value;
        document.getElementById('startMonth').value = singleMonth;
        document.getElementById('endMonth').value = singleMonth;

        applyMonthRangeFilter();
    }
}

/**
 * Apply single month filter (simple mode)
 */
function applySingleMonthFilter() {
    const monthValue = document.getElementById('singleMonth').value;

    if (!monthValue) {
        // If no month selected, show all
        transactions = [...allTransactions];
        filterTransactions();
        updateDashboard();
        return;
    }

    // Parse month value (YYYY-MM format)
    const [year, month] = monthValue.split('-').map(Number);

    // Create date range (first day to last day of selected month)
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0); // Day 0 = last day of previous month

    console.log(`Filtering single month: ${startDate.toDateString()} to ${endDate.toDateString()}`);

    // Filter transactions by date range
    transactions = allTransactions.filter(t => {
        const transDate = new Date(t.date);
        return transDate >= startDate && transDate <= endDate;
    });

    // Apply category/hidden filters
    filterTransactions();

    // Update everything
    updateDashboard();

    console.log(`Filtered to ${transactions.length} transactions`);
}

/**
 * Apply month range filter to transactions
 */
function applyMonthRangeFilter() {
    const startMonthValue = document.getElementById('startMonth').value;
    const endMonthValue = document.getElementById('endMonth').value;

    if (!startMonthValue || !endMonthValue) {
        // If no dates selected, show all
        transactions = [...allTransactions];
        filterTransactions();
        updateDashboard();
        return;
    }

    // Parse month values (YYYY-MM format)
    const [startYear, startMonth] = startMonthValue.split('-').map(Number);
    const [endYear, endMonth] = endMonthValue.split('-').map(Number);

    // Create date range (first day of start month to last day of end month)
    const startDate = new Date(startYear, startMonth - 1, 1);
    const endDate = new Date(endYear, endMonth, 0); // Day 0 = last day of previous month

    console.log(`Filtering from ${startDate.toDateString()} to ${endDate.toDateString()}`);

    // Filter transactions by date range
    transactions = allTransactions.filter(t => {
        const transDate = new Date(t.date);
        return transDate >= startDate && transDate <= endDate;
    });

    // Apply category/hidden filters
    filterTransactions();

    // Update everything
    updateDashboard();

    console.log(`Filtered to ${transactions.length} transactions`);
}

/**
 * Update the entire dashboard with loaded data
 */
function updateDashboard() {
    updateStatistics();
    updateBudgets();
    updateCharts();
    updateTransactionsTable();
    updateCategoryFilter();
    updatePeriodDisplay();
}

/**
 * Update the period display in transactions section
 */
function updatePeriodDisplay() {
    const isSimpleMode = document.getElementById('simpleMode').style.display !== 'none';
    let displayText = '';

    if (isSimpleMode) {
        const monthValue = document.getElementById('singleMonth').value;
        if (monthValue) {
            const [year, month] = monthValue.split('-');
            const date = new Date(year, month - 1);
            displayText = `📅 ${date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}`;
        }
    } else {
        const startValue = document.getElementById('startMonth').value;
        const endValue = document.getElementById('endMonth').value;

        if (startValue && endValue) {
            const [startYear, startMonth] = startValue.split('-');
            const [endYear, endMonth] = endValue.split('-');

            const startDate = new Date(startYear, startMonth - 1);
            const endDate = new Date(endYear, endMonth - 1);

            if (startValue === endValue) {
                displayText = `📅 ${startDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}`;
            } else if (startYear === endYear) {
                displayText = `📅 ${startYear} ${startDate.toLocaleDateString('en-US', { month: 'short' })} - ${endDate.toLocaleDateString('en-US', { month: 'short' })}`;
            } else {
                displayText = `📅 ${startDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short' })} - ${endDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}`;
            }
        }
    }

    const displayElement = document.getElementById('transactionPeriodDisplay');
    if (displayElement) {
        displayElement.textContent = displayText;
    }
}

/**
 * Calculate and display budget progress
 */
function updateBudgets() {
    const budgetContainer = document.getElementById('budgetCards');
    budgetContainer.innerHTML = '';

    // Get the current time period from filters
    const startMonthValue = document.getElementById('singleMonth') ? document.getElementById('singleMonth').value : null;
    const isSimpleMode = document.getElementById('simpleMode').style.display !== 'none';

    let periodStart, periodEnd;

    if (isSimpleMode && startMonthValue) {
        // Simple mode - single month
        const [year, month] = startMonthValue.split('-').map(Number);
        periodStart = new Date(year, month - 1, 1);
        periodEnd = new Date(year, month, 0);
    } else {
        // Advanced mode or use transaction data range
        const dates = transactions.map(t => new Date(t.date)).sort((a, b) => a - b);
        periodStart = dates[0] || new Date();
        periodEnd = dates[dates.length - 1] || new Date();
    }

    // Calculate spending for each budget group
    Object.entries(BUDGETS).forEach(([budgetName, budgetConfig]) => {
        let spent, adjustedBudget;

        if (budgetConfig.type === 'monthly') {
            // Monthly budget: use filtered transactions for the selected period
            spent = transactions
                .filter(t => budgetConfig.categories.includes(t.category))
                .reduce((sum, t) => sum + (t.debit - t.credit), 0);

            // Calculate months in selected period
            const months = (periodEnd.getFullYear() - periodStart.getFullYear()) * 12
                         + (periodEnd.getMonth() - periodStart.getMonth()) + 1;
            adjustedBudget = budgetConfig.amount * months;

        } else if (budgetConfig.type === 'annual') {
            // Annual budget: use FULL YEAR data from allTransactions
            const currentYear = new Date().getFullYear();
            const yearStart = new Date(currentYear, 0, 1);
            const yearEnd = new Date(currentYear, 11, 31);

            spent = allTransactions
                .filter(t => {
                    const tDate = new Date(t.date);
                    return budgetConfig.categories.includes(t.category)
                        && tDate >= yearStart
                        && tDate <= yearEnd;
                })
                .reduce((sum, t) => sum + (t.debit - t.credit), 0);

            // Always use full annual budget
            adjustedBudget = budgetConfig.amount;
        }

        const percentage = (spent / adjustedBudget) * 100;
        const remaining = adjustedBudget - spent;
        const isOverBudget = spent > adjustedBudget;

        // Create budget card
        const card = document.createElement('div');
        card.style.cssText = `
            background: white;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid ${isOverBudget ? '#f56565' : '#48bb78'};
            box-shadow: 0 2px 4px rgba(0,0,0,0.05);
            cursor: pointer;
            transition: transform 0.2s, box-shadow 0.2s;
        `;

        // Make card clickable
        card.addEventListener('click', () => {
            showBudgetTransactions(budgetConfig.categories, budgetConfig.type);
        });

        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-2px)';
            card.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0)';
            card.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)';
        });

        let periodLabel = '';
        if (budgetConfig.type === 'annual') {
            periodLabel = ` ${new Date().getFullYear()}`;
        } else if (budgetConfig.type === 'monthly') {
            const startMonth = periodStart.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
            const endMonth = periodEnd.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });

            if (startMonth === endMonth) {
                periodLabel = ` ${startMonth}`;
            } else {
                const startShort = periodStart.toLocaleDateString('en-US', { month: 'short' });

                // Check if same year
                if (periodStart.getFullYear() === periodEnd.getFullYear()) {
                    periodLabel = ` ${periodStart.getFullYear()} ${startShort} - ${periodEnd.toLocaleDateString('en-US', { month: 'short' })}`;
                } else {
                    periodLabel = ` ${startMonth} - ${endMonth}`;
                }
            }
        }

        // Get unique emojis from all categories in this budget
        const emojis = [...new Set(budgetConfig.categories.map(cat => getCategorySettings(cat).emoji))].join(' ');

        card.innerHTML = `
            <div style="margin-bottom: 10px;">
                <strong style="font-size: 1.1rem; color: #2d3748;">${emojis} ${budgetName}</strong>
                <span style="float: right; font-size: 0.85rem; color: #718096;">${budgetConfig.type}${periodLabel}</span>
            </div>
            <div style="margin-bottom: 8px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                    <span style="color: #4a5568;">Spent:</span>
                    <strong style="color: ${isOverBudget ? '#f56565' : '#2d3748'};">${formatCurrency(spent)}</strong>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                    <span style="color: #4a5568;">Budget:</span>
                    <strong style="color: #4a5568;">${formatCurrency(adjustedBudget)}</strong>
                </div>
                <div style="display: flex; justify-content: space-between;">
                    <span style="color: #4a5568;">${isOverBudget ? 'Over' : 'Remaining'}:</span>
                    <strong style="color: ${isOverBudget ? '#f56565' : '#48bb78'};">${formatCurrency(Math.abs(remaining))}</strong>
                </div>
            </div>
            <div style="background: #e2e8f0; border-radius: 8px; height: 8px; overflow: hidden;">
                <div style="
                    background: ${isOverBudget ? '#f56565' : '#48bb78'};
                    width: ${Math.min(percentage, 100)}%;
                    height: 100%;
                    transition: width 0.3s ease;
                "></div>
            </div>
            <div style="text-align: center; margin-top: 8px; font-size: 0.9rem; color: ${isOverBudget ? '#f56565' : '#718096'};">
                ${percentage.toFixed(1)}% ${isOverBudget ? '⚠️' : ''}
            </div>
            <div style="font-size: 0.8rem; color: #a0aec0; margin-top: 8px;">
                Categories: ${budgetConfig.categories.join(', ')}
            </div>
            <div style="text-align: center; margin-top: 10px; padding-top: 10px; border-top: 1px solid #e2e8f0;">
                <span style="font-size: 0.85rem; color: #667eea; font-weight: 600;">👆 Click to view transactions</span>
            </div>
        `;

        budgetContainer.appendChild(card);
    });
}

/**
 * Show transactions for specific budget categories
 */
function showBudgetTransactions(categories, budgetType) {
    // Store the scroll request to execute after updates
    const doScroll = () => {
        // Set selected categories to the budget categories
        selectedCategories = [...categories];

        // Update the category filter badges to reflect selection
        updateCategoryFilter();

        // Apply the filter
        filterTransactions();

        // Show success message
        showSuccess(`Showing ${filteredTransactions.length} transactions for: ${categories.join(', ')}`);

        // Scroll after everything is done - use multiple attempts to ensure it works
        setTimeout(() => {
            console.log('Attempting to scroll to transactions...');
            const section = document.getElementById('transactionsSection');
            if (section) {
                const rect = section.getBoundingClientRect();
                const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                const targetY = rect.top + scrollTop - 100;

                console.log('Current scroll position:', window.pageYOffset);
                console.log('Target scroll position:', targetY);

                window.scrollTo({
                    top: targetY,
                    behavior: 'smooth'
                });

                // Double-check after scroll animation
                setTimeout(() => {
                    console.log('Final scroll position:', window.pageYOffset);
                }, 1000);
            }
        }, 150);
    };

    // If annual budget, adjust time range to full year first
    if (budgetType === 'annual') {
        const currentYear = new Date().getFullYear();

        // Check if in advanced mode
        const isSimpleMode = document.getElementById('simpleMode').style.display !== 'none';

        if (isSimpleMode) {
            // Switch to advanced mode
            toggleAdvancedMode();
        }

        // Set range to full current year
        document.getElementById('startMonth').value = `${currentYear}-01`;
        document.getElementById('endMonth').value = `${currentYear}-12`;

        // Apply the filter
        applyMonthRangeFilter();

        // Wait for updates to complete before scrolling
        setTimeout(doScroll, 500);
    } else {
        // For monthly budgets, scroll immediately
        doScroll();
    }
}

/**
 * Calculate and update summary statistics
 */
function updateStatistics() {
    // Filter out Hidden transactions
    const visibleTransactions = transactions.filter(t => t.categoryGroup !== 'Hidden');

    // Calculate totals by category group
    // Income: Credit is positive income, Debit is negative income (refunds/returns)
    const totalIncome = visibleTransactions
        .filter(t => t.categoryGroup === 'Income')
        .reduce((sum, t) => sum + (t.credit - t.debit), 0);

    // Expense: Debit is positive expense, Credit is negative expense (refunds/cashback)
    const totalExpenses = visibleTransactions
        .filter(t => t.categoryGroup === 'Expense')
        .reduce((sum, t) => sum + (t.debit - t.credit), 0);

    // Investment: Debit is money invested, Credit is money withdrawn
    const totalInvestment = visibleTransactions
        .filter(t => t.categoryGroup === 'Investment')
        .reduce((sum, t) => sum + (t.debit - t.credit), 0);

    const netIncome = totalIncome - totalExpenses - totalInvestment;

    document.getElementById('totalIncome').textContent = formatCurrency(totalIncome);
    document.getElementById('totalExpenses').textContent = formatCurrency(totalExpenses);
    document.getElementById('totalInvestments').textContent = formatCurrency(totalInvestment);
    document.getElementById('netIncome').textContent = formatCurrency(netIncome);
}

/**
 * Update charts
 */
function updateCharts() {
    updateCategoryChart();
    updateMonthlyExpensesChart();
    updateMonthlyIncomeChart();
}

function updateCategoryChart() {
    // Group expenses by category, only Expense group
    // Debit is positive expense, Credit is negative expense (refunds/cashback)
    const categoryTotals = {};
    transactions.forEach(t => {
        if (t.categoryGroup === 'Expense') {
            const amount = t.debit - t.credit;
            categoryTotals[t.category] = (categoryTotals[t.category] || 0) + amount;
        }
    });

    const labels = Object.keys(categoryTotals);
    const data = Object.values(categoryTotals);

    // Use fixed colors from category settings
    const colors = labels.map(label => getCategorySettings(label).color);

    const ctx = document.getElementById('categoryChart').getContext('2d');

    if (categoryChart) {
        categoryChart.destroy();
    }

    categoryChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: colors,
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        padding: 15,
                        font: {
                            size: 12
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = formatCurrency(context.parsed);
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((context.parsed / total) * 100).toFixed(1);
                            return `${label}: ${value} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

/**
 * Group transactions by month and category
 */
function groupByMonthAndCategory(transactionsList, categoryGroup) {
    const monthlyData = {};

    transactionsList.forEach(t => {
        if (t.categoryGroup !== categoryGroup) return;

        const date = new Date(t.date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

        if (!monthlyData[monthKey]) {
            monthlyData[monthKey] = {};
        }

        // For income, credit is positive and debit is negative
        // For expenses/investment, debit is positive and credit is negative
        const amount = categoryGroup === 'Income'
            ? (t.credit - t.debit)  // Income: credit positive, debit negative
            : (t.debit - t.credit); // Expense/Investment: debit positive, credit negative

        monthlyData[monthKey][t.category] = (monthlyData[monthKey][t.category] || 0) + amount;
    });

    return monthlyData;
}

function updateMonthlyExpensesChart() {
    // Use allTransactions for "all time" view
    const monthlyData = groupByMonthAndCategory(allTransactions, 'Expense');

    // Get sorted months and limit to last 12
    const months = Object.keys(monthlyData).sort().slice(-12);

    // Get all unique categories
    const categories = [...new Set(
        Object.values(monthlyData).flatMap(month => Object.keys(month))
    )].sort();

    // Create datasets for each category
    const datasets = categories.map(category => {
        const settings = getCategorySettings(category);
        return {
            label: `${settings.emoji} ${category}`,
            data: months.map(month => monthlyData[month][category] || 0),
            backgroundColor: settings.color,
            borderColor: settings.color,
            borderWidth: 1
        };
    });

    const ctx = document.getElementById('monthlyExpensesChart').getContext('2d');

    if (monthlyExpensesChart) {
        monthlyExpensesChart.destroy();
    }

    monthlyExpensesChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: months.map(m => {
                const [year, month] = m.split('-');
                return new Date(year, month - 1).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
            }),
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            scales: {
                x: {
                    stacked: true,
                    grid: {
                        display: false
                    }
                },
                y: {
                    stacked: true,
                    beginAtZero: true,
                    min: 0,
                    max: 20000,
                    ticks: {
                        callback: function(value) {
                            return formatCurrency(value);
                        }
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.dataset.label}: ${formatCurrency(context.parsed.y)}`;
                        },
                        footer: function(tooltipItems) {
                            const total = tooltipItems.reduce((sum, item) => sum + item.parsed.y, 0);
                            return `Total: ${formatCurrency(total)}`;
                        }
                    }
                }
            }
        }
    });
}

function updateMonthlyIncomeChart() {
    // Use allTransactions for "all time" view
    const monthlyData = groupByMonthAndCategory(allTransactions, 'Income');

    // Get sorted months and limit to last 12
    const months = Object.keys(monthlyData).sort().slice(-12);

    // Get all unique categories
    const categories = [...new Set(
        Object.values(monthlyData).flatMap(month => Object.keys(month))
    )].sort();

    // Create datasets for each category
    const datasets = categories.map(category => {
        const settings = getCategorySettings(category);
        return {
            label: `${settings.emoji} ${category}`,
            data: months.map(month => monthlyData[month][category] || 0),
            backgroundColor: settings.color,
            borderColor: settings.color,
            borderWidth: 1
        };
    });

    const ctx = document.getElementById('monthlyIncomeChart').getContext('2d');

    if (monthlyIncomeChart) {
        monthlyIncomeChart.destroy();
    }

    monthlyIncomeChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: months.map(m => {
                const [year, month] = m.split('-');
                return new Date(year, month - 1).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
            }),
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            scales: {
                x: {
                    stacked: true,
                    grid: {
                        display: false
                    }
                },
                y: {
                    stacked: true,
                    beginAtZero: true,
                    min: 0,
                    max: 20000,
                    ticks: {
                        callback: function(value) {
                            return formatCurrency(value);
                        }
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.dataset.label}: ${formatCurrency(context.parsed.y)}`;
                        },
                        footer: function(tooltipItems) {
                            const total = tooltipItems.reduce((sum, item) => sum + item.parsed.y, 0);
                            return `Total: ${formatCurrency(total)}`;
                        }
                    }
                }
            }
        }
    });
}

/**
 * Update transactions table
 */
function updateTransactionsTable() {
    const tbody = document.getElementById('transactionsBody');
    tbody.innerHTML = '';

    // Update transaction count
    const countElement = document.getElementById('transactionCount');
    if (countElement) {
        countElement.textContent = filteredTransactions.length;
    }

    filteredTransactions.forEach(transaction => {
        const row = tbody.insertRow();
        row.insertCell(0).textContent = formatDate(transaction.date);
        row.insertCell(1).textContent = transaction.description;

        const debitCell = row.insertCell(2);
        debitCell.textContent = transaction.debit > 0 ? formatCurrency(transaction.debit) : '';
        debitCell.className = transaction.debit > 0 ? 'amount-debit' : '';

        const creditCell = row.insertCell(3);
        creditCell.textContent = transaction.credit > 0 ? formatCurrency(transaction.credit) : '';
        creditCell.className = transaction.credit > 0 ? 'amount-credit' : '';

        row.insertCell(4).textContent = formatCurrency(transaction.balance);

        const categoryCell = row.insertCell(5);
        const badge = document.createElement('span');
        badge.className = 'category-badge';
        const settings = getCategorySettings(transaction.category);
        badge.textContent = `${settings.emoji} ${transaction.category}`;
        badge.style.backgroundColor = settings.color + '20'; // 20 = 12.5% opacity
        badge.style.color = settings.color;
        badge.style.borderLeft = `3px solid ${settings.color}`;
        categoryCell.appendChild(badge);

        const typeCell = row.insertCell(6);
        const typeBadge = document.createElement('span');
        typeBadge.className = 'category-badge';

        // Color code by category group
        const groupColors = {
            'Income': { bg: '#d4edda', color: '#155724' },
            'Expense': { bg: '#f8e2d7ff', color: '#723e1cff' },
            'Investment': { bg: '#fff3cd', color: '#856404' },
            'Hidden': { bg: '#e2e3e5', color: '#383d41' }
        };

        const colors = groupColors[transaction.categoryGroup] || groupColors['Expense'];
        typeBadge.style.backgroundColor = colors.bg;
        typeBadge.style.color = colors.color;
        typeBadge.textContent = transaction.categoryGroup;
        typeCell.appendChild(typeBadge);

        const accountCell = row.insertCell(7);
        const accountBadge = document.createElement('span');
        accountBadge.className = 'category-badge';
        accountBadge.style.backgroundColor = '#e6f3ff';
        accountBadge.style.color = '#0066cc';
        accountBadge.textContent = transaction.account || 'Unknown';
        accountCell.appendChild(accountBadge);
    });
}

/**
 * Toggle show/hide hidden transactions
 */
function toggleShowHidden() {
    showHidden = !showHidden;

    const btn = document.getElementById('toggleHiddenBtn');
    if (showHidden) {
        btn.textContent = '🙈 Hide Hidden';
        btn.style.background = '#667eea';
        btn.style.color = 'white';
    } else {
        btn.textContent = '👁️ Show Hidden';
        btn.style.background = '#e2e8f0';
        btn.style.color = '#4a5568';
    }

    // Update category filter to show/hide hidden categories
    updateCategoryFilter();

    // Reapply filters
    filterTransactions();
}

/**
 * Update category filter with clickable badges
 */
function updateCategoryFilter() {
    const allCategories = [...new Set(transactions.map(t => t.category))].sort();

    // Filter out hidden categories unless showHidden is true
    const categories = showHidden
        ? allCategories
        : allCategories.filter(cat => getCategoryGroup(cat) !== 'Hidden');

    const container = document.getElementById('categoryFilterBadges');

    container.innerHTML = '';

    if (categories.length === 0) {
        container.innerHTML = '<span style="color: #a0aec0;">No categories available</span>';
        return;
    }

    categories.forEach(category => {
        const settings = getCategorySettings(category);
        const isSelected = selectedCategories.includes(category);

        const badge = document.createElement('span');
        badge.className = 'category-badge';
        badge.textContent = `${settings.emoji} ${category}`;
        badge.style.cursor = 'pointer';
        badge.style.transition = 'all 0.2s';
        badge.style.padding = '6px 12px';
        badge.style.borderRadius = '20px';
        badge.style.fontSize = '0.9rem';
        badge.style.fontWeight = '600';
        badge.style.userSelect = 'none';

        if (isSelected) {
            // Selected state - solid color
            badge.style.backgroundColor = settings.color;
            badge.style.color = 'white';
            badge.style.border = `2px solid ${settings.color}`;
        } else {
            // Unselected state - light background
            badge.style.backgroundColor = settings.color + '20';
            badge.style.color = settings.color;
            badge.style.border = `2px solid ${settings.color}`;
        }

        badge.addEventListener('click', () => {
            toggleCategorySelection(category);
        });

        badge.addEventListener('mouseenter', () => {
            if (!isSelected) {
                badge.style.backgroundColor = settings.color + '40';
            }
        });

        badge.addEventListener('mouseleave', () => {
            if (!isSelected) {
                badge.style.backgroundColor = settings.color + '20';
            }
        });

        container.appendChild(badge);
    });
}

/**
 * Toggle category selection
 */
function toggleCategorySelection(category) {
    const index = selectedCategories.indexOf(category);

    if (index > -1) {
        // Remove from selection
        selectedCategories.splice(index, 1);
    } else {
        // Add to selection
        selectedCategories.push(category);
    }

    // Update the filter badges display
    updateCategoryFilter();

    // Apply filter
    filterTransactions();
}

/**
 * Clear all category selections
 */
function clearCategoryFilter() {
    selectedCategories = [];
    updateCategoryFilter();
    filterTransactions();
}

/**
 * Update account filter dropdown
 */
function updateAccountFilter(accountNames) {
    // Check if account filter already exists, if not create it
    let select = document.getElementById('accountFilter');

    if (!select) {
        // Create the account filter next to category filter
        const filtersDiv = document.querySelector('.filters');
        select = document.createElement('select');
        select.id = 'accountFilter';
        select.onchange = filterTransactions;
        select.style.padding = '10px';
        select.style.border = '2px solid #e2e8f0';
        select.style.borderRadius = '8px';
        select.style.fontSize = '0.95rem';
        filtersDiv.insertBefore(select, filtersDiv.children[1]); // Insert after search input
    }

    // Clear and populate
    select.innerHTML = '<option value="">All Accounts</option>';

    accountNames.forEach(account => {
        const option = document.createElement('option');
        option.value = account;
        option.textContent = account;
        select.appendChild(option);
    });
}

/**
 * Update category group filter dropdown
 */
function updateCategoryGroupFilter() {
    let select = document.getElementById('categoryGroupFilter');

    if (!select) {
        // Create the category group filter
        const filtersDiv = document.querySelector('.filters');
        select = document.createElement('select');
        select.id = 'categoryGroupFilter';
        select.onchange = filterTransactions;
        select.style.padding = '10px';
        select.style.border = '2px solid #e2e8f0';
        select.style.borderRadius = '8px';
        select.style.fontSize = '0.95rem';
        filtersDiv.appendChild(select);
    }

    // Populate with category groups
    select.innerHTML = '<option value="">All Types</option>';

    ['Income', 'Expense', 'Investment', 'Hidden'].forEach(group => {
        const option = document.createElement('option');
        option.value = group;
        option.textContent = group;
        select.appendChild(option);
    });
}

/**
 * Filter transactions based on selected categories and hidden toggle
 */
function filterTransactions() {
    let result = [...transactions];

    // Filter out hidden transactions unless showHidden is true
    if (!showHidden) {
        result = result.filter(t => t.categoryGroup !== 'Hidden');
    }

    // Apply category filter if any selected
    if (selectedCategories.length > 0) {
        result = result.filter(t => selectedCategories.includes(t.category));
    }

    filteredTransactions = result;

    updateTransactionsTable();

    // Update transaction count
    const countElement = document.getElementById('transactionCount');
    if (countElement) {
        countElement.textContent = filteredTransactions.length;
    }
}

/**
 * Sort transactions table
 */
let sortDirection = {};
function sortTable(columnIndex) {
    const columnMap = ['date', 'description', 'debit', 'credit', 'balance', 'category', 'categoryGroup', 'account'];
    const column = columnMap[columnIndex];

    sortDirection[column] = sortDirection[column] === 'asc' ? 'desc' : 'asc';

    filteredTransactions.sort((a, b) => {
        let valA = a[column];
        let valB = b[column];

        if (column === 'date') {
            valA = new Date(valA);
            valB = new Date(valB);
        }

        if (typeof valA === 'string') {
            valA = valA.toLowerCase();
            valB = valB.toLowerCase();
        }

        if (sortDirection[column] === 'asc') {
            return valA > valB ? 1 : -1;
        } else {
            return valA < valB ? 1 : -1;
        }
    });

    updateTransactionsTable();
}

/**
 * Utility functions
 */
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function generateColors(count) {
    const colors = [
        '#667eea', '#764ba2', '#f093fb', '#4facfe',
        '#43e97b', '#fa709a', '#fee140', '#30cfd0',
        '#a8edea', '#fed6e3', '#fccb90', '#d57eeb',
        '#ffc3a0', '#ff9a9e', '#fad0c4', '#ffecd2'
    ];

    return Array.from({ length: count }, (_, i) => colors[i % colors.length]);
}

function showError(message) {
    const errorDiv = document.getElementById('errorMessage');
    errorDiv.innerHTML = `<div class="error">${message}</div>`;
    setTimeout(() => errorDiv.innerHTML = '', 5000);
}

function showSuccess(message) {
    const successDiv = document.getElementById('successMessage');
    successDiv.innerHTML = `<div class="success">${message}</div>`;
    setTimeout(() => successDiv.innerHTML = '', 5000);
}

function showLoading(message) {
    const successDiv = document.getElementById('successMessage');
    successDiv.innerHTML = `<div class="loading">${message}</div>`;
}

/**
 * Initialize on page load
 */
window.onload = function() {
    // Check if spreadsheet ID is saved
    const savedSpreadsheetId = localStorage.getItem('spreadsheetId');
    if (savedSpreadsheetId) {
        document.getElementById('sheetId').value = savedSpreadsheetId;
    }
};
