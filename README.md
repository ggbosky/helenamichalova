# Beauty13 by Hell — web salonu

Statický web kosmetického salonu **Beauty13 by Hell** (Mánesova 13, Praha 2),
přenesený z Webnode na GitHub. Doména: **https://www.beauty13byhell.cz/**

## Struktura

| Stránka            | Soubor                          | Adresa                 |
|--------------------|---------------------------------|------------------------|
| Úvod               | `index.html`                    | `/`                    |
| Ceník              | `portfolio/index.html`          | `/portfolio/`          |
| Rezervace          | `rezervacni-system/index.html`  | `/rezervacni-system/`  |
| Fotogalerie        | `fotogalerie/index.html`        | `/fotogalerie/`        |
| Recenze            | `reference/index.html`          | `/reference/`          |
| Kontakt            | `kontakt/index.html`            | `/kontakt/`            |

Adresy podstránek jsou stejné jako na původním webu, takže staré odkazy
i výsledky ve vyhledávačích zůstanou funkční.

- `assets/css/style.css` — vzhled (barvy a písma nahoře v `:root`)
- `assets/js/main.js` — mobilní menu, galerie (lightbox), rezervační formulář
- `assets/img/` — fotky (`gallery/` plná velikost, `thumbs/` náhledy)
- `CNAME` — vlastní doména pro GitHub Pages

## Lokální náhled

```bash
python3 -m http.server 8000
```

Pak otevřít http://localhost:8000

## Zveřejnění (GitHub Pages)

1. V repozitáři: **Settings → Pages → Source: Deploy from a branch**, vybrat větev a složku `/ (root)`.
2. U registrátora domény nastavit DNS:
   - `www` → záznam **CNAME** na `ggbosky.github.io`
   - kořenová doména `beauty13byhell.cz` → záznamy **A** na
     `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
3. Po propagaci DNS zapnout v **Settings → Pages** volbu **Enforce HTTPS**.

## Rezervační formulář

Formulář odesílá přes službu [FormSubmit](https://formsubmit.co/) na
`beauty13byhell@gmail.com`. Při **prvním** odeslání přijde na tento e-mail
aktivační zpráva — je potřeba v ní kliknout na potvrzení, teprve pak začnou
rezervace chodit.
