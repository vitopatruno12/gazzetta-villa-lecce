# Cronache della Villa — testata giornalistica

Stack pulito:

- **frontend/** — sito pubblico React + Bootstrap (Vite, porta `5173`)
- **admin/** — pannello amministrativo React + Bootstrap (Vite, porta `5174`)
- **backend/** — API Node.js + Express + PostgreSQL (porta `4000`)
- **_archive_legacy/** — vecchio sito PHP (solo archivio, non usato)

## Avvio rapido

### 1. Database

Di default in sviluppo il backend usa **PGlite** (Postgres embedded, senza Docker):
`USE_PGLITE=1` in `backend/.env`.

Per Postgres “vero” con Docker Desktop avviato:

```bash
# in backend/.env: USE_PGLITE=0 e DATABASE_URL=postgresql://testata:testata@localhost:5432/testata
docker compose up -d
```

Se il login admin non funziona dopo un seed vecchio:

```bash
cd backend
npm run db:admin
```

### 2. Backend

```bash
cd backend
npm install
npm run dev
```

API: http://localhost:4000/api/health

### 3. Sito pubblico

```bash
cd frontend
npm install
npm run dev
```

http://localhost:5173

### 4. Admin

```bash
cd admin
npm install
npm run dev
```

http://localhost:5174

**Login seed:** `admin@testata.local` / `admin123`

## Pubblicità

Nell’admin → **Pubblicità** puoi:

1. creare un’**azienda** locale
2. creare una **campagna** (attiva / pausa / date / priorità)
3. creare una **creatività** legata a uno **slot**

Slot già definiti:

| Codice | Dove appare |
|---|---|
| `header-leaderboard` | sotto la testata |
| `sidebar-home` | colonna destra home |
| `article-below` | sotto l’articolo |
| `feed-sponsored` | nel flusso / pagina Partner |
| `mobile-sticky` | pronto per uso mobile |

Il frontend usa `<AdSlot code="..." />` che chiama `/api/ads/serve/:slotCode`.

## Modello dati (sintesi)

- `users` — redattori / admin
- `articles` — notizie, eventi, avvisi, contenuti sponsorizzati
- `companies` — attività locali
- `ad_slots` / `ad_campaigns` / `ad_creatives` / `ad_events` — ads + impressioni/click

## Note

- Il PHP originale è in `_archive_legacy/` (puoi cancellarlo quando non serve più).
- In produzione cambia `JWT_SECRET` e le password del DB.
