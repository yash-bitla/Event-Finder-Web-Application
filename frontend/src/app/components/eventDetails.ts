export interface EventDetails {
    id: string;
    name: string;
    date: string;
    time: string;
    artists: Artist[];
    venue: string;
    genre: string;
    price_range: string;
    ticket_status: string;
    buy_at: string;
    seat_map: string;
    artist_concat: string;
}

export interface Artist {
    name: string;
    upcoming_events: string;
    musicRelated: boolean;
}

export interface ArtistDetails {
    name: string;
    followers: string | number;
    popularity: number;
    spotifyLink: string | undefined;
    profile_image: Image;
    album_images: Image[];
}

export interface Image {
    url: string;
}

export interface VenueDetails {
    name: string;
    address: string;
    city: string;
    phone: string;
    openHours: string;
    generalRule: string;
    childRule: string;

}

export class GeocoderResponse {
    status: string;
    error_message!: string;
    results: google.maps.GeocoderResult[];
  
    constructor(status: string, results: google.maps.GeocoderResult[]) {
      this.status = status;
      this.results = results;
    }
  }

export interface coordinates {
    loc: string;
    lat: number;
    lng: number;
}
