import { Injectable } from '@nestjs/common';
import { from, Observable } from 'rxjs';
import { GoogleMapsCrawler } from './maps-crawler';

export interface LatLng {
  latitude: number;
  longitude: number;
}

@Injectable()
export class TravelTimeService {

  constructor(private readonly crawler: GoogleMapsCrawler) {}

  getDurations(origin: LatLng, destination: LatLng): Observable<number[]> {
    return from(this.crawler.crawl(origin, destination));
  }

}
