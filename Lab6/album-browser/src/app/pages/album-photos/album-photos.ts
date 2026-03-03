import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AlbumService } from '../../services/album.service';
import { Photo } from '../../models/photo.model';

@Component({
  selector: 'app-album-photos',
  standalone: true,
  imports: [NgIf, NgFor],
  templateUrl: './album-photos.html',
  styleUrl: './album-photos.css',
})
export class AlbumPhotos implements OnInit {
  albumId = 0;
  photos: Photo[] = [];
  loading = true;
  error = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private albumService: AlbumService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    const rawId = Number(this.route.snapshot.paramMap.get('id'));

    if (!Number.isInteger(rawId) || rawId <= 0) {
      this.error = 'Invalid album id';
      this.loading = false;
      return;
    }

    this.albumId = rawId;
    this.albumService.getAlbumPhotos(this.albumId).subscribe({
      next: (photos) => {
        this.photos = photos;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'Failed to load photos';
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  back(): void {
    this.router.navigate(['/albums', this.albumId]);
  }
}
