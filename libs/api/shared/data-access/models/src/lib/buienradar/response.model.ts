interface BuienradarForecastItem {
  datetime: string;
  utcdatetime: string;
  precipitation: number;
  original: number;
  value: number;
}

export interface BuienradarRainHistoryForecastResponse {
  color: string;
  lat: number;
  lon: number;
  borders: any[];
  timeOffset: number;
  radius: number;
  forecasts: BuienradarForecastItem[];
  emptytext: string;
  createdUtc: string;
  lastRefreshUtc: string;
  elapsedMs: number;
}
