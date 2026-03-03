import { ComponentFixture, TestBed } from '@angular/core/testing';
import { convertToParamMap } from '@angular/router';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { AlbumDetail } from './album-detail';
import { AlbumService } from '../../services/album.service';

describe('AlbumDetail', () => {
  let component: AlbumDetail;
  let fixture: ComponentFixture<AlbumDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AlbumDetail],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: convertToParamMap({ id: '1' }),
            },
          },
        },
        {
          provide: AlbumService,
          useValue: {
            getAlbum: () => of({ id: 1, userId: 1, title: 'test album' }),
            updateAlbum: (album: { id: number; userId: number; title: string }) => of(album),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AlbumDetail);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
