# Album Browser (Lab 6: Routing & HTTP)

Angular SPA for Web Development Lab 6.

## Features
- Routing with 6 routes:
  - `/` -> redirect to `/home`
  - `/home`
  - `/about`
  - `/albums`
  - `/albums/:id`
  - `/albums/:id/photos`
- Global navigation with `routerLink` + `routerLinkActive`
- HTTP requests via `AlbumService` and `HttpClient`
- Observable-based API methods for read/update/delete
- Album list, album detail edit form, album photos grid
- Loading, error, and empty states in data pages

## API
Data source: JSONPlaceholder
- `GET /albums`
- `GET /albums/:id`
- `GET /albums/:id/photos`
- `PUT /albums/:id`
- `DELETE /albums/:id`

Mutations are simulated by JSONPlaceholder; UI updates locally as successful.

## Project structure
- `src/app/models/album.model.ts`
- `src/app/models/photo.model.ts`
- `src/app/services/album.service.ts`
- `src/app/pages/home`
- `src/app/pages/about`
- `src/app/pages/albums`
- `src/app/pages/album-detail`
- `src/app/pages/album-photos`

## Run locally
```bash
npm install
npm start
```
Open `http://localhost:4200`.

## Validation
```bash
npm run build
npm test
```
