// Controlador de la vista My Favorite Cities
import { fetchWeather } from "./services/weatherService.js";
import {
  listFavorites,
  addFavorite,
  removeFavorite,
} from "./services/favoritesService.js";

// --- ELEMENTOS DOM ---
const searchForm = document.getElementById("search-form");
const searchInput = document.getElementById("search-input");
const getLocationBtn = document.getElementById("get-location-btn");
const logoutBtn = document.getElementById("logout-btn");
const favoritesList = document.getElementById("favorites-list");
const addFavoriteBtn = document.getElementById("add-favorite-btn");

const loader = document.getElementById("loader");
const errorMessage = document.getElementById("error-message");
const errorText = document.getElementById("error-text");
const weatherContent = document.getElementById("weather-content");

const cityNameEl = document.getElementById("city-name");
const currentTimeEl = document.getElementById("current-time");
const weatherIconMainEl = document.getElementById("weather-icon-main");
const currentTempEl = document.getElementById("current-temp");
const weatherConditionEl = document.getElementById("weather-condition");
const highLowTempEl = document.getElementById("high-low-temp");

const humidityEl = document.getElementById("humidity");
const pressureEl = document.getElementById("pressure");
const visibilityEl = document.getElementById("visibility");
const uvIndexEl = document.getElementById("uv-index");

const forecastContainer = document.getElementById("forecast-container");

// --- ESTADO ---
let favorites = [];
let favoritesByName = []; // nombres para coincidencia rápida
let currentCity = null;
let favoritesMap = new Map(); // id -> favorite object
let currentWeatherRaw = null; // respuesta cruda de API para adaptaciones futuras

// --- ICONOS (mantener local hasta que backend proporcione) ---
const weatherIcons = {
  sun: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"></circle><path d="M12 2v2"></path><path d="M12 20v2"></path><path d="m4.93 4.93 1.41 1.41"></path><path d="m17.66 17.66 1.41 1.41"></path><path d="M2 12h2"></path><path d="M20 12h2"></path><path d="m6.34 17.66-1.41 1.41"></path><path d="m19.07 4.93-1.41 1.41"></path></svg>',
  cloud:
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="text-gray-500"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"></path></svg>',
  "cloud-sun":
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="text-yellow-500"><path d="M12 12a4 4 0 0 0 4-4 1 1 0 0 0-2 0 2 2 0 0 1-2 2Z"></path><path d="M12 4V2"></path><path d="m16 6 1-1"></path><path d="M20 12h2"></path><path d="m16 18 1 1"></path><path d="M12 20v2"></path><path d="m8 18-1 1"></path><path d="M4 12H2"></path><path d="m8 6-1-1"></path><path d="M17.5 22H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"></path></svg>',
  rain: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="text-blue-600"><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"></path><path d="M16 14v6"></path><path d="M8 14v6"></path><path d="M12 16v6"></path></svg>',
};

// --- UI HELPERS ---
function showLoader(isLoading) {
  if (isLoading) {
    weatherContent.classList.add("hidden");
    errorMessage.classList.add("hidden");
    loader.classList.remove("hidden");
  } else {
    loader.classList.add("hidden");
    weatherContent.classList.remove("hidden");
  }
}
function showError(message) {
  weatherContent.classList.add("hidden");
  loader.classList.add("hidden");
  errorMessage.classList.remove("hidden");
  errorText.textContent = message;
}
function updateFavoriteButton() {
  if (!currentCity) return;
  const baseName = currentCity.split(",")[0].trim().toLowerCase();
  const isFavorite = favoritesByName.includes(baseName);
  const icon = addFavoriteBtn.querySelector("svg");
  if (isFavorite) {
    icon.style.fill = "crimson";
    icon.style.stroke = "crimson";
  } else {
    icon.style.fill = "none";
    icon.style.stroke = "currentColor";
  }
}
function renderFavorites() {
  if (!favorites.length) {
    favoritesList.innerHTML =
      '<p class="text-gray-500 text-sm">Aún no tienes favoritos. ¡Busca una ciudad y agrégala!</p>';
    return;
  }
  favoritesList.innerHTML = favorites
    .map(
      (f) => `
    <div class="favorite-item flex justify-between items-center p-3 bg-white/30 hover:bg-white/60 rounded-lg cursor-pointer transition" data-id="${f.id}" data-name="${f.name}">
      <span class="font-medium">${f.name}</span>
      <button class="remove-favorite text-gray-500 hover:text-red-500" data-id="${f.id}" data-name="${f.name}">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
      </button>
    </div>`
    )
    .join("");
}

// --- WEATHER RENDER ---
function renderWeather(data) {
  // Adaptar estructura: asumo data.resultado style { found, ... } -> controller devuelve { data: resultado }
  // De la implementación backend, json.data contiene resultado (probable shape { found, message, location?, weather? })
  currentWeatherRaw = data;
  // Ajustes ficticios hasta ver formato real, usar placeholders si faltan campos
  const current = {
    city: data?.location?.name || currentCity || "Desconocido",
    temp: data?.weather?.temp ?? "--",
    condition: data?.weather?.condition ?? "N/A",
    icon: data?.weather?.iconKey || "cloud",
    high: data?.weather?.max ?? "--",
    low: data?.weather?.min ?? "--",
    humidity: data?.weather?.humidity ?? "--",
    pressure: data?.weather?.pressure ?? "--",
    visibility: data?.weather?.visibility ?? "--",
    uv: data?.weather?.uv ?? "--",
  };
  const forecast = data?.forecast?.slice?.(0, 4) || [];

  currentCity = current.city;
  cityNameEl.textContent = current.city;
  weatherIconMainEl.innerHTML =
    weatherIcons[current.icon] || weatherIcons["cloud"];
  currentTempEl.textContent = `${current.temp}°C`;
  weatherConditionEl.textContent = current.condition;
  highLowTempEl.textContent = `Max: ${current.high}° / Min: ${current.low}°`;

  humidityEl.textContent = `Humedad: ${current.humidity}%`;
  pressureEl.textContent = `Presión: ${current.pressure} hPa`;
  visibilityEl.textContent = `Visibilidad: ${current.visibility} km`;
  uvIndexEl.textContent = `Índice UV: ${current.uv}`;

  forecastContainer.innerHTML = forecast
    .map(
      (f) => `
    <div class="flex flex-col items-center gap-2">
      <span class="font-medium text-sm">${f.day || f.date || ""}</span>
      <div class="w-10 h-10">${
        weatherIcons[f.iconKey] || weatherIcons["cloud"]
      }</div>
      <span class="font-bold">${f.temp ?? f.max ?? "--"}°</span>
    </div>`
    )
    .join("");

  updateFavoriteButton();
  showLoader(false);
}

// --- FAVORITES HELPERS ---
function recomputeFavoritesIndex() {
  favoritesByName = favorites.map((f) => f.name.toLowerCase());
  favoritesMap = new Map(favorites.map((f) => [String(f.id), f]));
}

async function loadFavorites() {
  const userId = localStorage.getItem("userId");
  if (!userId) return;
  const result = await listFavorites(userId);
  if (result.ok) {
    favorites = result.data;
    recomputeFavoritesIndex();
    renderFavorites();
  } else {
    console.warn("No se pudieron cargar favoritos:", result.error);
  }
}

async function toggleFavorite() {
  if (!currentCity) return;
  const baseName = currentCity.split(",")[0].trim();
  const lower = baseName.toLowerCase();
  const existing = favorites.find((f) => f.name.toLowerCase() === lower);
  if (existing) {
    const removed = await removeFavorite(existing.id);
    if (!removed.ok) {
      console.warn("Error al eliminar favorito:", removed.error);
      return;
    }
    favorites = favorites.filter((f) => f.id !== existing.id);
  } else {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      console.warn("Usuario no autenticado, no se puede agregar favorito");
      return;
    }
    const created = await addFavorite({
      name: baseName,
      userId: Number(userId),
    });
    if (!created.ok) {
      console.warn("Error al agregar favorito:", created.error);
      return;
    }
    favorites.push(created.data);
  }
  recomputeFavoritesIndex();
  renderFavorites();
  updateFavoriteButton();
}

// --- WEATHER FLOW ---
async function handleSearch(city) {
  if (!city) return;
  showLoader(true);
  const result = await fetchWeather(city);
  if (!result.ok) {
    showError(result.error || "Error al obtener el clima");
    return;
  }
  renderWeather(result.data);
}

function getLocationWeather() {
  if (!navigator.geolocation) {
    console.warn("Geolocalización no soportada.");
    loadInitial();
    return;
  }
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      // Placeholder: podrías llamar a endpoint de coordenadas si existe
      handleSearch("Asunción");
    },
    (err) => {
      console.error("Error geolocalización", err.message);
      showError(
        "No se pudo obtener tu ubicación. Mostrando ciudad por defecto."
      );
      setTimeout(loadInitial, 1500);
    }
  );
}

async function loadInitial() {
  await loadFavorites();
  const initial = favorites.length ? favorites[0].name : "Asunción";
  handleSearch(initial);
}

// --- EVENTOS ---
searchForm?.addEventListener("submit", (e) => {
  e.preventDefault();
  const city = searchInput.value.trim();
  if (city) {
    handleSearch(city);
    searchInput.value = "";
  }
});

logoutBtn?.addEventListener("click", () => {
  localStorage.removeItem("token");
  localStorage.removeItem("userId");
  window.location.href = "index.html";
});

addFavoriteBtn?.addEventListener("click", toggleFavorite);

favoritesList?.addEventListener("click", (e) => {
  const removeBtn = e.target.closest(".remove-favorite");
  const favoriteItem = e.target.closest(".favorite-item");
  if (removeBtn) {
    const id = removeBtn.getAttribute("data-id");
    if (id && favoritesMap.has(id)) {
      removeFavorite(id).then((r) => {
        if (r.ok) {
          favorites = favorites.filter((f) => String(f.id) !== id);
          recomputeFavoritesIndex();
          renderFavorites();
          updateFavoriteButton();
        }
      });
    }
    return;
  }
  if (favoriteItem) {
    const name = favoriteItem.getAttribute("data-name");
    handleSearch(name);
  }
});

getLocationBtn?.addEventListener("click", getLocationWeather);

// Hora en tiempo real
setInterval(() => {
  const now = new Date();
  currentTimeEl.textContent = now.toLocaleDateString("es-ES", {
    weekday: "long",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}, 1000);

// INIT
(function init() {
  getLocationWeather();
})();
