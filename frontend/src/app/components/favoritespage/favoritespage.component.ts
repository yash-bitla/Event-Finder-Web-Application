import { Component, OnInit } from '@angular/core';
import { favorites } from '../favorites';

@Component({
  selector: 'app-favoritespage',
  templateUrl: './favoritespage.component.html',
  styleUrls: ['./favoritespage.component.css']
})
export class FavoritespageComponent implements OnInit {
  favorites: favorites[] = []
  public displayedColumns = ['index', 'date', 'name', 'category', 'venue', 'favorite']
  ngOnInit(): void {
    if (localStorage.getItem('favorites')) {
      this.favorites = JSON.parse(localStorage.getItem('favorites') ?? '');
    }
  }

  delete(row: favorites){
    if (this.favorites.some((e) => e.id === row.id)) {
      let index = this.favorites.findIndex(e => e.id === row.id);
      this.favorites.splice(index, 1);
      localStorage.setItem('favorites', JSON.stringify(this.favorites));
    }
    this.favorites = JSON.parse(localStorage.getItem('favorites') ?? '');
    alert('Removed from Favorites')
  }

  getIndex(fav: favorites){
    return this.favorites.findIndex((f) => f.id === fav.id) + 1
  }
}
