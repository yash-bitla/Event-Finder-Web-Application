import { Component, Input, SimpleChange } from '@angular/core';
import { Event } from '../event'


@Component({
  selector: 'app-events-table',
  templateUrl: './events-table.component.html',
  styleUrls: ['./events-table.component.css']
})
export class EventsTableComponent {
  @Input()
  events!: Event[]; 
  @Input()
  public displayedColumns = ['date', 'icon', 'event_name', 'genre', 'venue']
  public displayTable = true;
  selectedEventId: string = ''
  public eventSelected = false;
  public eventDataFetched = false;
  
  ngOnChanges(changes: { [property: string]: SimpleChange }) {
    let change: SimpleChange = changes['events'];
    this.displayTable = true;
    this.eventSelected = false;
    this.eventDataFetched = false;
    this.selectedEventId = ''
  }

  onClickEvent(row: Event){
    let test = Object.assign({}, row);
    this.selectedEventId = row.id;
    this.eventSelected = true;
    this.displayTable = false;
  }

  onClickBack(){
    this.displayTable = true;
    this.eventSelected = false;
  }

  dataFetched(){
    this.eventDataFetched = true;
  }
}
