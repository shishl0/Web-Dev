import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { Router } from '@angular/router';
import { AlbumService } from '../../services/album.service';
import { Album } from '../../models/album.model';

@Component({
  selector: 'app-albums',
  standalone: true,
  imports: [NgIf, NgFor],
  templateUrl: './albums.html',
  styleUrl: './albums.css'
})
export class Albums implements OnInit {
  albums: Album[] = [];
  loading = true;
  error = '';

  constructor(
    private albumService: AlbumService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.albumService.getAlbums().subscribe({
      next: (data) => {
        this.albums = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'Failed to load albums';
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  open(id: number) {
    this.router.navigate(['/albums', id]);
  }

  delete(id: number, e: MouseEvent) {
    e.stopPropagation();
    this.albumService.deleteAlbum(id).subscribe({
      next: () => {
        this.albums = this.albums.filter((a) => a.id !== id);
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'Delete failed';
        this.cdr.detectChanges();
      },
    });
  }
}
