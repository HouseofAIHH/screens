# Screens im House: Aufbau und Plan

Stand 31. August 2026. Dieses Dokument hält fest, warum das Repo so aussieht,
wie es aussieht, und was noch fehlt. Wer eine Entscheidung hier ändern will,
ändert bitte auch die Begründung.

## 1. Was auf die Wand soll

Zwei Screens, zwei Aufgaben, bewusst getrennt:

**Community-Wand.** Alle Menschen im House, die ihrem öffentlichen Profil
zugestimmt haben. Sie ist das, was ein Gast im Raum als Erstes sieht, und sie
beantwortet die eine Frage, die jeder hat: wer ist hier eigentlich.

**Kalender.** Was als Nächstes stattfindet. Das nächste Event groß, die
folgenden klein darunter. Kein Scrollen, keine Bedienung, aus fünf Metern
Entfernung lesbar.

Beide laufen aus demselben Build. Welcher Screen erscheint, entscheidet allein
der Pfad in der URL, die auf dem Gerät hinterlegt ist.

## 2. Die Luma-Frage, weil sie alles andere entscheidet

> Wir laden die Luma-API. Luma verkauft ihre API. Dürfen wir die Events dann
> über unsere eigene API weitergeben?

Kurz: ja, für die eigenen Events des House. Lang, weil die Begründung
entscheidet, wo die Grenze verläuft:

**Es sind unsere Daten.** Das House ist Veranstalter. Titel, Zeit, Ort und
Beschreibung stammen von uns; Luma ist die Plattform, auf der wir sie
veröffentlicht haben, nicht die Rechteinhaberin daran. Genau deshalb ist der
Luma-API-Schlüssel auch auf einen einzigen Kalender begrenzt: die Schnittstelle
ist dafür gebaut, dass der Kalenderinhaber an seine eigenen Daten kommt.

**Verkauft wird der Zugang, nicht das Recht an den Daten.** Ein Luma-Plus-Abo
kauft den API-Zugang. Was das verletzen würde, wäre, diesen Zugang
weiterzuverkaufen: eine Schnittstelle anzubieten, über die Dritte fremde
Luma-Kalender abfragen können, ohne selbst zu zahlen. Das tun wir nicht. Wir
veröffentlichen ausschließlich unsere eigenen Veranstaltungen, und zwar
dieselben, die auf der öffentlichen Luma-Seite und im Luma-Embed ohnehin für
jeden sichtbar sind.

**Ein ausdrückliches Verbot steht nirgends.** Geprüft wurden am 31. August 2026
die [Terms of Use](https://luma.com/terms) und die
[API-Dokumentation](https://docs.luma.com/reference/getting-started-with-your-api).
Keine Klausel zu Weitergabe, Zwischenspeicherung oder Anzeige der abgerufenen
Daten in eigenen Anwendungen. Das ist die Abwesenheit eines Verbots, keine
ausdrückliche Erlaubnis. Wer schriftliche Sicherheit will, fragt
support@luma.com. Das kostet eine E-Mail und liefert eine Antwort, auf die man
sich später berufen kann.

**Das eigentliche Risiko heißt nicht Luma, sondern DSGVO.** Gästelisten,
Anmeldungen und Namen von Teilnehmenden sind personenbezogene Daten Dritter,
und die dürfen unsere API unter keinen Umständen verlassen. Sie tut es auch
nicht: `/events` liefert Titel, Zeiten, Ort, Link, Titelbild und Beschreibung,
sonst nichts. Diese Grenze ist die wichtigste im ganzen Aufbau. Wer sie
verschiebt, verschiebt kein Feature, sondern eine Rechtslage.

**Eine Kleinigkeit bleibt offen:** `cover_url` zeigt auf Lumas CDN. Ein Screen,
der im Minutentakt Bilder von fremder Infrastruktur zieht, ist unhöflich und
fällt aus, sobald Luma die URL ändert. Titelbilder gehören mittelfristig in
unseren eigenen Medien-Speicher, wie die Firmenlogos auch.

**Was daraus für dieses Repo folgt, ist die wichtigste Bauentscheidung
überhaupt:** die Screens kennen Luma nicht. Sie sprechen nur mit der
House-API. Der Luma-Schlüssel liegt an genau einer Stelle, im Worker, der
nachts abgleicht. Beitragende brauchen also weder ein Luma-Konto noch ein
Luma-Abo, es gibt keinen zweiten Ort, an dem ein Schlüssel liegen kann, und
wenn Luma seine Bedingungen ändert, ändert sich genau eine Datei.

```
Luma  --nächtlicher Abgleich-->  Worker + D1  --/api/public/v1/events-->  Screen
     (ein Schlüssel, ein Ort)   (nur Event-Daten,        (kein Luma-Zugang,
                                 keine Gästelisten)       nur ein Lese-Key)
```

## 3. Der Stack, und warum er so klein ist

**Vite plus React plus TypeScript.** Nichts darüber hinaus.

Ein Screen hat keine Nutzer, keine Formulare, keine Anmeldung und keine
Suchmaschine, die ihn finden muss. Damit fällt der Grund für ein Framework wie
Next oder Astro weg: Server-Rendering, Routing und Datenschicht lösen Probleme,
die dieses Repo nicht hat. Was bleibt, ist eine statische Seite, die alle fünf
Minuten JSON holt.

Vite gewinnt trotzdem gegen "einfach eine HTML-Datei", und zwar aus einem
einzigen Grund: `npm install` und starten, danach speichert man und sieht die
Änderung sofort auf dem Bildschirm. Für Beitragende, die abends eine Stunde
Zeit haben, ist das der Unterschied zwischen mitmachen und nicht mitmachen.

**Tailwind** ist die einzige weitere Abhängigkeit. Sie kostet eine Zeile in der
Vite-Konfiguration und spart, dass jeder Beitragende sich eine eigene
CSS-Struktur ausdenkt. Die Farben stehen als Variablen in `src/styles.css`, an
genau einer Stelle.

**Kein Router.** `App.tsx` liest `window.location.pathname` und entscheidet
zwischen zwei Ansichten. Fünf Zeilen statt einer Abhängigkeit. Wenn der dritte
oder vierte Screen kommt, bleibt das immer noch fünf Zeilen.

**Keine Zustandsverwaltung.** Zwei Hooks in `src/api.ts` reichen: einer holt
und pollt, einer blättert durch lange Listen.

Was bewusst nicht drin ist: Tests. Hier hängt kein Geld dran und keine
Datenbank, und ein kaputter Screen fällt binnen Sekunden auf. Der Typcheck im
Build ist die Absicherung, die das Verhältnis von Aufwand zu Risiko trifft.
Sobald hier Logik entsteht, die man nicht mehr ansieht, kehrt sich das um.

## 4. Wie die Screens mit der API umgehen

Drei Dinge macht `src/api.ts`, die ein Gerät braucht, das monatelang
unbeaufsichtigt läuft:

- **ETag.** Die Antwort der letzten Abfrage wird als `If-None-Match`
  zurückgeschickt. Bei unverändertem Datenstand kommt ein 304 ohne Body. Ein
  Screen, der stundenlang dasselbe zeigt, kostet damit fast nichts, und das
  Limit von 120 Anfragen pro Minute ist nie in Sichtweite.
- **Alte Daten bleiben stehen.** Fällt das WLAN aus, bleibt die Wand stehen,
  wie sie war, und ein Hinweis erscheint in der Fußzeile. Ein leerer Screen im
  Raum ist schlimmer als ein leicht veralteter.
- **Eine Uhr in der Kopfzeile.** Sie ist das einzige Element, an dem man von
  außen sieht, ob der Screen noch lebt oder seit gestern Nacht eingefroren ist.

Poll-Abstand: 300 Sekunden, derselbe Wert wie der Cache der API. Öfter zu
fragen bringt keine neueren Daten.

## 5. Was noch fehlt

**Schritt 1, im Portal: Profilbilder in `/members`.** Mitglieder laden im
Portal ein Bild hoch und stimmen dabei der Anzeige auf der Community-Wand zu.
Die öffentliche API gibt dieses Bild bisher nicht heraus: `PublicMember` kennt
Name, Firma, Tier, Titel und Socials, kein Bild. Bis das Feld da ist, trägt das
Monogramm die Kachel. Zu tun im Portal-Repo: `photo_url` in `contracts.ts`
ergänzen, in `getMembers` füllen, aber nur bei gesetztem Einverständnis, und in
`openapi.ts` beschreiben.

**Schritt 2: ein Schlüssel für die Screens.** Im Admin-Panel anlegen, Scopes
`members` und `events`, als erlaubte Herkünfte `https://screens.house-of-ai.org`
und `http://localhost:5173`. Ohne den zweiten Eintrag kann niemand lokal
entwickeln. Der Schlüssel wird einmal angezeigt und danach nur noch als Hash
gespeichert.

**Schritt 3: Cloudflare Pages.** Dasselbe Konto wie der Worker. Repo verbinden,
Build-Befehl `npm run build`, Ausgabeverzeichnis `dist`, die beiden
`VITE_`-Variablen als Umgebungsvariablen hinterlegen.

Eine Falle steckt darin: Pages gibt jedem Deployment eine eigene Adresse aus
einem zufälligen Präfix, und die API vergleicht Herkünfte exakt, ohne
Platzhalter. Eine solche Vorschau bekommt also keine Daten. Der Ausweg ohne
Wildcard, die es hier bewusst nicht gibt: ein fester Branch `preview`, dessen
Alias `https://preview.hoai-screens.pages.dev` einmal am Schlüssel hinterlegt
wird. Wer eine Änderung auf dem echten Screen sehen will, schiebt sie dorthin.
Das kostet einen Push und erhält die Regel, die den Schlüssel im Browser
überhaupt erst tragbar macht.

**Schritt 4: die Geräte.** Ein Raspberry Pi 5 pro Screen, Chromium im
Kiosk-Modus, die URL fest hinterlegt. Rund 90 Euro, lautlos, und weil es ein
normaler Browser ist, gibt es nichts zu lernen und nichts, das ausläuft. Der
Pi startet die Seite beim Hochfahren; Bildschirmschoner und Energiesparen
werden abgeschaltet, sonst ist die Wand morgens schwarz.

Fertige Signage-Systeme wie Anthias oder Yodeck kämen infrage, sobald es mehr
als eine Handvoll Geräte sind und jemand sie aus der Ferne verwalten will. Sie
zeigen ebenfalls nur eine URL an, ändern also an diesem Repo nichts. Solange es
zwei Screens sind, ist ein Pi weniger Aufwand als eine Flottenverwaltung.

**Schritt 5: Titelbilder in den eigenen Speicher**, siehe Abschnitt 2.

## 6. Ideen, bewusst noch nicht gebaut

Eine GitHub-Heatmap der Community gäbe es als Endpunkt bereits. Ein dritter
Screen mit Kennzahlen aus `/stats` wäre eine Stunde Arbeit. Ein Screen, der
zwischen Wand und Kalender wechselt, spart ein Gerät.

Alles drei wartet, bis die zwei Screens im Raum hängen und laufen. Was auf
einer Wand fehlt, sieht man erst, wenn die Wand da ist.
