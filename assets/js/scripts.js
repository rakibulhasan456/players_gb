const API_URL = "http://139.162.49.4:30123/players.json";
const playersTableBody = document.querySelector("#playersTable tbody");
const favoritesTableBody = document.querySelector("#favoritesTable tbody");
const playerCountEl = document.getElementById("playerCount");
const refreshBtn = document.getElementById("refreshBtn");
const timerEl = document.getElementById("timer b");

let countdown = 30;
let refreshInterval;

// Load favorites from localStorage
let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

async function fetchPlayers() {
  try {
    const res = await fetch(API_URL);
    const data = await res.json();

    // Sort players by ID
    data.sort((a, b) => a.id - b.id);

    // Update player count
    playerCountEl.textContent = `Players Count: ${data.length}`;

    // Populate All Players table
    playersTableBody.innerHTML = "";
    data.forEach((player, index) => {
      const isFavorite = favorites.some(f => f.id === player.id);
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${index + 1}</td>
        <td>${player.id}</td>
        <td>${player.name}</td>
        <td>${player.ping}</td>
        <td>
          <button class="favorite-btn ${isFavorite ? "remove" : ""}" data-id="${player.id}">
            ${isFavorite ? "Remove" : "Add"}
          </button>
        </td>
      `;
      playersTableBody.appendChild(tr);
    });

    renderFavorites();
  } catch (err) {
    console.error("Error fetching data:", err);
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
      <td><button class="favorite-btn remove" data-id="${player.id}">Remove</button></td>
    `;
    favoritesTableBody.appendChild(tr);
  });
}

function toggleFavorite(id, name, ping) {
  const existing = favorites.find(f => f.id === id);
  if (existing) {
    favorites = favorites.filter(f => f.id !== id);
  } else {
    favorites.push({ id, name, ping });
  }
  localStorage.setItem("favorites", JSON.stringify(favorites));
  fetchPlayers();
}

playersTableBody.addEventListener("click", (e) => {
  if (e.target.classList.contains("favorite-btn")) {
    const row = e.target.closest("tr");
    const id = Number(row.children[1].textContent);
    const name = row.children[2].textContent;
    const ping = Number(row.children[3].textContent);
    toggleFavorite(id, name, ping);
  }
});

favoritesTableBody.addEventListener("click", (e) => {
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

// Refresh logic
function resetTimer() {
  countdown = 30;
  clearInterval(refreshInterval);
  refreshInterval = setInterval(() => {
    countdown--;
    timerEl.textContent = `${countdown}s`;
    if (countdown <= 0) {
      fetchPlayers();
      countdown = 30;
    }
  }, 1000);
}

refreshBtn.addEventListener("click", () => {
  fetchPlayers();
  resetTimer();
});

// Initial load
fetchPlayers();
resetTimer();
