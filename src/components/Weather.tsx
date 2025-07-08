import { useState } from 'react';

// TypeScript interfaces for OpenWeatherMap API response
interface OpenWeatherResponse {
  name: string;
  sys: {
    country: string;
  };
  main: {
    temp: number;
    humidity: number;
    feels_like: number;
  };
  weather: Array<{
    main: string;
    description: string;
    icon: string;
  }>;
  wind: {
    speed: number;
  };
}

interface WeatherData {
  temperature: number;
  feelsLike: number;
  description: string;
  humidity: number;
  windSpeed: number;
  city: string;
  country: string;
  icon: string;
  weatherMain: string;
}

const Weather: React.FC = () => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [city, setCity] = useState<string>('');

  // Your OpenWeatherMap API configuration
  const API_KEY = '0830e79a73d073b97da8dee86c725972';
  const BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';

  const fetchWeather = async (searchCity: string) => {
    if (!searchCity.trim()) {
      setError('Please enter a city name');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const url = `${BASE_URL}?q=${searchCity}&appid=${API_KEY}&units=metric`;
      const response = await fetch(url);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('City not found. Please check the spelling and try again.');
        } else if (response.status === 401) {
          throw new Error('Invalid API key');
        } else if (response.status === 429) {
          throw new Error('Too many requests. Please try again later.');
        } else {
          throw new Error('Failed to fetch weather data');
        }
      }

      const data: OpenWeatherResponse = await response.json();
      
      const weatherData: WeatherData = {
        temperature: Math.round(data.main.temp),
        feelsLike: Math.round(data.main.feels_like),
        description: data.weather[0].description,
        humidity: data.main.humidity,
        windSpeed: Math.round(data.wind.speed * 3.6), // Convert m/s to km/h
        city: data.name,
        country: data.sys.country,
        icon: data.weather[0].icon,
        weatherMain: data.weather[0].main
      };

      setWeather(weatherData);
      setCity(searchCity); // Update the input field with the searched city
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchWeather(city);
  };

  const handleExampleCityClick = (cityName: string) => {
    setCity(cityName); // Update input field
    fetchWeather(cityName); // Directly fetch weather
  };

  const handleBackToHome = () => {
    setWeather(null);
    setError('');
    setCity('');
  };

  const getWeatherIcon = (iconCode: string): string => {
    return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
  };

  const getWeatherEmoji = (weatherMain: string): string => {
    if (weatherMain === 'Clear') {
      return '☀️';
    } else if (weatherMain === 'Clouds') {
      return '☁️';
    } else if (weatherMain === 'Rain') {
      return '🌧️';
    } else if (weatherMain === 'Drizzle') {
      return '🌦️';
    } else if (weatherMain === 'Snow') {
      return '❄️';
    } else if (weatherMain === 'Thunderstorm') {
      return '⛈️';
    } else if (weatherMain === 'Fog' || weatherMain === 'Mist' || weatherMain === 'Haze') {
      return '🌫️';
    } else {
      return '🌤️';
    }
  };

  const getBackgroundClass = (weatherMain: string): string => {
    if (weatherMain === 'Clear') {
      return 'weather-sunny';
    } else if (weatherMain === 'Clouds') {
      return 'weather-cloudy';
    } else if (weatherMain === 'Rain' || weatherMain === 'Drizzle') {
      return 'weather-rainy';
    } else if (weatherMain === 'Snow') {
      return 'weather-snowy';
    } else if (weatherMain === 'Thunderstorm') {
      return 'weather-stormy';
    } else {
      return 'weather-default';
    }
  };

  return (
    <div className="weather-container">
      <div className="weather-header" onClick={handleBackToHome} style={{ cursor: 'pointer' }}>
        <h1>🌤️ Weather App</h1>
        <p>Get current weather information for any city</p>
      </div>
      
      <form onSubmit={handleSubmit} className="search-form">
        <div className="input-group">
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Enter city name (e.g., London, Paris, New York)..."
            className="city-input"
          />
          <button type="submit" disabled={loading} className="search-button">
            {loading ? (
              <>
                <span className="spinner"></span>
                Searching...
              </>
            ) : (
              <>
                🔍 Get Weather
              </>
            )}
          </button>
        </div>
      </form>

      {error && (
        <div className="error-message">
          <span className="error-icon">❌</span>
          <span>{error}</span>
        </div>
      )}

      {loading && (
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Fetching weather data...</p>
        </div>
      )}

      {!weather && !loading && !error && (
        <div className="welcome-message">
          <div className="welcome-icon">🌍</div>
          <h2>Welcome to Weather App!</h2>
          <p>Enter a city name above to get current weather information</p>
          <div className="example-cities">
            <p>Try searching for cities like:</p>
            <div className="city-examples">
              <span 
                onClick={() => handleExampleCityClick('London')} 
                className="city-example"
              >
                London
              </span>
              <span 
                onClick={() => handleExampleCityClick('New York')} 
                className="city-example"
              >
                New York
              </span>
              <span 
                onClick={() => handleExampleCityClick('Tokyo')} 
                className="city-example"
              >
                Tokyo
              </span>
              <span 
                onClick={() => handleExampleCityClick('Paris')} 
                className="city-example"
              >
                Paris
              </span>
            </div>
          </div>
        </div>
      )}

      {weather && !loading && (
        <div className={`weather-info ${getBackgroundClass(weather.weatherMain)}`}>
          <div className="weather-location">
            <h2>📍 {weather.city}, {weather.country}</h2>
          </div>
          
          <div className="weather-main">
            <div className="weather-icon-section">
              <img 
                src={getWeatherIcon(weather.icon)} 
                alt={weather.description}
                className="weather-icon"
              />
              <span className="weather-emoji">{getWeatherEmoji(weather.weatherMain)}</span>
            </div>
            
            <div className="temperature-section">
              <div className="main-temperature">{weather.temperature}°C</div>
              <div className="feels-like">Feels like {weather.feelsLike}°C</div>
              <div className="description">{weather.description}</div>
            </div>
          </div>
          
          <div className="weather-details">
            <div className="detail-card">
              <div className="detail-icon">💧</div>
              <div className="detail-content">
                <span className="detail-label">Humidity</span>
                <span className="detail-value">{weather.humidity}%</span>
              </div>
            </div>
            
            <div className="detail-card">
              <div className="detail-icon">💨</div>
              <div className="detail-content">
                <span className="detail-label">Wind Speed</span>
                <span className="detail-value">{weather.windSpeed} km/h</span>
              </div>
            </div>
          </div>

          <div className="back-to-home">
            <button onClick={handleBackToHome} className="back-button">
              ← Search Another City
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Weather; 