export interface OneCallResponse {
  current: WeatherDataResponse;
  forecast: {
    minutely: { datetime: Date; precipitation: number; }[];
    hourly: ({ precipitationProbability: number; rain?: number; snow?: number; } & WeatherDataResponse)[];
    daily: ({ precipitationProbability: number; rain?: number; snow?: number; } & WeatherDataResponse)[];
  };
  alerts?: AlertResponse[];
}

export interface WeatherDataResponse {
  datetime: Date;
  temp: number | { min: number; max: number; day: number; night: number };
  humidity: number;
  clouds: number;
  weather: { id: number; description: string; };
}

interface AlertResponse {
  sender_name: string;
  event: string;
  start: number;
  end: number;
  description: string;
}
