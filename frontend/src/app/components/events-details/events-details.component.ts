import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  SimpleChange,
  TemplateRef,
} from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { finalize, Observable, Subscription, switchMap } from 'rxjs';
import { ApiClientService } from '../api-client.service';
import { Event } from '../event';
import {
  EventDetails,
  ArtistDetails,
  VenueDetails
} from '../eventDetails';
import { favorites } from '../favorites';

@Component({
  selector: 'app-events-details',
  templateUrl: './events-details.component.html',
  styleUrls: ['./events-details.component.css'],
})
export class EventsDetailsComponent {
  constructor(
    private apiClient: ApiClientService,
    private modalService: BsModalService
  ) {}
  modalRef!: BsModalRef;
  eventDetails!: EventDetails;
  artistsDetails!: ArtistDetails[];
  venueDetails!: VenueDetails;
  carouselAnimated = true
  public ticketStatusColour = new Map<string, string>()
    .set('onsale', 'green')
    .set('offsale', 'red')
    .set('cancelled', 'black')
    .set('postponed', 'orange')
    .set('rescheduled', 'orange');
  public ticketStatus = new Map<string,string>()
    .set('onsale', "On Sale")
    .set('offsale', "Off Sale")
    .set('cancelled', "Cancelled")
    .set('postponed', "Postponed")
    .set('rescheduled', "Rescheduled")
  public showingMore = {
    openHours: false,
    generalRule: false,
    childRule: false,
  };
  coordinates!: google.maps.LatLng;
  favorites: favorites[] = [];
  isFavorite: boolean = false;
  @Input()
  eventId!: string;
  @Output()
  onClickBack = new EventEmitter();
  @Output()
  onDataFetched = new EventEmitter();
  

  ngOnChanges(changes: { [property: string]: SimpleChange }) {
    let change: SimpleChange = changes['eventId'];
    this.fetchData();
    this.isFavorite = this.checkFavorite() ?? false;
  }

  fetchData() {
    if (this.eventId){
    this.apiClient.getEventDetails(this.eventId).subscribe((response) => {
      this.eventDetails = response;
      this.artistsDetails = this.apiClient.getArtistDetails(response.artists);
      this.apiClient.getVenueDetails(response.venue).subscribe((response) => {
        this.venueDetails = response;
        this.apiClient
          .getCoordinates(response.address + response.city)
          .subscribe((response) => {
            this.coordinates = response.results[0].geometry.location
            this.onDataFetched.emit();
          });
      });
    });
  }
}

  handleBackClick() {
    this.onClickBack.emit();
  }

  getPillColor() {
    return this.ticketStatusColour.get(this.eventDetails.ticket_status);
  }

  getPillTitle() {
    return this.ticketStatus.get(this.eventDetails.ticket_status);
  }

  onClickShow(value: 'openHours' | 'generalRule' | 'childRule') {
    if (value === 'openHours') {
      this.showingMore.openHours = !this.showingMore.openHours;
    }
    if (value === 'generalRule') {
      this.showingMore.generalRule = !this.showingMore.generalRule;
    }
    if (value === 'childRule') {
      this.showingMore.childRule = !this.showingMore.childRule;
    }
  }

  trimString(text: string, length: number) {
    return text.length > length ? text.substring(0, length) + '...' : text;
  }

  showMap(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template);
  }

  checkFavorite() {
    if (localStorage.getItem('favorites')) {
      this.favorites = JSON.parse(localStorage.getItem('favorites') ?? '');
      return this.favorites.some((e) => e.id === this.eventId)
    }
    return false;
  }

  addItemToFavorites() {
    if (localStorage.getItem('favorites')) {
      this.favorites = JSON.parse(localStorage.getItem('favorites') ?? '');
    }
    if (!this.favorites.some((e) => e.id === this.eventDetails.id)) {
      this.favorites.push({
        id: this.eventDetails.id,
        date: this.eventDetails.date,
        name: this.eventDetails.name,
        category: this.eventDetails.genre,
        venue: this.eventDetails.venue,
      });
      localStorage.setItem('favorites', JSON.stringify(this.favorites));
    }
    this.isFavorite = true;
    alert('Event Added to Favorites')
  }

  removeItemFromFavorites() {
    if (localStorage.getItem('favorites')) {
      this.favorites = JSON.parse(localStorage.getItem('favorites') ?? '');
    }
    if (this.favorites.some((e) => e.id === this.eventDetails.id)) {
      let index = this.favorites.findIndex(e => e.id === this.eventDetails.id);
      this.favorites.splice(index, 1);
      localStorage.setItem('favorites', JSON.stringify(this.favorites));
    }
    this.isFavorite = false;
    alert('Removed from Favorites')
  }
}
