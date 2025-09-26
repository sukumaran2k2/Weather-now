import { useState } from "react";
import axios, { Axios } from "axios";
import React from "react";

const weatherMap = {
  0: { desc: "Clear sky", icon: "☀️" },
  1: { desc: "Mainly clear", icon: "🌤️" },
  2: { desc: "Partly cloudy", icon: "⛅" },
  3: { desc: "Overcast", icon: "☁️" },
  45: { desc: "Fog", icon: "🌫️" },
  48: { desc: "Depositing rime fog", icon: "🌫️" },
  51: { desc: "Drizzle: Light", icon: "🌦️" },
  53: { desc: "Drizzle: Moderate", icon: "🌦️" },
  55: { desc: "Drizzle: Dense", icon: "🌦️" },
  61: { desc: "Rain: Slight", icon: "🌧️" },
  63: { desc: "Rain: Moderate", icon: "🌧️" },
  65: { desc: "Rain: Heavy", icon: "🌧️" },
  71: { desc: "Snow: Slight", icon: "🌨️" },
  73: { desc: "Snow: Moderate", icon: "🌨️" },
  75: { desc: "Snow: Heavy", icon: "🌨️" },
  80: { desc: "Rain showers: Slight", icon: "🌦️" },
  81: { desc: "Rain showers: Moderate", icon: "🌦️" },
  82: { desc: "Rain showers: Violent", icon: "🌧️" },
  95: { desc: "Thunderstorm: Slight or moderate", icon: "⛈️" },
  99: { desc: "Thunderstorm: Heavy hail", icon: "⛈️" },
};


function getSuggestion(weather) {
  const { temperature, weathercode, windspeed } = weather;
  let suggestion = "";
  let clothes = "";

  const badWeatherCodes = [45, 48, 51, 53, 55, 61, 63, 65, 80, 81, 82, 95, 99];

  if (badWeatherCodes.includes(weathercode) || windspeed > 30) {
    suggestion = "⚠️ Not ideal for outdoor activities today.";
    clothes = "Consider wearing waterproof or warm clothes and take caution!";
  } else if (temperature <= 10) {
    suggestion = "It's chilly, perfect for a brisk walk!";
    clothes = "Wear a jacket, warm layers, and gloves.";
  } else if (temperature > 10 && temperature <= 20) {
    suggestion = "Nice weather for outdoor activities!";
    clothes = "Wear light layers or a hoodie.";
  } else if (temperature > 20) {
    suggestion = "Great weather for an adventure!";
    clothes = "T-shirt and comfortable pants or shorts should be fine.";
  } else {
    suggestion = "Weather is moderate.";
    clothes = "Dress comfortably.";
  }

  return { suggestion, clothes };
}


function getCardColor(weathercode) {
  if ([0, 1, 2].includes(weathercode)) return "bg-yellow-200"; 
  if ([3, 45, 48].includes(weathercode)) return "bg-gray-300"; 
  if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(weathercode)) return "bg-blue-200";
  if ([71, 73, 75].includes(weathercode)) return "bg-blue-100"; 
  if ([95, 99].includes(weathercode)) return "bg-gray-500"; 
  return "bg-white/90"; // Default
}

function App() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState("");
  const fetchWeather = async () => {

    try {
      const geoRes = await axios.get(
        `https://geocoding-api.open-meteo.com/v1/search?name=${city}`
      );

      if (!geoRes.data.results || geoRes.data.results.length === 0) {
        setError("City not found!");
        setWeather(null);
        return;
      }
      
      const { latitude, longitude, name, country, timezone: tz } = geoRes.data.results[0];
      

      const weatherRes = await axios.get(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`
      );

      setWeather({
        ...weatherRes.data.current_weather,
        city: name,
        country,timezone:tz,
      });
      setError("");
    } catch (err) {
      console.error(err);
      setError("Failed to fetch weather");
      setWeather(null);
    }
  };

  const suggestionData = weather ? getSuggestion(weather) : null;
  const cardColor = weather ? getCardColor(weather.weathercode) : "bg-white/90";

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-start bg-cover bg-center p-4"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1470&q=80')",
      }}
    >
      <h1 className="text-4xl font-bold mt-6 mb-2 text-white drop-shadow-lg">
        Hey Jamie! 🌲 Check the Weather
      </h1>
      {weather?.timezone && <h1 className="text-white">{weather.timezone}</h1>}

      <p className="text-lg text-white mb-6 drop-shadow-md">
        Perfect for planning your next outdoor adventure
      </p>

      <div className="flex mb-6">
        <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Enter city name"
          className="px-4 py-2 bold rounded-l-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-400"
        />
        <button
          onClick={fetchWeather}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-r-lg"
        >
          Check
        </button>
      </div>

      {error && <p className="text-red-200 mb-4">{error}</p>}

      {weather && (
        <div
          className={`rounded-xl shadow-lg p-6 w-80 text-center backdrop-blur-md ${cardColor}`}
        >
          <h2 className="text-2xl font-semibold mb-2">
            {weather.city}, {weather.country}
          </h2>
          <div className="text-6xl mb-2">
            {weatherMap[weather.weathercode]?.icon}
          </div>
          <p className="text-lg mb-2">
            {weatherMap[weather.weathercode]?.desc}
          </p>
          <p className="text-green-700 font-bold mb-1">
            Temperature: {weather.temperature}°C
          </p>
          <p className="text-gray-700 mb-3">Wind Speed: {weather.windspeed} km/h</p>

          {suggestionData && (
            <div className="mt-2 p-3 bg-white/80 rounded-lg">
              <p className="font-semibold">{suggestionData.suggestion}</p>
              <p className="text-gray-700 mt-1">{suggestionData.clothes}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;


