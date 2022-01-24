interface OpenWeatherMapErrorResponse {
  cod: number | string;
  message: string;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface OpenWeatherMapSuccessResponse {
}

interface Sun {
  sunrise: number;
  sunset: number;
}

interface Moon {
  moonrise: number;
  moonset: number;
  moon_phase: number;
}

interface Precipitation {
  pop: number; // Probability of precipitation
}

interface LastHour {
  rain?: { '1h': number }; // Rain volume for last hour (mm)
  snow?: { '1h': number }; // Snow volume for last hour (mm)
}

export interface OpenWeatherMapWeather {
  dt: number;
  temp: number | { min: number; max: number; day: number; night: number }; // (°C)
  feels_like: number | { day: number; night: number }; // (°C)
  pressure: number; // hPa
  humidity: number; // %
  dew_point: number; // (°C)
  uvi: number;
  clouds: number; // (%)
  visibility: number; // (m)
  wind_speed: number; // m/s
  wind_gust: number; // m/s
  wind_deg: number; // 0-360 degrees
  // more than one weather condition for a requested location possible. 1st condition is primary
  weather: { id: number; main: string; description: string; icon: string }[];
}

type OneCallCurrent = OpenWeatherMapWeather & Sun;

interface OneCallMinutely {
  dt: number;
  precipitation: number; // (mm)
}

type OneCallHourly = OpenWeatherMapWeather & Precipitation & LastHour;

type OneCallDaily = OpenWeatherMapWeather & Sun & Moon & Precipitation & LastHour;

export interface OpenWeatherMapOneCallResponse extends OpenWeatherMapSuccessResponse {
  lat: number;
  lon: number;
  timezone: string;
  current: OneCallCurrent;
  minutely: OneCallMinutely[];
  hourly: OneCallHourly[];
  daily: OneCallDaily[];
}
