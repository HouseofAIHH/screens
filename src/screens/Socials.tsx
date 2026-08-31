/* Die Kanaele einer Person, jeder als eigener QR-Code.

   Codiert wird die Adresse, die im Portal hinterlegt ist, unveraendert: der
   Code fuehrt direkt zu LinkedIn, nicht auf eine Zwischenseite. GitHub steht
   in D1 als Benutzername, dort baut die API den Link - hier kommt also auch
   schon eine fertige Adresse an.

   Zwei Entscheidungen haengen daran, ob ein Mensch den Code vom Monitor
   abfotografieren kann, und beide sind gemessen:

   Fehlerkorrektur M statt Q. Eine lange LinkedIn-Adresse braucht bei Q 37x37
   Module, bei M nur 33x33 - dieselbe Kachel wird damit von 1,84 auf 2,06
   Pixel je Modul groesser. Q waere noetig gewesen, um ein Markenzeichen in
   die Mitte zu legen; das steht jetzt als Monogramm darunter und kostet
   nichts.

   Und die Kachelgroesse haengt an der Anzahl. Die meisten Mitglieder pflegen
   nur LinkedIn - dann wird der eine Code gross. Wer vier Kanaele hat, bekommt
   vier kleinere. Ein grosser Code, der scannt, ist mehr wert als vier, die
   gleich aussehen und es nicht tun. */
import { QRCodeSVG } from "qrcode.react";
import type { Member } from "../api";

/* Die Reihenfolge ist fest und haengt nicht daran, was jemand gepflegt hat,
   sonst springen die Codes beim Seitenwechsel von Karte zu Karte. Das Kuerzel
   ist dasselbe wie im Entwurf. */
const ORDER = [
  { key: "linkedin", mark: "in" },
  { key: "twitter", mark: "X" },
  { key: "instagram", mark: "ig" },
  { key: "github", mark: "gh" },
] as const;

const TILE = {
  l: { few: 88, many: 72 },
  s: { few: 72, many: 60 },
} as const;

export function Socials({ socials, size }: { socials: Member["socials"]; size: "l" | "s" }) {
  const present = ORDER.filter(({ key }) => socials[key]);
  if (!present.length) return null;

  const tile = present.length <= 2 ? TILE[size].few : TILE[size].many;

  return (
    <div className={`flex shrink-0 items-end ${size === "l" ? "gap-[12px]" : "gap-[8px]"}`}>
      {present.map(({ key, mark }) => (
        <div key={key} className="flex shrink-0 flex-col items-center gap-[4px]">
          <div className="rounded-[8px] bg-white p-[5px] leading-[0]">
            <QRCodeSVG value={socials[key]!} size={tile} level="M" marginSize={0}
              bgColor="#ffffff" fgColor="#09090b" />
          </div>
          <span className="font-mono text-[10px] tracking-[1.4px] text-faint lowercase">{mark}</span>
        </div>
      ))}
    </div>
  );
}
