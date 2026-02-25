import {
  Component,
  HostListener,
  Inject,
  OnInit,
  PLATFORM_ID,
  computed,
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
import { firstValueFrom } from 'rxjs';

import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmSkeletonImports } from '@spartan-ng/helm/skeleton';

import { ProductCardComponent } from '../product-card/product-card';
import { KaspiCachePayload, Product } from '../../models/product.model';
import { KaspiParserService } from '../../services/kaspi-parser.service';

interface KaspiCategory {
  key: 'ram' | 'videocards' | 'cpus';
  label: string;
  breadcrumb: string;
  url: string;
}

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    ProductCardComponent,
    HlmButtonImports,
    HlmCardImports,
    HlmSkeletonImports,
  ],
  templateUrl: './product-list.html',
  styleUrl: './product-list.css',
  animations: [
    trigger('listStagger', [
      transition('* => *', [
        query(
          ':enter',
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
  private static readonly CACHE_KEY_PREFIX = 'kaspi_category_cache_v3';
  private static readonly BATCH_SIZE = 10;
  private static readonly MAX_PAGE = 50;
  private static readonly EMPTY_PAGE_SCAN_LIMIT = 6;
  private static readonly MAX_TOTAL_PRODUCTS = 120;

  readonly categories: KaspiCategory[] = [
    {
      key: 'ram',
      label: 'RAM',
      breadcrumb: 'Оперативная память',
      url: 'https://kaspi.kz/shop/c/ram/?q=%3Acategory%3ARAM%3Aprice%3A%D0%B1%D0%BE%D0%BB%D0%B5%D0%B5%20500%20000%20%D1%82%3AavailableInZones%3AMagnum_ZONE1&sort=relevance&sc=',
    },
    {
      key: 'videocards',
      label: 'Видеокарты',
      breadcrumb: 'Видеокарты',
      url: 'https://kaspi.kz/shop/c/videocards/?q=%3AavailableInZones%3AMagnum_ZONE1%3Acategory%3AVideocards&sort=relevance&sc=',
    },
    {
      key: 'cpus',
      label: 'Процессоры',
      breadcrumb: 'Процессоры',
      url: 'https://kaspi.kz/shop/c/cpus/?q=%3AavailableInZones%3AMagnum_ZONE1%3Acategory%3ACPUs&sort=relevance&sc=',
    },
  ];

  private readonly parserService = inject(KaspiParserService);

  readonly activeCategory = signal<KaspiCategory>(this.categories[0]);
  readonly products = signal<Product[]>([]);
  readonly loading = signal(false);
  readonly loadingMore = signal(false);
  readonly error = signal('');
  readonly lastUpdatedISO = signal<string | null>(null);
  readonly hasValidCache = signal(false);
  readonly hasMore = signal(true);
  readonly currentPage = signal(1);
  readonly isBusy = computed(() => this.loading() || this.loadingMore());

  readonly breadcrumbs = computed(() => ['Kaspi Каталог', this.activeCategory().breadcrumb]);

  constructor(@Inject(PLATFORM_ID) private readonly platformId: object) {}

  ngOnInit(): void {
    this.ensureDarkClass();
    if (!this.loadCacheIfValid()) {
      void this.loadFromKaspi();
    }
  }

  async loadFromKaspi(): Promise<void> {
    this.error.set('');
    this.currentPage.set(1);
    this.hasMore.set(true);
    await this.fetchPageBatch(1, false);
  }

  async loadMore(): Promise<void> {
    if (!this.hasMore() || this.isBusy()) {
      return;
    }

    await this.fetchPageBatch(this.currentPage() + 1, true);
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

  selectCategory(category: KaspiCategory): void {
    if (this.activeCategory().key === category.key || this.isBusy()) {
      return;
    }

    this.activeCategory.set(category);
    this.products.set([]);
    this.lastUpdatedISO.set(null);
    this.currentPage.set(1);
    this.hasMore.set(true);
    this.error.set('');

    if (!this.loadCacheIfValid()) {
      void this.loadFromKaspi();
    }
  }

  clearCache(): void {
    if (this.isBrowser()) {
      localStorage.removeItem(this.getCacheKey());
    }

    this.hasValidCache.set(false);
    this.error.set('Cache cleared.');
  }

  trackByProductId(_index: number, product: Product): string {
    return `${product.id}::${product.link}`;
  }

  skeletonCards(): number[] {
    return Array.from({ length: ProductListComponent.BATCH_SIZE }, (_, idx) => idx);
  }

  @HostListener('window:scroll')
  onWindowScroll(): void {
    if (!this.isBrowser() || !this.hasMore() || this.isBusy()) {
      return;
    }

    const scrollY = window.scrollY || window.pageYOffset;
    const viewportBottom = scrollY + window.innerHeight;
    const totalHeight = document.documentElement.scrollHeight;
    const threshold = 260;

    if (viewportBottom >= totalHeight - threshold) {
      void this.loadMore();
    }
  }

  private loadCacheIfValid(): boolean {
    const cache = this.readCache();
    if (!cache) {
      this.hasValidCache.set(false);
      return false;
    }

    if (!this.isCacheValid(cache)) {
      this.hasValidCache.set(false);
      return false;
    }

    this.applyCache(cache);
    this.hasValidCache.set(true);
    return true;
  }

  private applyCache(cache: KaspiCachePayload): void {
    this.products.set(cache.products);
    this.lastUpdatedISO.set(cache.fetchedAtISO);
    this.currentPage.set(Math.max(1, cache.page));
    this.hasMore.set(cache.hasMore);
  }

  private readCache(): KaspiCachePayload | null {
    if (!this.isBrowser()) {
      return null;
    }

    const raw = localStorage.getItem(this.getCacheKey());
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

    localStorage.setItem(this.getCacheKey(), JSON.stringify(cache));
    document.cookie = `kaspi_category_cache_saved=true; path=/; max-age=${60 * 60 * 24}`;
  }

  private isCacheValid(cache: KaspiCachePayload): boolean {
    const expires = Date.parse(cache.expiresAtISO);
    const validPage = Number.isFinite(cache.page) && cache.page >= 1;
    if (!(Number.isFinite(expires) && Date.now() < expires && cache.products.length > 0 && validPage)) {
      return false;
    }

    return !cache.products.some((product) => product.link.includes('kaspi.kz/p/'));
  }

  private computeExpiresAtISO(): string {
    const now = new Date();
    const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);

    return new Date(Math.min(in24h.getTime(), endOfDay.getTime())).toISOString();
  }

  private isCacheShape(payload: Partial<KaspiCachePayload>): payload is KaspiCachePayload {
    return (
      typeof payload.url === 'string' &&
      typeof payload.page === 'number' &&
      typeof payload.hasMore === 'boolean' &&
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

  private async fetchPageBatch(startPage: number, append: boolean): Promise<void> {
    this.error.set('');
    this.loading.set(!append);
    this.loadingMore.set(append);

    try {
      const pageData = await this.findFirstNonEmptyPage(startPage);
      if (!pageData) {
        if (append) {
          const previousLength = this.products().length;
          const fallback = await this.fetchWithExpandedCount(this.products().length);
          if (fallback.added > 0) {
            this.products.set(fallback.products);
            this.lastUpdatedISO.set(fallback.fetchedAtISO);
            this.hasMore.set(
              fallback.products.length > previousLength &&
                fallback.products.length < ProductListComponent.MAX_TOTAL_PRODUCTS,
            );
            this.writeCache({
              url: this.activeCategory().url,
              page: this.currentPage(),
              hasMore: this.hasMore(),
              fetchedAtISO: fallback.fetchedAtISO,
              expiresAtISO: this.computeExpiresAtISO(),
              products: fallback.products,
            });
            this.hasValidCache.set(true);
            return;
          }
        }

        this.hasMore.set(false);
        if (this.products().length === 0) {
          this.error.set('Товары не найдены в этой категории.');
        }
        return;
      }

      const pageProducts = pageData.response.products.slice(0, ProductListComponent.BATCH_SIZE);
      const merged = append
        ? this.mergeProducts(this.products(), pageProducts)
        : this.mergeProducts([], pageProducts);

      this.products.set(merged);
      this.currentPage.set(pageData.page);
      this.lastUpdatedISO.set(pageData.response.fetchedAtISO);

      const canLoadMore =
        pageProducts.length === ProductListComponent.BATCH_SIZE &&
        pageData.page < ProductListComponent.MAX_PAGE;

      this.hasMore.set(canLoadMore);
      this.writeCache({
        url: this.activeCategory().url,
        page: this.currentPage(),
        hasMore: this.hasMore(),
        fetchedAtISO: pageData.response.fetchedAtISO,
        expiresAtISO: this.computeExpiresAtISO(),
        products: merged,
      });
      this.hasValidCache.set(true);
    } catch (err: unknown) {
      if (!append || this.products().length === 0) {
        this.error.set(this.extractErrorMessage(err));
      }
    } finally {
      this.loading.set(false);
      this.loadingMore.set(false);
    }
  }

  private async fetchWithExpandedCount(
    currentLength: number,
  ): Promise<{ products: Product[]; added: number; fetchedAtISO: string }> {
    const nextCount = Math.min(
      currentLength + ProductListComponent.BATCH_SIZE,
      ProductListComponent.MAX_TOTAL_PRODUCTS,
    );
    const response = await firstValueFrom(
      this.parserService.loadProductsWithMeta(this.activeCategory().url, nextCount),
    );
    const merged = this.mergeProducts(this.products(), response.products);
    return {
      products: merged,
      added: Math.max(0, merged.length - currentLength),
      fetchedAtISO: response.fetchedAtISO,
    };
  }

  private async findFirstNonEmptyPage(
    startPage: number,
  ): Promise<{ page: number; response: { products: Product[]; fetchedAtISO: string } } | null> {
    let page = Math.max(1, Math.floor(startPage));

    for (
      let step = 0;
      step < ProductListComponent.EMPTY_PAGE_SCAN_LIMIT && page <= ProductListComponent.MAX_PAGE;
      step += 1
    ) {
      const pageUrl = this.buildPageUrl(this.activeCategory().url, page);
      const response = await firstValueFrom(
        this.parserService.loadProductsWithMeta(pageUrl, ProductListComponent.BATCH_SIZE),
      );

      if (response.products.length > 0) {
        return { page, response };
      }

      page += 1;
    }

    return null;
  }

  private mergeProducts(existing: Product[], incoming: Product[]): Product[] {
    const map = new Map<string, Product>();

    for (const product of [...existing, ...incoming]) {
      const key = `${product.id}::${product.link}`;
      map.set(key, product);
    }

    return Array.from(map.values());
  }

  private buildPageUrl(baseUrl: string, page: number): string {
    const url = new URL(baseUrl);
    url.searchParams.set('page', page.toString());
    return url.toString();
  }

  private getCacheKey(): string {
    return `${ProductListComponent.CACHE_KEY_PREFIX}_${this.activeCategory().key}`;
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
