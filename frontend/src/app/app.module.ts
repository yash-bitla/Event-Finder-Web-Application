import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SearchpageComponent } from './components/searchpage/searchpage.component';
import { FavoritespageComponent } from './components/favoritespage/favoritespage.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { SearchFormComponent } from './components/search-form/search-form.component';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { EventsTableComponent } from './components/events-table/events-table.component';
import { MatTableModule } from '@angular/material/table';
import { EventsDetailsComponent } from './components/events-details/events-details.component';
import { CarouselModule } from 'ngx-bootstrap/carousel';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import { GoogleMapsModule } from '@angular/google-maps';
import { ModalModule, BsModalService } from 'ngx-bootstrap/modal';


@NgModule({
  declarations: [
    AppComponent,
    SearchpageComponent,
    FavoritespageComponent,
    NavbarComponent,
    SearchFormComponent,
    EventsTableComponent,
    EventsDetailsComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    BrowserAnimationsModule,
    MatAutocompleteModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatTableModule,
    CarouselModule,
    MatProgressSpinnerModule,
    GoogleMapsModule,
    ModalModule
  ],
  providers: [BsModalService],
  bootstrap: [AppComponent],
})
export class AppModule {}
