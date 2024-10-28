const sheetId = '1a2Oj5EBg5Nrqhs5Juhzuz_wUS57C2YSJacosXqdFwoc'; // Your Sheet ID
const apiKey = 'AIzaSyAdm1S0fdcBEbCBVti8Pl1v_Y4GBaBw_mI'; // Replace with your actual API key

async function fetchData(range) {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}?key=${apiKey}`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        console.log(data); // Log the fetched data to verify content
        return data.values;
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}


// Function to render the main players table with only the last 5 dates, Total Points, and Games Played columns
function renderPlayersTable(data) {
    const tableContainer = document.getElementById('table-container');
    tableContainer.innerHTML = ''; // Clear previous content

    // Extract headers and data
    const headers = data[0];
    const rows = data.slice(1);

    // Prepare headers for "Player Name", last 5 dates, "Total Points", and "Games Played"
    const displayedHeaders = [
        headers[0],                    // Player Name
        ...headers.slice(-5),           // Last 5 date columns
        'Total Points', 'Games Played'  // New calculated columns
    ];

    // Create table and add headers
    const table = document.createElement('table');
    const thead = table.createTHead();
    const headerRow = thead.insertRow();
    displayedHeaders.forEach(header => {
        const th = document.createElement('th');
        th.textContent = header;
        headerRow.appendChild(th);
    });

    // Calculate and display data for each player
    const tbody = table.createTBody();
    rows.forEach(row => {
        const tr = tbody.insertRow();

        // Player name cell with a clickable link
        const playerNameCell = tr.insertCell();
        const playerLink = document.createElement('a');
        playerLink.href = '#';
        playerLink.textContent = row[0];
        playerLink.onclick = (e) => {
            e.preventDefault();
            showPlayerDetails(row[0], row, headers); // Call showPlayerDetails with full player data
        };
        playerNameCell.appendChild(playerLink);

        // Display only the last 5 date columns
        const last5Scores = row.slice(-5); // Last 5 date scores
        last5Scores.forEach(score => {
            const td = tr.insertCell();
            td.textContent = score;
        });

        // Calculate Total Points and Games Played across all date columns (excluding player name)
        const dateScores = row.slice(1); // All date columns
        const totalPoints = dateScores.reduce((sum, score) => {
            return score !== '*' ? sum + parseInt(score, 10) : sum;
        }, 0);
        const gamesPlayed = dateScores.filter(score => score !== '*').length;

        // Add Total Points and Games Played columns
        const totalPointsCell = tr.insertCell();
        totalPointsCell.textContent = totalPoints;

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
            range = 'Players!A1:Z'; // Adjust to cover all columns in "Players"
            const data = await fetchData(range);
            if (data) renderPlayersTable(data);
            break;
        case 'Teams':
            range = 'Teams!A1:Z';
            const teamsData = await fetchData(range);
            renderTable(teamsData); // Assume a generic renderTable function exists
            break;
        case 'Scorers':
            range = 'Scorers!A1:Z';
            const scoresData = await fetchData(range);
            renderTable(scoresData); // Assume a generic renderTable function exists
            break;
        default:
            console.error('Tab not found');
            return;
    }
}

// Function to show all data for a player directly on the page with detailed stats and a close button
function showPlayerDetails(playerName, fullRowData, headers) {
    const playerDataSection = document.getElementById('player-data');
    playerDataSection.innerHTML = ''; // Clear previous content
    playerDataSection.style.display = 'block'; // Make the section visible

    // Close button
    const closeButton = document.createElement('button');
    closeButton.textContent = 'Close';
    closeButton.classList.add('close-button');
    closeButton.onclick = () => {
        playerDataSection.style.display = 'none'; // Hide the section when clicked
    };
    playerDataSection.appendChild(closeButton);

    // Title
    const title = document.createElement('h2');
    title.textContent = `Full Data for ${playerName}`;
    playerDataSection.appendChild(title);

    // Calculate detailed stats
    const dateScores = fullRowData.slice(1); // Only date columns, excluding player name
    const wins = dateScores.filter(score => score === '3').length;
    const draws = dateScores.filter(score => score === '1').length;
    const losses = dateScores.filter(score => score === '0').length;
    const notPlayed = dateScores.filter(score => score === '*').length;
    const totalGamesPlayed = dateScores.length - notPlayed;
    const totalPoints = dateScores.reduce((sum, score) => {
        return score !== '*' ? sum + parseInt(score, 10) : sum;
    }, 0);
    const winPercentage = totalGamesPlayed > 0 ? ((wins / totalGamesPlayed) * 100).toFixed(2) : 0;

    // Create Summary Table for Stats
    const statsTable = document.createElement('table');
    statsTable.classList.add('stats-table');
    const statsTableBody = document.createElement('tbody');

    const stats = [
        ['Wins', wins],
        ['Draws', draws],
        ['Losses', losses],
        ['Games Not Played', notPlayed],
        ['Total Games Played', totalGamesPlayed],
        ['Total Points', totalPoints],
        ['Winning Percentage', `${winPercentage}%`]
    ];

    stats.forEach(stat => {
        const row = document.createElement('tr');
        const statNameCell = document.createElement('td');
        statNameCell.textContent = stat[0];
        const statValueCell = document.createElement('td');
        statValueCell.textContent = stat[1];
        row.appendChild(statNameCell);
        row.appendChild(statValueCell);
        statsTableBody.appendChild(row);
    });

    statsTable.appendChild(statsTableBody);
    playerDataSection.appendChild(statsTable);

    // Full Game Data Table with All Headers
    const table = document.createElement('table');
    const thead = table.createTHead();
    const headerRow = thead.insertRow();

    headers.forEach(header => {
        const th = document.createElement('th');
        th.textContent = header;
        headerRow.appendChild(th);
    });

    const tbody = table.createTBody();
    const tr = tbody.insertRow();
    fullRowData.forEach(cell => {
        const td = tr.insertCell();
        td.textContent = cell;
    });

    playerDataSection.appendChild(table);
}


// Generic function to render any table data (for Teams, Scorers, etc.) with consistent styling
function renderTable(data) {
    const tableContainer = document.getElementById('table-container');
    tableContainer.innerHTML = ''; // Clear previous content

    // Check if data exists
    if (!data || data.length === 0) {
        tableContainer.innerHTML = '<p>No data available.</p>';
        return;
    }

    // Extract headers and data rows
    const headers = data[0];
    const rows = data.slice(1);

    // Create the table
    const table = document.createElement('table');
    table.classList.add('styled-table'); // Add consistent styling class

    // Populate the header row
    const thead = table.createTHead();
    const headerRow = thead.insertRow();
    headers.forEach(header => {
        const th = document.createElement('th');
        th.textContent = header;
        headerRow.appendChild(th);
    });

    // Populate the data rows
    const tbody = table.createTBody();
    rows.forEach(row => {
        const tr = tbody.insertRow();
        row.forEach(cell => {
            const td = tr.insertCell();
            td.textContent = cell;
        });
    });

    // Append the table to the container
    tableContainer.appendChild(table);
}

// Load initial tab data when the page is first loaded
loadTab('Players');
