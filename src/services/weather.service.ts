import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const apiUrl = process.env.OPENWEATHER_URL!;
const geoUrl = process.env.OPENWEATHER_GEO_URL!;
const apiKey = process.env.OPENWEATHER_API_KEY!;

export type WeatherData = {
  coord: { lon: number; lat: number };
  weather: { id: number; main: string; description: string; icon: string }[];
  base: string;
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
    humidity: number;
    sea_level?: number;
    grnd_level?: number;
  };
  visibility: number;
  wind: { speed: number; deg: number; gust?: number };
  clouds: { all: number };
  dt: number;
  sys: {
    type?: number;
    id?: number;
    country: string;
    sunrise: number;
    sunset: number;
  };
  timezone: number;
  id: number;
  name: string;
  cod: number;
};

type GeoData = {
  name: string;
  lat: number;
  lon: number;
  country: string;
  state?: string;
}[];

export async function getWeatherFor(city: string) {
  // Primero, obtener las coordenadas de la ciudad
  const geoResponse = await axios.get<GeoData>(
    `${geoUrl}/direct?q=${encodeURIComponent(city)}&limit=1&appid=${apiKey}`
  );

  if (geoResponse.data.length === 0) {
    return { found: false, message: "Ubicación no encontrada" };
  }

  const { lat, lon, name, country } = geoResponse.data[0];

  // Luego, obtener el clima actual
  const weatherResponse = await axios.get<WeatherData>(
    `${apiUrl}/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=es`
  );

  const weather = weatherResponse.data;

  console.log("response weather data 2.5 = ", weather);

  return {
    found: true,
    location: `${name}, ${country}`,
    weather,
  };
}

export async function getCoordinatesFor(city: string) {
  const geoResponse = await axios.get<GeoData>(
    `${geoUrl}/direct?q=${encodeURIComponent(city)}&limit=1&appid=${apiKey}`
  );

  if (geoResponse.data.length === 0) {
    return { found: false, message: "Ubicación no encontrada" };
  }

  const { lat, lon } = geoResponse.data[0];
  return { found: true, lat, lon };
}
