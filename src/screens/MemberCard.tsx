/* Eine Karte, zwei Darstellungen.

   Gross und klein zeigen denselben Inhalt: Foto, Name, Rolle, Firmenlogo,
   Kurzbeschreibung und die Traction der Woche. Sie sind Layout-Slots, keine
   Wertung - deshalb steht hier auch nichts, was nur die grosse Karte haette.

   Vier Felder liefert die API noch nicht: Foto, Logo, Kurzbeschreibung und
   Traction. Wo sie fehlen, greift der im Design vorgesehene Fallback, und der
   Traction-Block entfaellt ganz, statt leer dazustehen. Siehe PLAN.md. */
import type { Card } from "../lib/wall";
import { Socials } from "./Socials";

const initials = (name: string) =>
  name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase();

/* Zwei Verlaufsfamilien, damit die Wand nicht monoton wird. Die Wahl haengt am
   Namen, nicht am Zufall: dieselbe Person hat bei jedem Umlauf dieselbe Kachel. */
const TINTS = [
  { from: "#241c2e", to: "#14121a" },
  { from: "#1a2230", to: "#12151c" },
];
function tint(key: string): string {
  let h = 0;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0;
  const t = TINTS[h % TINTS.length]!;
  return `linear-gradient(to bottom, ${t.from}, ${t.to})`;
}

/* Mehrere Menschen einer Firma teilen sich eine Karte. Dann traegt die
   Kopfzeile die Namen und die Rollen nebeneinander; ab drei Personen waere
   das eine Bleiwueste, also zaehlt der Rest nur noch mit. */
function heading(card: Card): { name: string; role: string } {
  const [first, ...rest] = card.people;
  if (!rest.length) return { name: first!.name, role: first!.title ?? "" };
  if (rest.length === 1) {
    return {
      name: `${first!.name} · ${rest[0]!.name}`,
      role: [first!.title, rest[0]!.title].filter(Boolean).join(" · "),
    };
  }
  return { name: `${first!.name} +${rest.length}`, role: first!.title ?? "" };
}

function Photo({ card, size }: { card: Card; size: "l" | "s" }) {
  const people = card.people.slice(0, 4);
  const url = people[0]?.photo_url;
  const big = size === "l";

  if (url && people.length === 1) {
    return big
      ? <img src={url} alt="" className="h-full w-[300px] shrink-0 object-cover" />
      : <img src={url} alt="" className="size-[52px] shrink-0 rounded-[12px] object-cover" />;
  }

  /* Ohne Foto das Monogramm. Bei mehreren Gesichtern schrumpft es, damit alle
     in denselben Rahmen passen. */
  const glyph = big
    ? (people.length > 2 ? "text-[40px]" : people.length > 1 ? "text-[54px]" : "text-[88px]")
    : "text-[18px]";
  return (
    <div style={{ background: tint(card.key) }}
      className={big
        ? "flex h-full w-[300px] shrink-0 flex-wrap items-center justify-center gap-x-[10px] gap-y-[4px] px-[16px]"
        : "flex size-[52px] shrink-0 items-center justify-center rounded-[12px]"}>
      {(big ? people : people.slice(0, 1)).map((p) => (
        <span key={p.name}
          className={`${glyph} font-mono font-bold tracking-[0.06em] text-white/[0.11]`}>
          {initials(p.name)}
        </span>
      ))}
    </div>
  );
}

function CompanyMark({ card, size }: { card: Card; size: "l" | "s" }) {
  const logo = card.people[0]?.company_logo_url;
  const box = size === "l" ? "size-[36px] rounded-[9px]" : "size-[26px] rounded-[7px]";
  if (logo) return <img src={logo} alt="" className={`${box} shrink-0 object-contain`} />;
  return (
    <div className={`${box} flex shrink-0 items-center justify-center border border-white/[0.13] bg-white/[0.07]`}>
      <span className={`font-mono font-bold text-body ${size === "l" ? "text-[14px]" : "text-[10px]"}`}>
        {initials(card.company ?? card.people[0]!.name)}
      </span>
    </div>
  );
}

const CARD_SHELL =
  "h-[301px] overflow-hidden rounded-[14px] border border-white/[0.08] " +
  "bg-gradient-to-b from-white/[0.05] to-white/[0.01]";

export function MemberCardLarge({ card }: { card: Card }) {
  const { name, role } = heading(card);
  const person = card.people[0]!;

  return (
    <div className={`${CARD_SHELL} col-span-2 flex`}>
      <Photo card={card} size="l" />
      <div className="w-px shrink-0 self-stretch bg-white/[0.08]" />

      <div className="flex min-w-0 flex-1 flex-col justify-between overflow-hidden px-[31px] py-[22px]">
        <div className="flex flex-col gap-[5px]">
          <p className="truncate text-[30px] leading-[1.15] font-semibold tracking-[-0.6px] text-ink">{name}</p>
          {role ? (
            <p className="truncate font-mono text-[14px] leading-[1.4] tracking-[0.56px] text-dim">{role}</p>
          ) : null}
        </div>

        <div className="h-px w-full bg-white/[0.08]" />

        <div className="flex items-center gap-[14px]">
          <CompanyMark card={card} size="l" />
          <div className="flex min-w-0 flex-col gap-[3px]">
            <p className="truncate font-mono text-[15px] leading-[1.4] tracking-[0.3px] text-ink-soft">
              {card.company ?? person.name}
            </p>
            {person.company_tagline ? (
              <p className="truncate text-[14px] leading-[1.45] text-dim">{person.company_tagline}</p>
            ) : null}
          </div>
        </div>

        {person.traction ? (
          <div className="flex flex-col gap-[7px] rounded-r-[8px] border-l-2 border-accent/55 bg-white/[0.03] px-[16px] pt-[14px] pb-[15px]">
            <p className="font-mono text-[11px] leading-[1.4] tracking-[1.54px] text-accent uppercase">diese woche</p>
            <p className="line-clamp-2 text-[16px] leading-[1.45] text-body">{person.traction}</p>
          </div>
        ) : null}

        <Socials socials={person.socials} size="l" />
      </div>
    </div>
  );
}

export function MemberCardSmall({ card }: { card: Card }) {
  const { name, role } = heading(card);
  const person = card.people[0]!;

  return (
    <div className={`${CARD_SHELL} flex flex-col justify-between px-[24px] py-[26px]`}>
      <div className="flex w-full items-center gap-[14px]">
        <Photo card={card} size="s" />
        <div className="flex min-w-0 flex-1 flex-col gap-[3px]">
          <p className="truncate text-[20px] leading-[1.2] font-semibold tracking-[-0.4px] text-ink">{name}</p>
          {role ? (
            <p className="truncate font-mono text-[12px] leading-[1.4] tracking-[0.48px] text-dim">{role}</p>
          ) : null}
        </div>
      </div>

      <div className="h-px w-full bg-white/[0.08]" />

      <div className="flex w-full items-center gap-[11px]">
        <CompanyMark card={card} size="s" />
        <div className="flex min-w-0 flex-1 flex-col gap-[2px]">
          <p className="truncate font-mono text-[13px] leading-[1.4] tracking-[0.26px] text-ink-soft">
            {card.company ?? person.name}
          </p>
          {person.company_tagline ? (
            <p className="truncate text-[12.5px] leading-[1.4] text-dim">{person.company_tagline}</p>
          ) : null}
        </div>
      </div>

      {person.traction ? (
        <div className="flex w-full flex-col gap-[6px]">
          <div className="flex items-center gap-[8px]">
            <div className="h-[2px] w-[14px] shrink-0 bg-accent" />
            <p className="font-mono text-[10px] leading-[1.4] tracking-[1.4px] text-accent uppercase">diese woche</p>
          </div>
          <p className="line-clamp-2 text-[14px] leading-[1.45] text-body">{person.traction}</p>
        </div>
      ) : null}

      <Socials socials={person.socials} size="s" />
    </div>
  );
}
