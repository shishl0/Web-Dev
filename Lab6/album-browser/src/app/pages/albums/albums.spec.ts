import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { Albums } from './albums';
import { AlbumService } from '../../services/album.service';

describe('Albums', () => {
  let component: Albums;
  let fixture: ComponentFixture<Albums>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Albums],
      providers: [
        provideRouter([]),
        {
          provide: AlbumService,
          useValue: {
            getAlbums: () => of([]),
            deleteAlbum: () => of(void 0),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Albums);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
