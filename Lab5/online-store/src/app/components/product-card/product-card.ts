import {
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  computed,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';

import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';

import { Product } from '../../models/product.model';
import { MotionHoverDirective } from '../../directives/motion-hover.directive';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, HlmButtonImports, HlmCardImports, MotionHoverDirective],
  templateUrl: './product-card.html',
  styleUrl: './product-card.css',
  animations: [
    trigger('imageSwap', [
      transition('* <=> *', [
        style({ opacity: 0, transform: 'scale(0.985)' }),
        animate('220ms ease-out', style({ opacity: 1, transform: 'scale(1)' })),
      ]),
    ]),
  ],
})
export class ProductCardComponent implements OnChanges {
  @Input({ required: true }) product!: Product;

  readonly selectedImage = signal('');

  readonly roundedRating = computed(() => Number(this.product.rating.toFixed(1)));

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['product']) {
      this.selectedImage.set(this.product.image || this.product.images[0] || '');
    }
  }

  selectImage(url: string): void {
    this.selectedImage.set(url);
  }

  get stars(): boolean[] {
    const rounded = Math.round(this.product.rating);
    return Array.from({ length: 5 }, (_, index) => index < rounded);
  }

  whatsappShareUrl(): string {
    const text = `${this.product.name} — ${this.product.link}`;
    return `https://wa.me/?text=${encodeURIComponent(text)}`;
  }

  telegramShareUrl(): string {
    const text = `${this.product.name} • ${this.product.price.toLocaleString('ru-RU')} ₸`;
    return `https://t.me/share/url?url=${encodeURIComponent(this.product.link)}&text=${encodeURIComponent(text)}`;
  }

  formatPrice(value: number): string {
    return new Intl.NumberFormat('ru-RU').format(value).replace(/\u00A0/g, ' ');
  }
}
