import { Inject } from 'typescript-ioc';
import { GoogleMapsCrawler } from './maps-crawler';

export interface LatLng {
  latitude: number;
  longitude: number;
}

export class TravelTimeService {

  @Inject
  crawler: GoogleMapsCrawler;

  async getDurations(origin: LatLng, destination: LatLng): Promise<number[]> {
    return await this.crawler.crawl(origin, destination);
  }

}
