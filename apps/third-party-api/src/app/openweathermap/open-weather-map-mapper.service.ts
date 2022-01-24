import { Injectable } from '@nestjs/common';
import { OneCallResponse, WeatherDataResponse } from '@smart-home-conx/api/shared/data-access/models';
import { OpenWeatherMapOneCallResponse, OpenWeatherMapWeather } from './model/open-weather-map-response.model';

@Injectable()
export class OpenWeatherMapMapper {

  mapToResponse(response: OpenWeatherMapOneCallResponse): OneCallResponse {
    return {
      current: this.mapWeather(response.current),
      forecast: {
        minutely: response.minutely.map(e => ({ datetime: new Date(e.dt * 1000), precipitationProbability: e.precipitation })),
        hourly: response.hourly.map(e => ({ ...this.mapWeather(e), precipitationProbability: e.pop, rain: this.getValueForLastHour(e.rain), snow: this.getValueForLastHour(e.snow) })),
        daily: response.daily.map(e => ({ ...this.mapWeather(e), precipitationProbability: e.pop, rain: this.getValueForLastHour(e.rain), snow: this.getValueForLastHour(e.snow) }))
      }
    };
  }

  private mapWeather(weatherData: OpenWeatherMapWeather): WeatherDataResponse {
    return {
      datetime: new Date(weatherData.dt * 1000),
      temp: weatherData.temp,
      humidity: weatherData.humidity,
      clouds: weatherData.clouds,
      weather: {
        id: weatherData.weather[0]?.id,
        description: weatherData.weather[0]?.description
      },
    };
  }

  private getValueForLastHour(value: { '1h': number }): number {
    return value ? value['1h'] : undefined;
  }
}
