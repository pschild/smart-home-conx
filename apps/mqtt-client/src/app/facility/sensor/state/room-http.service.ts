import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { RoomModel } from '@smart-home-conx/api/shared/data-access/models';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RoomHttpService {

  constructor(private httpClient: HttpClient) { }

  loadAll(): Observable<RoomModel[]> {
    return this.httpClient.get<RoomModel[]>(`device/room`);
  }

}
