# Implementační poznámky (MVP)

## Potvrzená rozhodnutí pro MVP
- Kontaktní formulář poběží ve variantě **B**: data se odešlou na backend endpoint `POST /api/contact` a uloží se do databáze.
- V této fázi se **neposílá e-mail notifikace**.

## TODO po dokončení MVP
- [ ] Dodat e-mailový mailer/notifikace pro kontaktní formulář (např. Resend/SMTP).
- [ ] Přidat admin přehled přijatých zpráv (volitelné).
- [ ] Přidat ochranu proti spamu (rate limit + honeypot/reCAPTCHA).

## Poznámka k implementaci API
Doporučený minimální payload pro `POST /api/contact`:
- `name` (string)
- `email` (string)
- `message` (string)
- `created_at` (server timestamp)
