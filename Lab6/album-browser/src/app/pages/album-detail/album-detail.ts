import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { NgIf } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AlbumService } from '../../services/album.service';
import { Album } from '../../models/album.model';

@Component({
  selector: 'app-album-detail',
  standalone: true,
  imports: [NgIf, FormsModule],
  templateUrl: './album-detail.html',
  styleUrl: './album-detail.css',
})
export class AlbumDetail implements OnInit {
  album?: Album;
  loading = true;
  saving = false;
  error = '';
  newTitle = '';
  albumId = 0;

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
    this.albumService.getAlbum(this.albumId).subscribe({
      next: (album) => {
        this.album = album;
        this.newTitle = album.title;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'Failed to load album';
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  save(): void {
    if (!this.album) {
      return;
    }

    const title = this.newTitle.trim();
    if (!title) {
      this.error = 'Title cannot be empty';
      return;
    }

    this.error = '';
    this.saving = true;

    const updated: Album = { ...this.album, title };
    this.albumService.updateAlbum(updated).subscribe({
      next: (saved) => {
        this.album = saved;
        this.newTitle = saved.title;
        this.saving = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'Save failed';
        this.saving = false;
        this.cdr.detectChanges();
      },
    });
  }

  viewPhotos(): void {
    this.router.navigate(['/albums', this.albumId, 'photos']);
  }

  back(): void {
    this.router.navigate(['/albums']);
  }
}
