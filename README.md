# House of AI · Screens

Die Bildschirme im House. Zwei Ansichten, ein Repo, eine URL je Screen:

| Pfad      | Was darauf läuft                       |
| --------- | -------------------------------------- |
| `/`       | Community-Wand: alle Menschen im House |
| `/events` | Kalender: die nächsten Veranstaltungen |

Die Daten kommen aus der öffentlichen API des Mitgliederportals. Ein Screen ist
eine ganz normale Webseite, und deshalb kann jeder daran arbeiten, der schon
einmal React angefasst hat.

## Loslegen

```bash
npm install
cp .env.example .env.local   # Key eintragen, den du vom House-Team bekommst
npm start                    # http://localhost:5173
```

Ohne Key startet die Seite trotzdem und sagt dir in der Fußzeile, was fehlt.

## Mitmachen

1. Fork, oder Branch, wenn du Schreibrechte hast.
2. Ändern. `npm run build` muss durchlaufen, das prüft auch die Typen.
3. Pull Request. Cloudflare Pages baut jeden PR und hängt eine Vorschau-URL an
   den Kommentar. Diese URL kannst du direkt auf einem Screen aufrufen, bevor
   irgendwer merged.

Gern gesehen: Lesbarkeit auf Entfernung, ruhige Übergänge, neue Ansichten.
Weniger gern: eine zusätzliche Abhängigkeit für etwas, das CSS auch kann.

## Was wo liegt

```
src/api.ts               der einzige Ort, der die House-API anfasst
src/App.tsx              Pfad zu Screen, fünf Zeilen
src/screens/Frame.tsx    Kopfzeile, Uhr, Fußzeile
src/screens/*.tsx        je ein Screen
docs/api.md              die API, gegen die hier gebaut wird
PLAN.md                  warum es so gebaut ist, und was als Nächstes kommt
```

## Der API-Schlüssel

Er steht im JavaScript und ist damit für jeden lesbar, der den Quelltext
öffnet. Das ist kein Versehen: der Schlüssel darf nur lesen, er trägt nur die
Scopes `members` und `events`, und er funktioniert im Browser ausschließlich
von den Herkünften, die im Portal auf ihm hinterlegt sind. Von einer anderen
Domain gibt die API keine CORS-Header heraus, dort ist er wertlos.

Trotzdem gehört er nicht ins Repo. `.env.local` ist ignoriert, und das bleibt
so.

## Betrieb

Die gebaute Seite ist statisch. Auf dem Screen läuft ein Browser im
Kiosk-Modus, der die URL öffnet, sonst nichts. Details in [PLAN.md](./PLAN.md).
