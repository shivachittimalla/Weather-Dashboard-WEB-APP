document.addEventListener('DOMContentLoaded', () => {
  const searchForm = document.getElementById('searchForm');
  const cityInput = document.getElementById('cityInput');
  const cityChips = document.querySelectorAll('.city-chip');
  
  const loadingEl = document.getElementById('loading');
  const errorBanner = document.getElementById('errorBanner');
  const weatherContent = document.getElementById('weatherContent');

  const cityNameEl = document.getElementById('cityName');
  const weatherConditionEl = document.getElementById('weatherCondition');
  const weatherEmojiEl = document.getElementById('weatherEmoji');
  const tempDisplayEl = document.getElementById('tempDisplay');
  const windSpeedEl = document.getElementById('windSpeed');
  const humidityEl = document.getElementById('humidity');
  const feelsLikeEl = document.getElementById('feelsLike');

  // WMO Weather Code Mapping to Descriptions & Emojis
  function getWeatherMeta(code) {
    if (code === 0) return { text: 'Clear Sky', emoji: '☀️' };
    if (code >= 1 && code <= 3) return { text: 'Partly Cloudy', emoji: '⛅' };
    if (code >= 45 && code <= 48) return { text: 'Foggy', emoji: '🌫️' };
    if (code >= 51 && code <= 67) return { text: 'Rainy', emoji: '🌧️' };
    if (code >= 71 && code <= 77) return { text: 'Snowy', emoji: '❄️' };
    if (code >= 80 && code <= 82) return { text: 'Rain Showers', emoji: '🌦️' };
    if (code >= 95) return { text: 'Thunderstorm', emoji: '⛈️' };
    return { text: 'Overcast', emoji: '☁️' };
  }

  // Fetch Coordinates then Weather
  async function fetchWeather(city) {
    showLoading(true);
    hideError();

    try {
      // 1. Geocoding API to get Lat/Long
      const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;
      const geoRes = await fetch(geoUrl);
      const geoData = await geoRes.json();

      if (!geoData.results || geoData.results.length === 0) {
        throw new Error('City not found');
      }

      const location = geoData.results[0];
      const lat = location.latitude;
      const lon = location.longitude;
      const formattedCityName = `${location.name}${location.country ? ', ' + location.country : ''}`;

      // 2. Open-Meteo Weather API
      const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m`;
      const weatherRes = await fetch(weatherUrl);
      const weatherData = await weatherRes.json();

      const current = weatherData.current;
      const meta = getWeatherMeta(current.weather_code);

      // Render Data
      cityNameEl.textContent = formattedCityName;
      weatherConditionEl.textContent = meta.text;
      weatherEmojiEl.textContent = meta.emoji;
      tempDisplayEl.innerHTML = `${Math.round(current.temperature_2m)}<span>°C</span>`;
      windSpeedEl.textContent = `${Math.round(current.wind_speed_10m)} km/h`;
      humidityEl.textContent = `${current.relative_humidity_2m}%`;
      feelsLikeEl.textContent = `${Math.round(current.apparent_temperature)}°C`;

      showLoading(false);
      weatherContent.style.display = 'block';

    } catch (err) {
      showLoading(false);
      showError();
    }
  }

  function showLoading(isLoading) {
    if (isLoading) {
      loadingEl.style.display = 'block';
      weatherContent.style.display = 'none';
    } else {
      loadingEl.style.display = 'none';
    }
  }

  function showError() {
    errorBanner.style.display = 'block';
    weatherContent.style.display = 'none';
  }

  function hideError() {
    errorBanner.style.display = 'none';
  }

  // Handle Form Submit
  searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const city = cityInput.value.trim();
    if (city) {
      fetchWeather(city);
    }
  });

  // Handle Quick Chips
  cityChips.forEach(chip => {
    chip.addEventListener('click', () => {
      const city = chip.dataset.city;
      cityInput.value = city;
      fetchWeather(city);
    });
  });

  // Initial Default Load
  fetchWeather('Hyderabad');
});