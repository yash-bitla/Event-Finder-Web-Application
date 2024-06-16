import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  RequiredValidator,
  Validators,
} from '@angular/forms';
import { ApiClientService } from '../api-client.service';
import { EventsRequest, Event, EventsResponse } from '../event';
import {
  debounceTime,
  tap,
  switchMap,
  finalize,
  distinctUntilChanged,
  filter,
} from 'rxjs/operators';
import { coordinates } from '../eventDetails';
import * as e from 'express';

@Component({
  selector: 'app-search-form',
  templateUrl: './search-form.component.html',
  styleUrls: ['./search-form.component.css'],
  providers: [ApiClientService],
})
export class SearchFormComponent implements OnInit {
  formSearch!: FormGroup;
  events!: Event[];
  keywordCtrl = new FormControl();
  suggestions: string[] | undefined | null = null;
  isLoading = false;
  selectedKeyword: any = '';
  resultsFetched = false;

  constructor(private _fb: FormBuilder, private apiClient: ApiClientService) {}
  ngOnInit(): void {
    this.formSearch = this._fb.group({
      keyword: ['', Validators.required],
      distance: 10,
      category: 0,
      location: ['', Validators.required],
      autoDetect: false,
    });
    this.keywordCtrl.valueChanges
      .pipe(
        filter((res) => {
          return res;
        }),
        distinctUntilChanged(),
        debounceTime(800),
        tap(() => {
          this.suggestions = null;
          this.isLoading = true;
          this.resultsFetched = false;
        }),
        switchMap((value) =>
          this.apiClient.getOptions(value).pipe(
            finalize(() => {
              this.isLoading = false;
            })
          )
        )
      )
      .subscribe((data: string[]) => {
          this.suggestions = data;
      });

    this.formSearch.get('autoDetect')?.valueChanges.subscribe((value) => {
      if (value) {
        this.formSearch.get('location')?.disable();
        this.formSearch.get('location')?.setValue(undefined);
        this.formSearch.get('location')?.removeValidators(Validators.required);
      } else {
        this.formSearch.get('location')?.enable();
        this.formSearch.get('location')?.addValidators(Validators.required);
      }
    });
  }

  onSelected() {
    this.selectedKeyword = this.selectedKeyword;
  }

  fetchEvents(inputs: FormGroup) {
    this.resultsFetched = false;
    var coordinates = undefined;
    if (inputs.value['autoDetect']) {
      this.apiClient.getUserLocation().subscribe((response: coordinates) => {
        coordinates = response;
        this.apiClient
          .getEvents({
            keyword: inputs.value['keyword'],
            distance: inputs.value['distance'],
            category: inputs.value['category'],
            lat: coordinates?.lat ?? 34.01435852,
            lng: coordinates?.lng ?? -118.28910828,
          })
          .pipe(finalize(() => {
            this.resultsFetched = true;
          }))
          .subscribe((response) => this.setEvents(response));
      });
    } else {
      this.apiClient
        .getCoordinates(inputs.value['location'])
        .subscribe((response) => {
          let coordinates = response.results[0].geometry.location as unknown as coordinates;
          this.apiClient
            .getEvents({
              keyword: inputs.value['keyword'],
              distance: inputs.value['distance'],
              category: inputs.value['category'],
              lat: coordinates?.lat ?? 34.01435852,
              lng: coordinates?.lng ?? -118.28910828,
            })
            .subscribe((response) => this.setEvents(response));
        });
    }
  }

  setEvents(response: EventsResponse) {
    this.events = response.events?.sort((a,b) => new Date(a.date).getDate() - new Date(b.date).getDate());
  }

  clearEvents() {
    this.events = [];
    this.selectedKeyword = '';
  }
}
