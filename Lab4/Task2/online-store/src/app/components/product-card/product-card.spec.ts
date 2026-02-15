import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductCardComponent } from './product-card';

describe('ProductCardComponent', () => {
  let component: ProductCardComponent;
  let fixture: ComponentFixture<ProductCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductCardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductCardComponent);
    component = fixture.componentInstance;
    component.product = {
      id: 1,
      name: 'Test RAM',
      description: 'desc',
      price: 1,
      rating: 4.7,
      image: 'https://example.com/image.jpg',
      images: ['https://example.com/image.jpg', 'https://example.com/image.jpg'],
      link: 'https://kaspi.kz/shop/p/example-1/',
    };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
