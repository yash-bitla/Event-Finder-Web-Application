import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FavoritespageComponent } from './favoritespage.component';

describe('FavoritespageComponent', () => {
  let component: FavoritespageComponent;
  let fixture: ComponentFixture<FavoritespageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FavoritespageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FavoritespageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
