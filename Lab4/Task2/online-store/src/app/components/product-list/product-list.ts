import {
  Component,
  DestroyRef,
  Inject,
  OnInit,
  PLATFORM_ID,
  inject,
  signal,
} from '@angular/core';
import { CommonModule, DatePipe, isPlatformBrowser } from '@angular/common';
import {
  animate,
  query,
  stagger,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmSkeletonImports } from '@spartan-ng/helm/skeleton';

import { ProductCardComponent } from '../product-card/product-card';
import { KaspiCachePayload, Product } from '../../models/product.model';
import { KaspiParserService } from '../../services/kaspi-parser.service';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DatePipe,
    ProductCardComponent,
    HlmButtonImports,
    HlmInputImports,
    HlmCardImports,
    HlmSkeletonImports,
  ],
  templateUrl: './product-list.html',
  styleUrl: './product-list.css',
  animations: [
    trigger('listStagger', [
      transition('* => *', [
        query(
          '.product-tile',
          [
            style({ opacity: 0, transform: 'translateY(20px)' }),
            stagger(
              80,
              animate(
                '420ms cubic-bezier(0.22, 1, 0.36, 1)',
                style({ opacity: 1, transform: 'translateY(0px)' }),
              ),
            ),
          ],
          { optional: true },
        ),
      ]),
    ]),
  ],
})
export class ProductListComponent implements OnInit {
  private static readonly CACHE_KEY = 'kaspi_ram_cache_v1';
  private static readonly DEFAULT_COUNT = 10;

  readonly kaspiCategoryUrl =
    'https://kaspi.kz/shop/c/ram/?q=%3Acategory%3ARAM%3Aprice%3A%D0%B1%D0%BE%D0%BB%D0%B5%D0%B5%20500%20000%20%D1%82%3AavailableInZones%3AMagnum_ZONE1&sort=relevance&sc=';

  private readonly parserService = inject(KaspiParserService);
  private readonly destroyRef = inject(DestroyRef);

  readonly products = signal<Product[]>([]);
  readonly loading = signal(false);
  readonly error = signal('');
  readonly lastUpdatedISO = signal<string | null>(null);
  readonly hasValidCache = signal(false);

  count = ProductListComponent.DEFAULT_COUNT;

  constructor(@Inject(PLATFORM_ID) private readonly platformId: object) {}

  ngOnInit(): void {
    this.ensureDarkClass();
    this.loadCacheIfValid();
  }

  loadFromKaspi(): void {
    this.error.set('');
    this.loading.set(true);
    this.count = this.clampCount(this.count);

    this.parserService
      .loadProductsWithMeta(this.kaspiCategoryUrl, this.count)
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (response) => {
          this.products.set(response.products);
          this.lastUpdatedISO.set(response.fetchedAtISO);
          this.writeCache({
            url: this.kaspiCategoryUrl,
            count: this.count,
            fetchedAtISO: response.fetchedAtISO,
            expiresAtISO: this.computeExpiresAtISO(),
            products: response.products,
          });
          this.hasValidCache.set(true);
        },
        error: (err: unknown) => {
          const message = this.extractErrorMessage(err);
          this.error.set(message);
        },
      });
  }

  useCache(): void {
    const cache = this.readCache();
    if (!cache) {
      this.error.set('No cached products found.');
      return;
    }

    if (!this.isCacheValid(cache)) {
      this.error.set('Cached data has expired. Click “Load from Kaspi”.');
      this.hasValidCache.set(false);
      return;
    }

    this.applyCache(cache);
    this.error.set('');
  }

  clearCache(): void {
    if (this.isBrowser()) {
      localStorage.removeItem(ProductListComponent.CACHE_KEY);
    }

    this.hasValidCache.set(false);
    this.error.set('Cache cleared.');
  }

  trackByProductId(_index: number, product: Product): number {
    return product.id;
  }

  skeletonCards(): number[] {
    const total = Math.min(12, Math.max(4, this.count));
    return Array.from({ length: total }, (_, idx) => idx);
  }

  private loadCacheIfValid(): void {
    const cache = this.readCache();
    if (!cache) {
      this.hasValidCache.set(false);
      return;
    }

    if (!this.isCacheValid(cache)) {
      this.hasValidCache.set(false);
      return;
    }

    this.applyCache(cache);
    this.hasValidCache.set(true);
  }

  private applyCache(cache: KaspiCachePayload): void {
    this.products.set(cache.products);
    this.count = cache.count;
    this.lastUpdatedISO.set(cache.fetchedAtISO);
  }

  private readCache(): KaspiCachePayload | null {
    if (!this.isBrowser()) {
      return null;
    }

    const raw = localStorage.getItem(ProductListComponent.CACHE_KEY);
    if (!raw) {
      return null;
    }

    try {
      const parsed = JSON.parse(raw) as Partial<KaspiCachePayload>;
      if (!this.isCacheShape(parsed)) {
        return null;
      }

      return parsed;
    } catch {
      return null;
    }
  }

  private writeCache(cache: KaspiCachePayload): void {
    if (!this.isBrowser()) {
      return;
    }

    localStorage.setItem(ProductListComponent.CACHE_KEY, JSON.stringify(cache));
    document.cookie = `kaspi_ram_cache_saved=true; path=/; max-age=${60 * 60 * 24}`;
  }

  private isCacheValid(cache: KaspiCachePayload): boolean {
    const expires = Date.parse(cache.expiresAtISO);
    if (!(Number.isFinite(expires) && Date.now() < expires && cache.products.length > 0)) {
      return false;
    }

    return !cache.products.some((product) => {
      const hasLegacyLink = product.link.includes('kaspi.kz/p/');
      const hasLegacyDescription = product.description.includes('high-end RAM module');
      return hasLegacyLink || hasLegacyDescription;
    });
  }

  private computeExpiresAtISO(): string {
    const now = new Date();
    const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);

    return new Date(Math.min(in24h.getTime(), endOfDay.getTime())).toISOString();
  }

  private clampCount(value: number): number {
    if (!Number.isFinite(value)) {
      return ProductListComponent.DEFAULT_COUNT;
    }

    return Math.min(50, Math.max(1, Math.floor(value)));
  }

  private isCacheShape(payload: Partial<KaspiCachePayload>): payload is KaspiCachePayload {
    return (
      typeof payload.url === 'string' &&
      typeof payload.count === 'number' &&
      typeof payload.fetchedAtISO === 'string' &&
      typeof payload.expiresAtISO === 'string' &&
      Array.isArray(payload.products)
    );
  }

  private extractErrorMessage(err: unknown): string {
    if (typeof err === 'object' && err !== null && 'error' in err) {
      const maybeError = (err as { error?: { error?: string } }).error?.error;
      if (typeof maybeError === 'string') {
        return maybeError;
      }
    }

    return 'Could not load products from Kaspi right now.';
  }

  private ensureDarkClass(): void {
    if (!this.isBrowser()) {
      return;
    }

    document.documentElement.classList.add('dark');
  }

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }
}
