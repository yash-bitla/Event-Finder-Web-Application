import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FavoritespageComponent } from './components/favoritespage/favoritespage.component';
import { SearchpageComponent } from './components/searchpage/searchpage.component';


const routes: Routes = [
  { path: 'search', component: SearchpageComponent },
  { path: 'favorites', component: FavoritespageComponent },
  { path: '',   redirectTo: 'search', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
