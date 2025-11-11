const API_URL = "https://servers-frontend.fivem.net/api/servers/single/xj656r";

const playersTable = document.querySelector("#playersTable tbody");
const playerCount = document.querySelector("#playerCount");
const refreshBtn = document.querySelector("#refreshBtn");
const timerDisplay = document.querySelector("#timer");
const lastUpdated = document.querySelector("#lastUpdated");

const allTab = document.getElementById("allTab");
const favTab = document.getElementById("favTab");
const searchInput = document.getElementById("searchInput");

let allPlayers = [];
let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
let currentTab = "all";
let countdown = 30;
let countdownInterval;

async function fetchPlayers() {
  try {
    const res = await fetch(API_URL);
    const data = await res.json();
    allPlayers = data.Data.players.sort((a, b) => a.id - b.id);
    renderTable();
    playerCount.textContent = `Players Count: ${allPlayers.length}`;
    lastUpdated.textContent = `Last Updated: ${new Date().toLocaleTimeString()}`;
    resetCountdown();
  } catch (err) {
    console.error("Error fetching data:", err);
  }
}

function renderTable() {
  let listToRender = currentTab === "favorites"
    ? allPlayers.filter(p => favorites.includes(p.id))
    : allPlayers;

  const searchTerm = searchInput.value.toLowerCase();
  if (searchTerm) {
    listToRender = listToRender.filter(p =>
      p.name.toLowerCase().includes(searchTerm) ||
      p.id.toString().includes(searchTerm)
    );
  }

  playersTable.innerHTML = "";
  listToRender.forEach((p, index) => {
    const tr = document.createElement("tr");
    const isFav = favorites.includes(p.id);
    tr.innerHTML = `
      <td>${index + 1}</td>
      <td>${p.id}</td>
      <td>${p.name}</td>
      <td>${p.ping}</td>
      <td><button class="favorite ${isFav ? "active" : ""}" data-id="${p.id}">
        ${isFav ? "★" : "☆"}
      </button></td>
    `;
    playersTable.appendChild(tr);
  });
}

function toggleFavorite(id) {
  id = Number(id);
  if (favorites.includes(id)) {
    favorites = favorites.filter(f => f !== id);
  } else {
    favorites.push(id);
  }
  localStorage.setItem("favorites", JSON.stringify(favorites));
  renderTable();
}

function resetCountdown() {
  clearInterval(countdownInterval);
  countdown = 30;
  timerDisplay.textContent = `Next refresh in: ${countdown}s`;
  countdownInterval = setInterval(() => {
    countdown--;
    timerDisplay.textContent = `Next refresh in: ${countdown}s`;
    if (countdown <= 0) fetchPlayers();
  }, 1000);
}

refreshBtn.addEventListener("click", fetchPlayers);
playersTable.addEventListener("click", e => {
  if (e.target.classList.contains("favorite")) {
    toggleFavorite(e.target.dataset.id);
  }
});
allTab.addEventListener("click", () => {
  currentTab = "all";
  allTab.classList.add("active");
  favTab.classList.remove("active");
  renderTable();
});
favTab.addEventListener("click", () => {
  currentTab = "favorites";
  favTab.classList.add("active");
  allTab.classList.remove("active");
  renderTable();
});
searchInput.addEventListener("input", renderTable);

fetchPlayers();
