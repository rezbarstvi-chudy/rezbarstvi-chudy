# Řezbářství Chudy

Jednoduchý web + API pro katalog děl.

## Spuštění

1. Nainstaluj závislosti:
   ```bash
   npm install
   ```
2. Připrav konfiguraci:
   ```bash
   cp .env.example .env
   ```
3. V `.env` nastav `ADMIN_PASSWORD_HASH`.
4. Spusť aplikaci:
   ```bash
   npm start
   ```

Aplikace poběží na `http://localhost:3000`.

## API (MVP)

- `GET /api/health`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `GET /api/works`
- `POST /api/works` (vyžaduje přihlášení)
- `POST /api/uploads` (vyžaduje přihlášení)
- `POST /api/contact`

> Pozn.: Upload endpoint zatím vrací dočasnou/falešnou URL. V dalším kroku napojíme reálné storage.
