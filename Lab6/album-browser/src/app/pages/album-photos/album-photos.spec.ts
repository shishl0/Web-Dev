import { ComponentFixture, TestBed } from '@angular/core/testing';
import { convertToParamMap } from '@angular/router';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { AlbumPhotos } from './album-photos';
import { AlbumService } from '../../services/album.service';

describe('AlbumPhotos', () => {
  let component: AlbumPhotos;
  let fixture: ComponentFixture<AlbumPhotos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AlbumPhotos],
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
            getAlbumPhotos: () => of([]),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AlbumPhotos);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
