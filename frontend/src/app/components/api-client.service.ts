import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';

import { Observable } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { EventsRequest, EventsResponse } from './event';
import {
  Artist,
  ArtistDetails,
  coordinates,
  EventDetails,
  GeocoderResponse,
  VenueDetails,
} from './eventDetails';
import { response } from 'express';

@Injectable({
  providedIn: 'root',
})
export class ApiClientService {
  constructor(private http: HttpClient) {}

  getEvents(eventsRequest: EventsRequest): Observable<EventsResponse> {
    // TODO: add validation
    const httpParams = new HttpParams()
      .set('keyword', eventsRequest.keyword)
      .set('distance', eventsRequest.distance ? eventsRequest.distance : 10)
      .set('category', eventsRequest.category ? eventsRequest.category : 0)
      .set('lat', eventsRequest.lat)
      .set('lng', eventsRequest.lng);
    // Add safe, URL encoded search parameter if there is a search term
    const options = { params: httpParams };
    return this.http.get<EventsResponse>('/api/events?', options);
  }

  getOptions(keyword: string): Observable<string[]> {
    const httpParams = new HttpParams().set('keyword', keyword);

    return this.http.get<string[]>('/api/suggestions', { params: httpParams });
  }

  getEventDetails(id: string): Observable<EventDetails> {
    return this.http.get<EventDetails>('/api/event/' + id);
  }

  getArtistDetails(artists: Artist[]): ArtistDetails[] {
    const artistDetails: ArtistDetails[] = [];
    artists.forEach((artist) => {
      if (artist.musicRelated) {
        const httpParams = new HttpParams().set('keyword', artist.name);
        this.http
          .get<ArtistDetails>('/api/artist?', { params: httpParams })
          .subscribe((response) => artistDetails.push(response));
      }
    });
    return artistDetails;
  }

  getVenueDetails(venueName: string): Observable<VenueDetails> {
    const httpParams = new HttpParams().set('keyword', venueName);
    return this.http.get<VenueDetails>('api/venue?', { params: httpParams });
  }

  getCoordinates(address: string): Observable<GeocoderResponse> {
    const returnCoord = undefined;
    const httpParams = new HttpParams()
      .set('address', address)
      .set('key', 'AIzaSyD7ayDztnEqzwGuK6OahY-rfPVse1Jl64c');
    return this.http.get<GeocoderResponse>(
      'https://maps.googleapis.com/maps/api/geocode/json?',
      { params: httpParams }
    );
  }

  getUserLocation(): Observable<coordinates> {
    return this.http
      .get<coordinates>('https://ipinfo.io/json?token=8beb29bb574a11')
      .pipe(
        map((data) => {
          let latlng = data.loc.split(',');
          data.lat = Number(latlng[0]);
          data.lng = Number(latlng[1]);
          return data;
        })
      );
  }
}
