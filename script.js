const sheetId = '1a2Oj5EBg5Nrqhs5Juhzuz_wUS57C2YSJacosXqdFwoc'; // Your Sheet ID
const apiKey = 'AIzaSyAdm1S0fdcBEbCBVti8Pl1v_Y4GBaBw_mI'; // Replace with your actual API key

// Function to fetch data from a specific range in a Google Sheet tab
async function fetchData(range) {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}?key=${apiKey}`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        return data.values;
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

// Function to render table with an additional "Games Played" column
function renderTable(data) {
    const tableContainer = document.getElementById('table-container');
    tableContainer.innerHTML = ''; // Clear any previous content

    const table = document.createElement('table');

    // Create table headers with an extra column for "Games Played"
    const headers = [...data[0], 'Games Played'];
    const thead = table.createTHead();
    const headerRow = thead.insertRow();
    headers.forEach(header => {
        const th = document.createElement('th');
        th.textContent = header;
        headerRow.appendChild(th);
    });

    // Create table rows, adding the games played count in the last column
    const tbody = table.createTBody();
    data.slice(1).forEach(row => {
        const tr = tbody.insertRow();
        row.forEach(cell => {
            const td = tr.insertCell();
            td.textContent = cell;
        });

        // Calculate games played from Column C up to (but not including) the last column
        const gamesPlayed = row.slice(2, -1).filter(score => score !== '*').length;

        // Add the games played count as the last cell in the row
        const gamesPlayedCell = tr.insertCell();
        gamesPlayedCell.textContent = gamesPlayed;
    });

    tableContainer.appendChild(table);
}

// Function to load and display data for the specified tab
async function loadTab(tabName) {
    let range = '';
    switch (tabName) {
        case 'Players':
            range = 'Players!A1:Z'; // Adjust to capture all columns in "Players"
            break;
        case 'Teams':
            range = 'Teams!A1:Z'; // Adjust to capture all columns in "Teams"
            break;
        case 'Scorers':
            range = 'Scorers!A1:Z'; // Adjust to capture all columns in "Scorers"
            break;
        default:
            console.error('Tab not found');
            return;
    }
    const data = await fetchData(range);
    if (data) renderTable(data);
}

// Load initial tab data when the page is first loaded
loadTab('Players');
