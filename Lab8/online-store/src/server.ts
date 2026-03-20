import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import * as cheerio from 'cheerio';
import { type AnyNode, type Element } from 'domhandler';
import express from 'express';
import { join } from 'node:path';

interface ParsedProduct {
  id: number;
  name: string;
  description: string;
  price: number;
  rating: number;
  image: string;
  images: string[];
  link: string;
}

interface ParseResponse {
  products: ParsedProduct[];
  fetchedAtISO: string;
}

interface CacheEntry {
  expiresAt: number;
  payload: ParseResponse;
}

interface RateLimitEntry {
  windowStartAt: number;
  requestCount: number;
  lastRequestAt: number;
}

interface KaspiEmbeddedImage {
  small?: string;
  medium?: string;
  large?: string;
}

interface KaspiEmbeddedCard {
  id?: string;
  title?: string;
  shortNameText?: string;
  shopLink?: string;
  unitPrice?: number;
  unitSalePrice?: number;
  priceFormatted?: string;
  rating?: number;
  previewImages?: KaspiEmbeddedImage[];
}

interface KaspiEmbeddedProductList {
  cards?: KaspiEmbeddedCard[];
}

const browserDistFolder = join(import.meta.dirname, '../browser');
const app = express();
const angularApp = new AngularNodeAppEngine();

const KASPI_ORIGIN = 'https://kaspi.kz';
const MIN_SERVER_CACHE_MS = 2 * 60 * 1000;
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 20;
const MIN_INTERVAL_BETWEEN_REQUESTS_MS = 1200;

const parseCache = new Map<string, CacheEntry>();
const rateLimitMap = new Map<string, RateLimitEntry>();

app.get('/api/kaspi/parse', async (req, res) => {
  const rawUrl = typeof req.query['url'] === 'string' ? req.query['url'] : '';
  if (!rawUrl) {
    return res.status(400).json({ error: 'Missing required query param: url' });
  }

  const count = clampCount(req.query['count']);

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(rawUrl);
  } catch {
    return res.status(400).json({ error: 'Invalid url query param' });
  }

  if (!parsedUrl.hostname.endsWith('kaspi.kz')) {
    return res.status(400).json({ error: 'Only kaspi.kz URLs are allowed' });
  }

  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const rateResult = checkRateLimit(ip);
  if (!rateResult.allowed) {
    return res.status(429).json({ error: rateResult.message });
  }

  const cacheKey = `${parsedUrl.toString()}::${count}`;
  const cached = parseCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return res.json(cached.payload);
  }

  try {
    const upstream = await fetch(parsedUrl.toString(), {
      method: 'GET',
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
        Accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7',
        Referer: KASPI_ORIGIN,
      },
      redirect: 'follow',
    });

    if (!upstream.ok) {
      return res.status(502).json({ error: `Kaspi fetch failed: HTTP ${upstream.status}` });
    }

    const html = await upstream.text();
    const products = parseKaspiProducts(html, count);

    const payload: ParseResponse = {
      products,
      fetchedAtISO: new Date().toISOString(),
    };

    parseCache.set(cacheKey, {
      payload,
      expiresAt: Date.now() + MIN_SERVER_CACHE_MS,
    });

    return res.json(payload);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({ error: `Failed to parse kaspi page: ${message}` });
  }
});

app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) => (response ? writeResponseToNodeResponse(response, res) : next()))
    .catch(next);
});

if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, (error) => {
    if (error) {
      throw error;
    }

    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

export const reqHandler = createNodeRequestHandler(app);

function clampCount(value: unknown): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return 10;
  }

  return Math.min(50, Math.max(1, Math.floor(parsed)));
}

function checkRateLimit(key: string): { allowed: boolean; message?: string } {
  const now = Date.now();
  const entry = rateLimitMap.get(key);

  if (!entry) {
    rateLimitMap.set(key, {
      windowStartAt: now,
      requestCount: 1,
      lastRequestAt: now,
    });
    return { allowed: true };
  }

  if (now - entry.lastRequestAt < MIN_INTERVAL_BETWEEN_REQUESTS_MS) {
    return { allowed: false, message: 'Too many requests. Slow down and try again.' };
  }

  if (now - entry.windowStartAt > RATE_LIMIT_WINDOW_MS) {
    rateLimitMap.set(key, {
      windowStartAt: now,
      requestCount: 1,
      lastRequestAt: now,
    });
    return { allowed: true };
  }

  if (entry.requestCount >= MAX_REQUESTS_PER_WINDOW) {
    return { allowed: false, message: 'Rate limit exceeded. Please wait a moment.' };
  }

  entry.requestCount += 1;
  entry.lastRequestAt = now;
  rateLimitMap.set(key, entry);
  return { allowed: true };
}

function parseKaspiProducts(html: string, count: number): ParsedProduct[] {
  const $ = cheerio.load(html);
  const cards = $('.item-card.ddl_product, .item-card').toArray().slice(0, count) as Element[];

  const fromCards = cards.map((card: Element, index: number) => {
    const node = $(card);
    const linkElement = node.find('a.item-card__name-link').first();
    const href = linkElement.attr('href') || '';
    const link = toAbsoluteUrl(href);

    const name =
      normalizeText(linkElement.text()) ||
      normalizeText(node.find('.item-card__name').first().text()) ||
      `RAM module ${index + 1}`;

    const productIdAttr = node.attr('data-product-id') || '';
    const fallbackId = extractNumericId(link) || extractNumericId(href) || index + 1;
    const id = Number.parseInt(productIdAttr, 10) || fallbackId;

    const priceText =
      normalizeText(node.find('.item-card__prices-price').first().text()) ||
      normalizeText(node.find('[data-test-id="text-price"]').first().text()) ||
      normalizeText(node.find('.price').first().text());

    const price = parsePrice(priceText);
    const rating = extractRating(node);
    const images = ensureImageSet(collectImages(node));

    return sanitizeParsedProduct({
      id,
      name,
      description: '',
      price,
      rating,
      image: images[0],
      images,
      link,
    });
  });

  if (fromCards.length > 0) {
    return fromCards;
  }

  return parseFromEmbeddedProductList(html, count);
}

function collectImages(node: cheerio.Cheerio<AnyNode>): string[] {
  const imageSet = new Set<string>();

  node.find('img').each((_idx: number, el: Element) => {
    const img = node.find(el);
    const candidates = [
      img.attr('src'),
      img.attr('data-src'),
      img.attr('data-original'),
      img.attr('srcset')?.split(',')[0]?.trim().split(' ')[0],
    ];

    for (const candidate of candidates) {
      const normalized = toAbsoluteUrl(candidate || '');
      if (normalized) {
        imageSet.add(normalized);
      }
    }
  });

  return [...imageSet];
}

function ensureImageSet(images: string[]): string[] {
  const unique = new Set<string>();
  for (const image of images) {
    const normalized = normalizeImageUrl(image);
    if (normalized) {
      unique.add(normalized);
    }
  }

  if (unique.size === 0) {
    unique.add('https://resources.cdn-kaspi.kz/shop/medias/sys_master/images/images/h13/h52/0/0.jpg');
  }

  return [...unique].slice(0, 10);
}

function extractRating(node: cheerio.Cheerio<AnyNode>): number {
  const ratingClass = node.find('.rating').first().attr('class') || '';
  const classMatch = ratingClass.match(/_(\d{2})\b/);

  if (classMatch) {
    const ratingValue = Number.parseInt(classMatch[1], 10) / 10;
    return clampRating(ratingValue);
  }

  const ratingText = normalizeText(node.find('.rating').first().text());
  const textMatch = ratingText.match(/(\d(?:[.,]\d)?)/);
  if (textMatch) {
    return clampRating(Number.parseFloat(textMatch[1].replace(',', '.')));
  }

  return 4.7;
}

function clampRating(rating: number): number {
  if (!Number.isFinite(rating)) {
    return 4.7;
  }

  return Math.max(1, Math.min(5, Number(rating.toFixed(1))));
}

function parsePrice(priceText: string): number {
  const numeric = priceText.replace(/[^\d]/g, '');
  const value = Number.parseInt(numeric, 10);
  return Number.isFinite(value) ? value : 0;
}

function toAbsoluteUrl(input: string): string {
  const value = input.trim();
  if (!value) {
    return '';
  }

  if (value.startsWith('//')) {
    return `https:${value}`;
  }

  if (value.startsWith('/p/')) {
    return `${KASPI_ORIGIN}/shop${value}`;
  }

  if (value.startsWith('/')) {
    return `${KASPI_ORIGIN}${value}`;
  }

  if (value.startsWith('p/')) {
    return `${KASPI_ORIGIN}/shop/${value}`;
  }

  if (value.startsWith('http://') || value.startsWith('https://')) {
    if (value.startsWith(`${KASPI_ORIGIN}/p/`)) {
      return value.replace(`${KASPI_ORIGIN}/p/`, `${KASPI_ORIGIN}/shop/p/`);
    }
    return value;
  }

  return `${KASPI_ORIGIN}/${value.replace(/^\/+/, '')}`;
}

function normalizeText(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

function extractNumericId(value: string): number | null {
  const match = value.match(/(\d{4,})/);
  if (!match) {
    return null;
  }

  const id = Number.parseInt(match[1], 10);
  return Number.isFinite(id) ? id : null;
}

function parseFromEmbeddedProductList(html: string, count: number): ParsedProduct[] {
  const marker = 'productListData:';
  const markerIndex = html.indexOf(marker);
  if (markerIndex < 0) {
    return [];
  }

  const jsonStart = html.indexOf('{', markerIndex);
  if (jsonStart < 0) {
    return [];
  }

  const jsonEnd = findMatchingBraceEnd(html, jsonStart);
  if (jsonEnd < 0) {
    return [];
  }

  try {
    const jsonString = html.slice(jsonStart, jsonEnd + 1);
    const parsed = JSON.parse(jsonString) as KaspiEmbeddedProductList;
    const cards = Array.isArray(parsed.cards) ? parsed.cards.slice(0, count) : [];

    return cards.map((card, index) => {
      const id = Number.parseInt(card.id ?? '', 10) || index + 1;
      const name = normalizeText(card.title || card.shortNameText || `RAM module ${index + 1}`);
      const price = resolveEmbeddedPrice(card);
      const rating = clampRating(card.rating ?? 4.7);
      const link = toAbsoluteUrl(card.shopLink || '');
      const images = ensureImageSet(extractEmbeddedImages(card));

      return sanitizeParsedProduct({
        id,
        name,
        description: '',
        price,
        rating,
        image: images[0],
        images,
        link,
      });
    });
  } catch {
    return [];
  }
}

function resolveEmbeddedPrice(card: KaspiEmbeddedCard): number {
  if (Number.isFinite(card.unitSalePrice)) {
    return card.unitSalePrice as number;
  }
  if (Number.isFinite(card.unitPrice)) {
    return card.unitPrice as number;
  }
  return parsePrice(card.priceFormatted || '');
}

function extractEmbeddedImages(card: KaspiEmbeddedCard): string[] {
  const imageMap = new Map<string, string>();
  const previews = Array.isArray(card.previewImages) ? card.previewImages : [];

  previews.forEach((image) => {
    const candidates = [image.large, image.medium, image.small];
    candidates.forEach((candidate, index) => {
      const normalized = normalizeImageUrl(toAbsoluteUrl(candidate || ''));
      if (normalized) {
        const key = imageIdentityKey(normalized);
        if (!imageMap.has(key) || index === 0) {
          imageMap.set(key, normalized);
        }
      }
    });
  });

  return [...imageMap.values()];
}

function findMatchingBraceEnd(source: string, startIndex: number): number {
  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let i = startIndex; i < source.length; i += 1) {
    const char = source[i];

    if (escaped) {
      escaped = false;
      continue;
    }

    if (char === '\\') {
      escaped = true;
      continue;
    }

    if (char === '"') {
      inString = !inString;
      continue;
    }

    if (inString) {
      continue;
    }

    if (char === '{') {
      depth += 1;
      continue;
    }

    if (char === '}') {
      depth -= 1;
      if (depth === 0) {
        return i;
      }
    }
  }

  return -1;
}

function normalizeImageUrl(url: string): string {
  if (!url) {
    return '';
  }

  try {
    const parsed = new URL(url);
    return parsed.toString();
  } catch {
    return '';
  }
}

function imageIdentityKey(url: string): string {
  try {
    const parsed = new URL(url);
    return `${parsed.origin}${parsed.pathname}`;
  } catch {
    return url;
  }
}

function sanitizeParsedProduct(product: ParsedProduct): ParsedProduct {
  const dedupedImages = dedupeImageVariants(product.images);
  const safeImages =
    dedupedImages.length > 0
      ? dedupedImages
      : ['https://resources.cdn-kaspi.kz/shop/medias/sys_master/images/images/h13/h52/0/0.jpg'];

  return {
    ...product,
    link: normalizeKaspiProductLink(product.link),
    image: safeImages[0],
    images: safeImages,
  };
}

function normalizeKaspiProductLink(link: string): string {
  if (!link) {
    return '';
  }

  const normalized = toAbsoluteUrl(link);
  try {
    const parsed = new URL(normalized);
    if (parsed.hostname.endsWith('kaspi.kz') && parsed.pathname.startsWith('/p/')) {
      parsed.pathname = `/shop${parsed.pathname}`;
      return parsed.toString();
    }
    return parsed.toString();
  } catch {
    return normalized;
  }
}

function dedupeImageVariants(images: string[]): string[] {
  const byIdentity = new Map<string, string>();

  for (const image of images) {
    const normalized = normalizeImageUrl(image);
    if (!normalized) {
      continue;
    }

    const key = imageIdentityKey(normalized);
    const existing = byIdentity.get(key);
    if (!existing || imageQualityScore(normalized) > imageQualityScore(existing)) {
      byIdentity.set(key, normalized);
    }
  }

  return [...byIdentity.values()];
}

function imageQualityScore(url: string): number {
  if (url.includes('preview-large')) {
    return 3;
  }
  if (url.includes('preview-medium')) {
    return 2;
  }
  if (url.includes('preview-small')) {
    return 1;
  }
  return 0;
}
