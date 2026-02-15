import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';

import { KaspiParseResponse, Product } from '../models/product.model';

interface RawKaspiParseResponse {
  products: Omit<Product, 'description'>[];
  fetchedAtISO: string;
}

@Injectable({
  providedIn: 'root',
})
export class KaspiParserService {
  constructor(private readonly http: HttpClient) {}

  loadProductsFromKaspi(url: string, count: number): Observable<Product[]> {
    return this.loadProductsWithMeta(url, count).pipe(map((response) => response.products));
  }

  loadProductsWithMeta(url: string, count: number): Observable<KaspiParseResponse> {
    const params = new HttpParams()
      .set('url', url)
      .set('count', this.clampCount(count).toString());

    return this.http
      .get<RawKaspiParseResponse>('/api/kaspi/parse', { params })
      .pipe(
        map((response) => ({
          fetchedAtISO: response.fetchedAtISO,
          products: response.products.map((product) => this.normalizeProduct(product)),
        })),
      );
  }

  private normalizeProduct(product: Omit<Product, 'description'>): Product {
    const safeName = product.name || 'Premium RAM module';
    const summary = this.extractSpecs(safeName);
    const tone = this.pickTone(safeName);
    const usage = this.pickUsage(safeName);

    return {
      ...product,
      description: `${summary} ${tone} ${usage}`,
    };
  }

  private clampCount(count: number): number {
    if (!Number.isFinite(count)) {
      return 10;
    }

    return Math.min(50, Math.max(1, Math.floor(count)));
  }

  private extractSpecs(name: string): string {
    const capacityMatch = name.match(/(\d+)\s*гб/i);
    const ddrMatch = name.match(/\bDDR\d\b/i);
    const frequencyMatch = name.match(/(\d{4,5})\s*МГц/i);
    const brand = name.split(' ')[0] || 'Модуль';

    const fragments = [
      capacityMatch ? `${capacityMatch[1]} ГБ` : null,
      ddrMatch ? ddrMatch[0].toUpperCase() : null,
      frequencyMatch ? `${frequencyMatch[1]} МГц` : null,
    ].filter((part): part is string => Boolean(part));

    if (fragments.length === 0) {
      return `${brand}: премиальная оперативная память с фокусом на стабильную работу под высокой нагрузкой.`;
    }

    return `${brand}: конфигурация ${fragments.join(' · ')} для мощных сборок и уверенной производительности.`;
  }

  private pickTone(seed: string): string {
    const variants = [
      'Хорошо держит длительные сессии рендера, монтажа и игр без просадок отклика.',
      'Дает быстрый отклик системы в многозадачности и при работе с тяжелыми проектами.',
      'Сбалансирована для high-end ПК: плавная работа, стабильный FPS и быстрая загрузка сцен.',
      'Оптимальный выбор для сборок, где важны запас по скорости, надежность и температурная стабильность.',
    ];
    return variants[this.hash(seed) % variants.length];
  }

  private pickUsage(seed: string): string {
    const variants = [
      'Подойдет для игровых и рабочих станций, где критичны пропускная способность и устойчивость.',
      'Рекомендуется для энтузиастов, стримеров и создателей контента с высокими требованиями к памяти.',
      'Отлично вписывается в современные платформы с упором на производительность и апгрейд-потенциал.',
      'Практичный апгрейд для систем, которым нужен заметный прирост в повседневных и профессиональных задачах.',
    ];
    return variants[(this.hash(seed) + 7) % variants.length];
  }

  private hash(value: string): number {
    let hash = 0;
    for (let i = 0; i < value.length; i += 1) {
      hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
    }
    return hash;
  }
}
