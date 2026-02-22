# Řezbářství Chudý

Jednoduchý web + API pro katalog děl.

## GitHub Pages režim (doporučeno pro frontend)

Frontend může běžet na GitHub Pages, ale API musí běžet samostatně (např. Render).

1. Zkopíruj konfiguraci API URL:
   ```bash
   cp config.example.js config.js
   ```
2. V `config.js` nastav `API_BASE_URL` na URL backendu (např. `https://rezbarstvi-api.onrender.com`).
3. Nahraj frontend na GitHub Pages.

> Bez nastavené `API_BASE_URL` frontend předpokládá stejný origin jako API.

## Lokální spuštění

1. Nainstaluj závislosti:
   ```bash
   npm install
   ```
2. Připrav konfiguraci:
   ```bash
   cp .env.example .env
   ```
3. V `.env` nastav:
   - `ADMIN_PASSWORD_HASH`
   - `ALLOWED_ORIGIN` (frontend URL, např. `http://localhost:3000` nebo GitHub Pages URL)
   - `PUBLIC_BASE_URL` (volitelné, např. `https://api-mujweb.onrender.com`, pro správné URL uploadů)
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

> Pozn.: Upload endpoint nyní ukládá soubory na server (`/uploads/...`) a vrací jejich veřejnou URL. Data katalogu i kontaktů se ukládají do JSON souborů v `data/`.

## Nasazení zdarma

Pro kombinaci **GitHub Pages + backend + úložiště obrázků** je doporučený postup v souboru `DEPLOYMENT_FREE.md`.


## Perzistence (MVP)

- `POST /api/works` ukládá data do `data/works.json`.
- `POST /api/contact` ukládá data do `data/contact_messages.json`.
- `POST /api/uploads` ukládá soubory do `uploads/` a server je servíruje přes `/uploads/<soubor>`.

Pro produkci doporučuji později nahradit JSON + lokální disk za DB + objektové úložiště (Supabase/S3).
