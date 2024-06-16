export interface Event {
  id: string;
  date: string;
  event_name: string;
  genre: string;
  icon: string | undefined;
  time: string | undefined;
  venue: string;
}

export interface EventsRequest {
  keyword: string;
  category: number | undefined;
  distance: number | undefined;
  lat: number;
  lng: number;
}

export interface EventsResponse {
  StatusCode: string | undefined;
  events: Event[];
}
