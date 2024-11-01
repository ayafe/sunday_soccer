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


let openDetailsRow = null; // Variable to track the currently open details row

function renderPlayersTable(data) {
    const tableContainer = document.getElementById('table-container');
    tableContainer.innerHTML = ''; // Clear previous content

    // Extract headers and data
    const headers = data[0];
    const rows = data.slice(1);

    // Display only essential columns on mobile: Player Number, Player Name, Games Played, and Total Points
    const displayedHeaders = ['#', 'Player Name', 'Games Played', 'Total Points'];
    
    // Create the table
    const table = document.createElement('table');
    table.classList.add('styled-table');

    const thead = table.createTHead();
    const headerRow = thead.insertRow();
    displayedHeaders.forEach(header => {
        const th = document.createElement('th');
        th.textContent = header;
        headerRow.appendChild(th);
    });

    // Populate rows with expandable content
    const tbody = table.createTBody();
    rows.forEach((row, index) => { // Add index for numbering
        const tr = tbody.insertRow();

        // Add player number cell
        const playerNumberCell = tr.insertCell();
        playerNumberCell.textContent = index + 1; // Display 1-based index

        // Player Name cell with clickable expand/collapse action
        const playerNameCell = tr.insertCell();
        const playerLink = document.createElement('a');
        playerLink.href = '#';
        playerLink.textContent = row[0];
        playerLink.onclick = (e) => {
            e.preventDefault();
            toggleDetails(row, tr, headers); // Toggle the details row on click
        };
        playerNameCell.appendChild(playerLink);

        // Calculate statistics for Games Played, Total Points, Wins, Draws, Losses, Missing Games, etc.
        const dateScores = row.slice(1);
        const totalPoints = dateScores.reduce((sum, score) => score !== '*' ? sum + parseInt(score, 10) : sum, 0);
        const gamesPlayed = dateScores.filter(score => score !== '*').length;
        const wins = dateScores.filter(score => score === '3').length;
        const draws = dateScores.filter(score => score === '1').length;
        const losses = dateScores.filter(score => score === '0').length;
        const missingGames = dateScores.filter(score => score === '*').length;
        const winPercentage = gamesPlayed > 0 ? ((wins / gamesPlayed) * 100).toFixed(2) : 0;

        // Add Games Played and Total Points cells
        const gamesPlayedCell = tr.insertCell();
        gamesPlayedCell.textContent = gamesPlayed;

        const totalPointsCell = tr.insertCell();
        totalPointsCell.textContent = totalPoints;

        // Add a hidden row for expandable details
        const detailsRow = tbody.insertRow();
        detailsRow.classList.add('details-row');
        detailsRow.style.display = 'none'; // Start hidden
        const detailsCell = detailsRow.insertCell();
        detailsCell.colSpan = 4; // Span across columns, including player number

        // Populate details row with statistics and game history in table format, side by side
        detailsCell.innerHTML = `
            <div class="details-container">
                <table class="details-table">
                    <tr><th colspan="2">Statistics</th></tr>
                    <tr><td>Wins</td><td>${wins}</td></tr>
                    <tr><td>Draws</td><td>${draws}</td></tr>
                    <tr><td>Losses</td><td>${losses}</td></tr>
                    <tr><td>Missing Games</td><td>${missingGames}</td></tr>
                    <tr><td>Total Games Played</td><td>${gamesPlayed}</td></tr>
                    <tr><td>Total Points</td><td>${totalPoints}</td></tr>
                    <tr><td>Winning Percentage</td><td>${winPercentage}%</td></tr>
                </table>
                <table class="details-table">
                    <tr><th colspan="2">Game History</th></tr>
                    ${dateScores.slice().reverse().map((score, i) => {
                        const dateHeader = headers[headers.length - i - 1];
                        return `<tr><td>${dateHeader}</td><td>${score}</td></tr>`;
                    }).join('')}
                </table>
            </div>
        `;
    });

    tableContainer.appendChild(table);
}


// Function to toggle visibility of details row and close any previously opened details
function toggleDetails(row, mainRow, headers) {
    const nextRow = mainRow.nextSibling; // The details row is the next row
    if (openDetailsRow && openDetailsRow !== nextRow) {
        openDetailsRow.style.display = 'none'; // Close any open details row
    }
    nextRow.style.display = nextRow.style.display === 'none' ? 'table-row' : 'none';
    openDetailsRow = nextRow.style.display === 'none' ? null : nextRow; // Update the open details row
}


	

// Modify loadTab to reverse order for Teams tab
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
            if (teamsData) renderTeamsTable(teamsData); // Use a specific function to handle Teams tab
            break;
        case 'Scorers':
            range = 'Scorers!A1:Z';
            const scoresData = await fetchData(range);
            if (scoresData) renderTable(scoresData); // Assume generic renderTable function works for Scorers
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
        ['Missing Games', notPlayed],
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

function renderTeamsTable(data) {
    const tableContainer = document.getElementById('table-container');
    tableContainer.innerHTML = ''; // Clear previous content

    if (!data || data.length === 0) {
        tableContainer.innerHTML = '<p>No data available.</p>';
        return;
    }

    const dateSections = [];
    let currentSection = null;

    data.forEach(row => {
        // Check if the row starts with a date, indicating a new section
        const datePattern = /^\d{1,2}\/\d{1,2}\/\d{4}$/;
        if (row[0] && datePattern.test(row[0])) {
            // Start a new section for each date row
            if (currentSection) dateSections.push(currentSection);
            currentSection = { date: row[0], score: '', teams: [] };
        } else if (row[0] && row[1] === '-' && currentSection) {
            // Capture the score row
            currentSection.score = `${row[0]} - ${row[2]}`;
        } else if (currentSection) {
            // Add team data to the current section
            currentSection.teams.push(row);
        }
    });

    // Push the last section if it exists
    if (currentSection) dateSections.push(currentSection);

    // Reverse sections to display latest date first
    dateSections.reverse();

    // Render the sections in the DOM
    dateSections.forEach(section => {
        // Create a table for each section
        const sectionTable = document.createElement('table');
        sectionTable.classList.add('styled-table'); // Add a class for consistent styling

        // Add date as the header row
        const dateRow = sectionTable.insertRow();
        const dateCell = dateRow.insertCell();
        dateCell.colSpan = 2; // Span across two columns for the date
        dateCell.textContent = section.date;
        dateCell.classList.add('date-header'); // Add a class for styling the date header

        // Add score row
        const scoreRow = sectionTable.insertRow();
        const scoreCell = scoreRow.insertCell();
        scoreCell.colSpan = 2;
        scoreCell.textContent = `Score: ${section.score}`;
        scoreCell.classList.add('score-row'); // Add a class for styling the score row

        // Add team data rows
        section.teams.forEach(teamRow => {
            const teamDataRow = sectionTable.insertRow();
            teamRow.forEach(cellData => {
                const cell = teamDataRow.insertCell();
                cell.textContent = cellData;
            });
        });

        // Append the section table to the container
        tableContainer.appendChild(sectionTable);
    });
}



// Load initial tab data when the page is first loaded
loadTab('Players');
