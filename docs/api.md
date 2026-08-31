# House of AI · Public API v1

Lesezugriff auf die Community-Daten des House of AI. Nur Daten, denen
Mitglieder ausdrücklich zugestimmt haben. Zahlungsdaten, Logins und Mandate
liegen hinter einer Trennwand, die ein Test bei jedem Build prüft: die Dateien
dieser Schnittstelle dürfen die entsprechenden Tabellen nicht einmal erwähnen.

Diese Datei ist die Kopie der Seite
[membership.house-of-ai.org/developers](https://membership.house-of-ai.org/developers).
Im Zweifel gilt die Seite, denn sie liest ihre Zahlen aus demselben Code wie
das Tor.

## In dreißig Sekunden

```bash
curl -H "Authorization: Bearer hoai_dein_key" \
  https://membership.house-of-ai.org/api/public/v1/stats
```

Antwort: `{ data, meta }`. Im Fehlerfall `{ error: { code, message }, meta }`.
Etwas Drittes gibt es nicht. Einen Schlüssel bekommst du vom House-Team.

Maschinenlesbar:
[openapi.json](https://membership.house-of-ai.org/api/public/v1/openapi.json).
OpenAPI 3.1, ohne Schlüssel abrufbar, taugt direkt zur Client-Generierung.

## Endpunkte

| Pfad               | Scope     | Cache  | Inhalt                                                  |
| ------------------ | --------- | ------ | ------------------------------------------------------- |
| `/stats`           | `stats`   | 120 s  | Plätze, Mitglieder, Firmen, Anzahl kommender Events      |
| `/members`         | `members` | 300 s  | Mitglieder der Community-Wall, nur mit Opt-in            |
| `/events`          | `events`  | 300 s  | Kommende Veranstaltungen aus dem Luma-Kalender           |
| `/github-heatmap`  | `github`  | 3600 s | Beiträge aller verbundenen GitHub-Profile, 12 Monate     |

`/members` und `/events` nehmen `?limit=` (Standard 100 bzw. 50, Obergrenze 250
bzw. 200). Werte außerhalb werden auf die Grenze gezogen, nicht abgelehnt.

### Felder

```ts
// GET /members
{ name: string
  company: string | null
  tier: string | null
  title: string | null
  socials: { linkedin, instagram, tiktok, twitter, github } // je string | null
}

// GET /events
{ title: string
  starts_at: string          // ISO 8601
  ends_at: string | null
  location: string | null
  url: string | null
  cover_url: string | null
  description: string | null
}

// GET /stats
{ seats_total, seats_taken, seats_remaining,
  members_count, companies_count, events_upcoming }        // je number
```

## Schlüssel und Scopes

- Ein Schlüssel trägt genau die Scopes, die er braucht: `stats`, `members`,
  `events`, `github`, `videos`.
- Er wird einmal angezeigt und bei uns nur als SHA-256-Hash gespeichert.
  Verloren heißt neu ausstellen.
- Er läuft nach einem Jahr ab, sofern nicht anders vereinbart. Das Ablaufdatum
  steht im Admin-Panel.
- Widerrufen wirkt sofort, nicht erst mit dem Cache.

## Im Browser: die Origin ist der Schutz

Ein Schlüssel in einer Web-App ist öffentlich, egal wie er dort hineinkommt.
Wer den Quelltext öffnet, hat ihn. Deshalb hängt an jedem Schlüssel eine Liste
erlaubter Herkünfte, und nur von dort setzt die API die CORS-Header.

- Ohne hinterlegte Origin gibt es keine CORS-Header. Der Schlüssel ist dann
  serverseitig, für Screens mit eigenem Backend.
- Mit Origin gilt er genau für diese Herkunft, exakt verglichen, ohne
  Platzhalter. Für die lokale Entwicklung muss `http://localhost:5173`
  ausdrücklich mit hinterlegt sein.
- Gib einem Browser-Schlüssel nur die Scopes, die die Seite wirklich anzeigt.

## Limits

120 Anfragen je Minute und Schlüssel, 300 je Minute und IP. Die zweite Bremse
greift vor der Schlüsselprüfung und trifft damit auch Anfragen ohne gültigen
Schlüssel.

- `RateLimit-Limit`, `RateLimit-Remaining` und `RateLimit-Reset` stehen auf
  jeder Antwort. Lies sie, dann brauchst du die 429 nie zu sehen.
- Bei 429 sagt `Retry-After` die Wartezeit in Sekunden.
- Jede Antwort trägt einen `ETag`. Schick ihn als `If-None-Match` zurück: bei
  unveränderten Daten kommt ein 304 ohne Body und ohne Kosten. Für einen
  Screen, der im Minutentakt pollt, ist das der Unterschied zwischen höflich
  und lästig. `src/api.ts` in diesem Repo macht genau das, in zehn Zeilen.
- `X-Request-Id` ist die Nummer, die du bei Rückfragen mitschickst.

## Fehler

| Code                 | HTTP | Wann                                                       |
| -------------------- | ---- | ---------------------------------------------------------- |
| `invalid_key`        | 401  | Header fehlt, oder der Schlüssel ist unbekannt oder widerrufen. |
| `expired_key`        | 401  | Der Schlüssel hat sein Ablaufdatum überschritten.           |
| `missing_scope`      | 403  | Der Schlüssel darf diese Ressource nicht lesen.             |
| `rate_limited`       | 429  | Limit erreicht. `Retry-After` sagt, wann es weitergeht.     |
| `method_not_allowed` | 405  | Die API ist read-only. Nur GET.                             |

Fehlerantworten sind auch von fremden Herkünften lesbar. Sie tragen keine
Daten, nur den Grund, und ohne diesen Header stünde im Browser nur
„network error".

## Was stabil bleibt

- Innerhalb von `v1` kommen Felder nur dazu, sie verschwinden nicht. Bau deinen
  Client so, dass unbekannte Felder ihn nicht stören.
- Verschwinden kann trotzdem ein einzelner Datensatz: Mitglieder können ihr
  öffentliches Profil jederzeit abschalten, dann sind sie mit der nächsten
  Antwort weg. Das ist kein Fehler, das ist der Zweck des Hakens.
- Ein Bruch am Vertrag bekommt `v2` und läuft parallel.
