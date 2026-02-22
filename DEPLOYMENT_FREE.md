# Doporučené free nasazení (GitHub Pages + API + obrázky)

Tento projekt nejlépe poběží jako **split deployment**:

1. **Frontend (statický web): GitHub Pages**
2. **Backend API: Render (free web service)**
3. **Databáze + obrázky: Supabase (free tier)**

Tahle kombinace je zdarma pro MVP, je stabilní a jednoduše se nastavuje.

## Proč právě takto

- **GitHub Pages** neumí spouštět Node.js backend, jen statické soubory.
- **Render** umí hostovat Express server přímo z GitHub repozitáře.
- **Supabase** dá v jednom: PostgreSQL + object storage (bucket na fotky).

## Architektura

- `https://<user>.github.io/<repo>` -> frontend
- `https://<app>.onrender.com/api/...` -> backend endpointy (`/api/auth`, `/api/works`, `/api/uploads`, `/api/contact`)
- Supabase -> tabulky (`works`, `contact_messages`) + storage bucket (`works-images`)

## Krok 1: Frontend na GitHub Pages

1. Pushni repo na GitHub.
2. V repu otevři **Settings -> Pages**.
3. Vyber branch `main` (nebo aktuální branch) a root `/`.
4. Po publikaci dostaneš URL webu.

## Krok 2: Backend na Render (free)

1. V Renderu zvol **New + -> Web Service**.
2. Připoj GitHub repo.
3. Nastavení:
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Environment: `Node`
4. Doplň ENV proměnné:
   - `PORT=3000`
   - `SESSION_SECRET=<silny_tajny_retezec>`
   - `ADMIN_USERNAME=admin`
   - `ADMIN_PASSWORD_HASH=<bcrypt hash>`
   - (po napojení Supabase) `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_BUCKET`

> Poznámka: free instance se může uspat při neaktivitě (cold start).

## Krok 3: Obrázky na Supabase Storage (free)

1. V Supabase vytvoř projekt.
2. V **Storage** vytvoř bucket `works-images`.
3. Pro MVP nastav bucket jako public (nebo private + podepsané URL).
4. V backendu endpoint `/api/uploads` nahraje soubor do bucketu a vrátí URL.

## Krok 4: Data na Supabase Postgres

Vytvoř minimálně tabulky:

- `works(id, name, category, description, image_url, created_at, created_by)`
- `contact_messages(id, name, email, message, created_at)`

Backend následně ukládá data místo in-memory polí.

## Alternativa pro obrázky (když nechceš Supabase storage)

- **Cloudinary free tier** (velmi jednoduchý upload obrázků a transformace).
- V tom případě může DB stále zůstat v Supabase, ale obrázky jdou do Cloudinary.

## Co je pro tebe nejpraktičtější volba

Pokud chceš co nejméně služeb a jednoduchý provoz:

- **Backend:** Render
- **Obrázky:** Supabase Storage
- **DB:** Supabase Postgres
- **Frontend:** GitHub Pages

Tohle je doporučená varianta pro tento projekt i další postup implementace.
