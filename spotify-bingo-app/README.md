# Spotify Bingo NL

Volledig Nederlandstalige full-stack webapp voor Music Bingo met Spotify-integratie.

## Inhoud

- Host login met Spotify OAuth
- Thema- en trackbeheer per account
- Spotify zoekfunctie voor tracks toevoegen
- Per track instelbaar: startpositie, onthulvertraging en jokerstatus
- Bingokaartgenerator met:
  - Raster 3x3, 4x4, 5x5
  - Vrij vak midden (optioneel)
  - Jokerinstellingen
  - Standaardmodus of blinde kaartemodus (albumhoes)
  - Kaart-ID per kaart
  - Print/PDF export via browser print
- Hostscherm voor livesessies met:
  - Speelmodus (in-app of extern)
  - Actieve winpatronen
  - Pauzescherm
  - Vorig/volgend nummer

## Lokaal draaien

1. Zorg dat Node.js LTS is geinstalleerd.
2. Kopieer `.env.example` naar `.env` en vul Spotify keys in.
3. Installeer dependencies:

```bash
npm install
```

4. Database initialiseren (SQLite):

```bash
npm run db:push
```

5. Start de app:

```bash
npm run dev
```

Open daarna `http://localhost:3000`.

## Spotify OAuth instellen

Maak een app aan op [Spotify Developer Dashboard](https://developer.spotify.com/dashboard).

Gebruik als redirect URI:

- `http://localhost:3000/api/auth/callback/spotify` (lokaal)
- `https://jouw-domein.tld/api/auth/callback/spotify` (productie)

Zet vervolgens deze waardes in `.env`:

- `AUTH_SPOTIFY_ID`
- `AUTH_SPOTIFY_SECRET`
- `AUTH_SECRET` (lange willekeurige sleutel)

## GitHub / Deployment

De app is direct geschikt om in een GitHub-project te plaatsen:

- commit code exclusief `.env`
- gebruik `.env.example` als template
- run in CI minimaal:
  - `npm ci`
  - `npm run lint`
  - `npm run build`

Voor productie kun je later overschakelen van SQLite naar PostgreSQL via Prisma.
