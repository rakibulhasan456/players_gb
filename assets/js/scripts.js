const API_URL = "http://139.162.49.4:30123/players.json"; 
// For local testing: const API_URL = "players.json";

const playersTableBody = document.querySelector("#playersTable tbody");
const favoritesTableBody = document.querySelector("#favoritesTable tbody");
const playerCountEl = document.getElementById("playerCount");
const refreshBtn = document.getElementById("refreshBtn");
const timerEl = document.querySelector("#timer b");
const lastUpdatedEl = document.getElementById("lastUpdated");

let countdown = 30;
let timerInterval;
let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

// Fetch player data
async function fetchPlayers() {
  try {
    const response = await fetch(API_URL, { cache: "no-store" });
    const data = await response.json();

    // Sort by ID ascending
    data.sort((a, b) => a.id - b.id);

    // Player count
    playerCountEl.textContent = `Players Count: ${data.length}`;

    // Update table
    playersTableBody.innerHTML = "";
    data.forEach((player, index) => {
      const isFav = favorites.some(f => f.id === player.id);
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${index + 1}</td>
        <td>${player.id}</td>
        <td>${player.name}</td>
        <td>${player.ping}</td>
        <td>
          <button class="favorite-btn ${isFav ? "remove" : ""}" data-id="${player.id}">
            ${isFav ? "Remove" : "Add"}
          </button>
        </td>
      `;
      playersTableBody.appendChild(tr);
    });

    renderFavorites();

    // Update last updated time
    const now = new Date();
    lastUpdatedEl.textContent = `Last Updated: ${now.toLocaleTimeString()}`;
  } catch (error) {
    console.error("Failed to fetch players:", error);
    playersTableBody.innerHTML = `<tr><td colspan="5">Failed to load player data.</td></tr>`;
  }
}

function renderFavorites() {
  favoritesTableBody.innerHTML = "";
  favorites.forEach((player, index) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${index + 1}</td>
      <td>${player.id}</td>
      <td>${player.name}</td>
      <td>${player.ping}</td>
      <td>
        <button class="favorite-btn remove" data-id="${player.id}">Remove</button>
      </td>
    `;
    favoritesTableBody.appendChild(tr);
  });
}

function toggleFavorite(id, name, ping) {
  const exists = favorites.find(f => f.id === id);
  if (exists) {
    favorites = favorites.filter(f => f.id !== id);
  } else {
    favorites.push({ id, name, ping });
  }
  localStorage.setItem("favorites", JSON.stringify(favorites));
  fetchPlayers();
}

// Handle favorites click (All Players)
playersTableBody.addEventListener("click", e => {
  if (e.target.classList.contains("favorite-btn")) {
    const row = e.target.closest("tr");
    const id = Number(row.children[1].textContent);
    const name = row.children[2].textContent;
    const ping = Number(row.children[3].textContent);
    toggleFavorite(id, name, ping);
  }
});

// Handle favorites click (Favorites tab)
favoritesTableBody.addEventListener("click", e => {
  if (e.target.classList.contains("favorite-btn")) {
    const id = Number(e.target.dataset.id);
    favorites = favorites.filter(f => f.id !== id);
    localStorage.setItem("favorites", JSON.stringify(favorites));
    renderFavorites();
    fetchPlayers();
  }
});

// Tab switching
document.querySelectorAll(".tab-button").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab-button").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    document.querySelectorAll(".tab-content").forEach(tab => tab.classList.remove("active"));
    document.getElementById(btn.dataset.tab).classList.add("active");
  });
});

// Countdown logic
function startTimer() {
  clearInterval(timerInterval);
  countdown = 30;
  timerEl.textContent = `${countdown}s`;

  timerInterval = setInterval(() => {
    countdown--;
    timerEl.textContent = `${countdown}s`;
    if (countdown <= 0) {
      fetchPlayers();
      countdown = 30;
    }
  }, 1000);
}

// Manual refresh button
refreshBtn.addEventListener("click", () => {
  fetchPlayers();
  startTimer();
});

// Initial load
fetchPlayers();
startTimer();
