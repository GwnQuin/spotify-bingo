# GitHub + Live Site

## 1) Repo naar GitHub

In de projectmap:

```bash
git init
git add .
git commit -m "Initial Spotify Bingo NL app"
git branch -M main
git remote add origin https://github.com/<jouw-gebruikersnaam>/<jouw-repo>.git
git push -u origin main
```

## 2) Environment secrets op GitHub

Zet deze waarden als repository secrets/variables voor deploy:

- `DATABASE_URL`
- `AUTH_SECRET`
- `AUTH_SPOTIFY_ID`
- `AUTH_SPOTIFY_SECRET`

## 3) Live site (aanbevolen: Vercel)

1. Ga naar [Vercel](https://vercel.com/) en importeer je GitHub repo.
2. Voeg dezelfde environment variables toe in Vercel.
3. Zet als redirect URI in Spotify Developer Dashboard:
   - `https://<jouw-domein>/api/auth/callback/spotify`
4. Deploy.

## 4) Lokaal + productie

- Lokaal: SQLite met `DATABASE_URL="file:./dev.db"`
- Productie: gebruik PostgreSQL voor betrouwbaarheid en schaalbaarheid.
