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
    const safeName = product.name || 'Computer component';
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
    const clockMatch = name.match(/(\d+(?:[.,]\d+)?)\s*ГГц/i);
    const coreMatch = name.match(/(\d+)\s*(?:яд(?:ра|ер)|cores?)/i);
    const seriesMatch = name.match(/\b(RTX|GTX|RX)\s*\d{3,4}\b/i);
    const brand = name.split(' ')[0] || 'Модуль';

    const fragments = [
      capacityMatch ? `${capacityMatch[1]} ГБ` : null,
      ddrMatch ? ddrMatch[0].toUpperCase() : null,
      frequencyMatch ? `${frequencyMatch[1]} МГц` : null,
      clockMatch ? `${clockMatch[1].replace(',', '.')} ГГц` : null,
      coreMatch ? `${coreMatch[1]} ядер` : null,
      seriesMatch ? seriesMatch[0].toUpperCase() : null,
    ].filter((part): part is string => Boolean(part));

    if (fragments.length === 0) {
      return `${brand}: компонент для стабильной производительности в современных сборках ПК.`;
    }

    return `${brand}: конфигурация ${fragments.join(' · ')} для мощной и сбалансированной системы.`;
  }

  private pickTone(seed: string): string {
    const variants = [
      'Стабильно работает в играх, многозадачности и ресурсоемких приложениях.',
      'Поддерживает плавный отклик системы при повседневной и профессиональной нагрузке.',
      'Сбалансирован для производительных сборок с акцентом на надежность и скорость.',
      'Практичный выбор для апгрейда, когда важны ресурс, стабильность и эффективность.',
    ];
    return variants[this.hash(seed) % variants.length];
  }

  private pickUsage(seed: string): string {
    const variants = [
      'Подойдет для игровых и рабочих станций, где важны стабильные результаты и комфорт в работе.',
      'Рекомендуется для энтузиастов и создателей контента, которым нужна предсказуемая производительность.',
      'Хорошо вписывается в современные платформы с упором на апгрейд и долгий срок службы.',
      'Уверенно закрывает задачи от повседневного использования до требовательных сценариев.',
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
