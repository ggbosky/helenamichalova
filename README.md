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

## Lokální náhled

```bash
python3 -m http.server 8000
```

Pak otevřít http://localhost:8000

## Zveřejnění (GitHub Pages)

Všechny cesty jsou relativní, takže web funguje jak na
`https://ggbosky.github.io/helenamichalova/`, tak na vlastní doméně.

1. V repozitáři: **Settings → Pages → Source: Deploy from a branch**, vybrat větev
   s webem a složku `/ (root)` → **Save**. Za pár minut poběží na
   `https://ggbosky.github.io/helenamichalova/`.
2. Až bude web schválený, přepnout doménu:
   - u registrátora nastavit DNS: `www` → **CNAME** na `ggbosky.github.io`,
     kořenová doména `beauty13byhell.cz` → záznamy **A** na
     `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   - v **Settings → Pages → Custom domain** vyplnit `www.beauty13byhell.cz`
     (GitHub si sám vytvoří soubor `CNAME`)
   - po ověření DNS zapnout **Enforce HTTPS**

## Rezervační systém

Klientka vybere den (týdenní přehled Po–Pá), pak čas (po 30 minutách,
9:00–18:00) a vyplní kontakt. Minulé časy, víkendy a české státní svátky
se nabízet nebudou. Do e-mailu přijde datum a čas i v předmětu, např.
„Rezervace: Středa 18. 11. 2026 v 14:30 – Jana Nováková“.

Nastavení je na začátku sekce *Rezervace termínu* v `assets/js/main.js`:

```js
var BOOKING = {
  open: '9:00', lastStart: '18:00', step: 30,
  closed: ['2026-12-23'],                    // zavřeno celý den (dovolená)
  blocked: { '2026-11-20': ['10:00', '10:30'] } // už obsazené časy
};
```

Web nemá databázi, takže obsazené časy se nepromítají automaticky —
rezervace je poptávka, kterou salon potvrdí e-mailem.

## Odesílání formuláře

Formulář odesílá přes službu [FormSubmit](https://formsubmit.co/) na
`beauty13byhell@gmail.com`. Při **prvním** odeslání přijde na tento e-mail
aktivační zpráva — je potřeba v ní kliknout na potvrzení, teprve pak začnou
rezervace chodit.
