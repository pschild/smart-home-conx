import { Injectable } from '@nestjs/common';
import { BuienradarRainHistoryForecastResponse } from '@smart-home-conx/api/shared/data-access/models';

@Injectable()
export class BuienradarRainHistoryForecastMapper {

  mapToResponse(response: BuienradarRainHistoryForecastResponse): { datetime: Date; precipitation: number }[] {
    return response.forecasts.map(forecast => ({ datetime: new Date(forecast.utcdatetime), precipitation: forecast.precipitation }));
  }
}
