# Řezbářství Chudý

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

## Nasazení zdarma

Pro kombinaci **GitHub Pages + backend + úložiště obrázků** je doporučený postup v souboru `DEPLOYMENT_FREE.md`.


## Stav frontendu

- Přihlášení už používá backend endpointy (`/api/auth/login`, `/api/auth/me`, `/api/auth/logout`) a nepoužívá `localStorage` pro heslo.
- Přidávání děl používá `input type="file"` a nahrává soubor přes `/api/uploads`, poté ukládá položku přes `/api/works`.
- Kontaktní formulář odesílá data na `/api/contact` (varianta B).
