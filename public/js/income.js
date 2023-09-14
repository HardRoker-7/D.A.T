// Listen for a click event on an element with the id 'on' and execute functions when clicked
document.getElementById('on').addEventListener('click', function () {
    fetchAndPlotData(); // Fetch and plot stock price data
    fetchData(); // Fetch financial data
    getFinancialData(); // Fetch balance sheet data
})

// Listen for a click event on an element with the id 'on1' and execute functions when clicked
document.getElementById('on1').addEventListener('click', function () {
    clearInput(); // Clear input fields
    clearInput1(); // Clear input fields
    clearInput2(); // Clear input fields
})

// Stock suggestion functionality
const apiKey = '6VWT72JNHHLBF3MH';

const userInput = document.getElementById('companySymbol'); // Get user input element
const suggestionsList = document.getElementById('suggestions'); // Get suggestion list element

// fetchSuggestions(): This async function fetches stock symbols and company names based on user input
//  (company symbol search) using the Alpha Vantage API. It constructs an API request URL, makes a fetch request, 
//  processes the response data, and dynamically displays a list of suggestions as the user types in the input field.
async function fetchSuggestions(keyword) {
    const apiUrl = `https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=${keyword}&apikey=${apiKey}`;

    try {
        const response = await fetch(apiUrl);
        const data = await response.json();

        if (data.bestMatches) {
            return data.bestMatches.slice(0, 2); // Limit to the first 2 suggestions
        }
    } catch (error) {
        console.error(error);
    }

    return [];
}

// Event listener for user input changes
userInput.addEventListener('input', async () => {
    const inputText = userInput.value.trim(); // Get trimmed user input
    suggestionsList.innerHTML = ''; // Clear previous suggestions

    if (inputText.length >= 2) {
        const suggestions = await fetchSuggestions(inputText); // Fetch stock suggestions
        suggestions.slice(0, 3).forEach((suggestion) => {
            // Display the first 3 suggestions in a list
            const listItem = document.createElement('li');
            listItem.textContent = `${suggestion['1. symbol']} - ${suggestion['2. name']}`;
            listItem.addEventListener('click', () => {
                userInput.value = suggestion['1. symbol']; // Fill input with selected suggestion
                suggestionsList.innerHTML = ''; // Clear suggestion list
            });
            suggestionsList.appendChild(listItem);
        });
    }
});

// Details of how code works explained in the cash, debt, and common stock section only difference is
// in the name of functions and variables

const apiUrl = 'https://www.alphavantage.co/query?function=INCOME_STATEMENT&apikey=6VWT72JNHHLBF3MH';

let chart; // Declare chart variable

// Function to fetch revenue and profit data from Alpha Vantage API
function fetchData() {
    const companySymbolInput = document.getElementById('companySymbol');
    const companySymbol = companySymbolInput.value.toUpperCase();
    if (!companySymbol) {
        alert('Please enter a company symbol.');
        return;
    }

    const apiQuery = `${apiUrl}&symbol=${companySymbol}`;

    fetch(apiQuery)
        .then(response => response.json())
        .then(data => {
            if (data.annualReports && data.annualReports.length > 0) {
                const revenueData = data.annualReports.map(report => report.totalRevenue / 1000000000);
                const netProfitData = data.annualReports.map(report => report.netIncome / 1000000000);

                createOrUpdateChart(data, revenueData, netProfitData);
            } else {
                alert('No financial data found for the specified company symbol.');
            }
        })
        .catch(error => {
            alert('Error fetching data: ' + error);
        });
}

// Function to create or update a chart displaying revenue and net profit data
function createOrUpdateChart(data, revenueData, netProfitData) {
    const ct = document.getElementById('stockChart1').getContext('2d');
    const years = data.annualReports.map(report => report.fiscalDateEnding.split('-')[0]);

    chart = new Chart(ct, {
        type: 'bar',
        data: {
            labels: years,
            datasets: [
                {
                    label: 'Revenue',
                    data: revenueData,
                    backgroundColor: 'rgba(54, 162, 235, 0.5)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1
                },
                {
                    label: 'Net Profit',
                    data: netProfitData,
                    backgroundColor: 'rgba(255, 99, 132, 0.5)',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 1
                }
            ]
        },
        options: {
            maintainAspectRatio: false,
            scales: {
                y: {
                    display: true,
                    title: {
                        display: true,
                        text: '(USD)Billions'
                    }
                }
            }
        }
    });
}

// Clear input fields and the chart
function clearInput2() {
    document.getElementById('priceChart').value = '';
    document.getElementById('priceChart').textContent = '';
    const ct = document.getElementById('stockChart1').getContext('2d');
    const existingChart = Chart.getChart(ct); // Get the existing chart instance

    if (existingChart) {
        existingChart.destroy(); // Destroy the existing chart if it exists
    }
}

// Functionality for fetching balance sheet data
// getFinancialData(): This function fetches balance sheet data for
//  a specified company symbol from the Alpha Vantage API. It constructs an API 
//  request URL, makes a fetch request, processes the response data (cash, long-term debt, 
//     and common stock shares), and then calls createBarChart() to create a bar chart displaying this financial data.
function getFinancialData() {
    const apiUrl = 'https://www.alphavantage.co/query?function=BALANCE_SHEET&apikey=6VWT72JNHHLBF3MH';

    const companySymbolInput = document.getElementById('companySymbol');
    const companySymbol = companySymbolInput.value.trim().toUpperCase();

    if (!companySymbol) {
        alert('Please enter a company symbol.');
        return;
    }

    const apiQuery = `${apiUrl}&symbol=${companySymbol}`;

    fetch(apiQuery)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok.');
            }
            return response.json();
        })
        .then(data => {
            if (data.annualReports && data.annualReports.length > 0) {
                const companyName = data.symbol;
                const cash = data.annualReports.map(report => report.cashAndShortTermInvestments / 1000000000);
                    // shows cash the compnay has divided by 1000000000 to convert data provided by alpha
                // vantage api into bilions for better comprehension
                const longTermDebt = data.annualReports.map(report => report.longTermDebt / 1000000000);
                 // shows debt the compnay has divided by 1000000000 to convert data provided by alpha
                // vantage api into bilions for better comprehension
                const commonStockShares = data.annualReports.map(report => report.commonStockSharesOutstanding / 1000000000);
                 // shows commonshares the compnay has divided by 1000000000 to convert data provided by alpha
                // vantage api into bilions for better comprehension
                document.getElementById('companySymbolDisplay').textContent = `Company Symbol: ${companyName} (${companySymbol})`;
                 // displays company name and symbol
               
                createBarChart(data, cash, longTermDebt, commonStockShares);
            } else {
                alert('No financial data found for the specified company symbol.');
            }
        })
        .catch(error => {
            alert('Error fetching data: ' + error.message);
        });
}

// createBarChart(): This function creates a bar chart displaying financial data such as total cash, long-term debt,
//  and common stock shares outstanding for multiple years. It uses the Chart.js library to create the bar chart.
function createBarChart(data, cash, longTermDebt, commonStockShares) {
    const ctx1 = document.getElementById('financialChart').getContext('2d');
    const years = data.annualReports.map(report => report.fiscalDateEnding.split('-')[0]);

    window.chart = new Chart(ctx1, {
        type: 'bar',
        data: {
            labels: years,
            datasets: [
                {
                    label: 'Total Cash',
                    data: cash,
                    // shows cash the compnay has
                    backgroundColor: 'rgba(0, 179, 134, 1)',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 1
                },
                {
                    label: 'Long-Term Debt',
                    data: longTermDebt,
                    backgroundColor: 'rgba(0, 128, 255, 1)',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 1
                },
                {
                    label: 'Common Stock Shares',
                    data: commonStockShares,
                    backgroundColor: 'rgba(204, 255, 0, 1)',
                    borderWidth: 1
                }
            ]
        },
        options: {
            scales: {
                y: {
                    // this code shows that all the data is represented in Billions of us Dollar on the y Axis
                    display: true,
                    title: {
                        display: true,
                        text: '(USD) Billions'
                    }
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: 'Financial Data'
                }
            }
        }
    });
}

// Clear input fields and the chart
function clearInput1() {
    document.getElementById('companySymbol').value = '';
    document.getElementById('companySymbolDisplay').textContent = '';
    const ctx1 = document.getElementById('financialChart').getContext('2d');
    const existingChart = Chart.getChart(ctx1); // Get the existing chart instance

    if (existingChart) {
        existingChart.destroy(); // Destroy the existing chart if it exists
    }
}

// Functionality for fetching and plotting stock price data
async function fetchAndPlotData() {
    const apiKey = '6VWT72JNHHLBF3MH';
    const stockSymbol = document.getElementById('companySymbol').value.toUpperCase();
    const apiUrl = `https://www.alphavantage.co/query?function=TIME_SERIES_MONTHLY&symbol=${stockSymbol}&apikey=${apiKey}`;

    try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        const timeSeries = data['Monthly Time Series'];
        // extracting time series data over multiple months from alpha vantage api to get data about stock price over 10 years.

        if (!timeSeries) {
            alert('Data not found for the given stock symbol. Please check the symbol or try again later.');
            return;
        }

        const dates = Object.keys(timeSeries).slice(0, 120); // Last 10 years (12 months * 10 years = 120 months)
        const stockPrices = dates.map(date => parseFloat(timeSeries[date]['4. close']));

        const ctx = document.getElementById('stockChart').getContext('2d');
        new Chart(ctx, {
            type: 'line',
            // defines the type of chart in this instance a line chart
            data: {
                labels: dates,
                datasets: [{
                    label: `${stockSymbol} Stock Price`,
                    // label for stock price chart
                    data: stockPrices,
                    // stock prices extracted by the map method from above for 10 years.
                    borderColor: 'rgb(75, 192, 192)',
                    fill: false
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                title: {
                    display: true,
                    text: `${stockSymbol} Stock Price (Last 10 Years)`
                    // this text shows the stock data in the last 10 years
                },
                scales: {
                    x: {
                        display: true,
                        title: {
                            display: true,
                            text: 'Date'
                        }
                    },
                    y: {
                        display: true,
                        title: {
                            display: true,
                            text: 'Stock Price (USD)'
                            // this code siplay sthe stock price as US dollars on the Y axis
                        }
                    }
                }
            }
        });
    } catch (error) {
        alert('Error fetching data. Please try again later.');
        console.error(error);
    }
}

// Clear input fields and the chart
function clearInput() {
    document.getElementById('priceChart').value = '';
    document.getElementById('priceChart').textContent = '';
    const ctx = document.getElementById('stockChart').getContext('2d');
    const existingChart = Chart.getChart(ctx); // Get the existing chart instance

    if (existingChart) {
        existingChart.destroy(); // Destroy the existing chart if it exists
    }
}
