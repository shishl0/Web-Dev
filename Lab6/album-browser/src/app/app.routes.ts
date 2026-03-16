import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { About } from './pages/about/about';
import { Albums } from './pages/albums/albums';
import { Name } from './pages/name/name';
import { AlbumDetail } from './pages/album-detail/album-detail';
import { AlbumPhotos } from './pages/album-photos/album-photos';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'home' },
  { path: 'name', component: Name },
  { path: 'home', component: Home },
  { path: 'about', component: About },
  { path: 'albums', component: Albums },
  { path: 'albums/:id', component: AlbumDetail },
  { path: 'albums/:id/photos', component: AlbumPhotos },

  { path: '**', redirectTo: 'home' },
];