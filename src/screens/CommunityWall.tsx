/* Screen 1: die Menschen im House.

   Sechs Karten je Seite, alle zwoelf Sekunden ein Wechsel. Bei 40 Karten sind
   das sieben Seiten, ein voller Umlauf dauert 84 Sekunden. Welche Karte wo
   landet und welcher Platz gross ist, rechnet lib/wall.ts - hier steht nur,
   wie es aussieht. */
import { useEffect, useState } from "react";
import { usePoll, type Member } from "../api";
import { buildCards, pageCards, pageCount, largeSlot, PAGE_SECONDS, PER_PAGE } from "../lib/wall";
import { MemberCardLarge, MemberCardSmall } from "./MemberCard";
import { Frame } from "./Frame";

/** Zaehlt im Takt der Wand hoch. Aus dem Stand ergeben sich Seite und Umlauf. */
function useTick(seconds: number): number {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), seconds * 1000);
    return () => clearInterval(timer);
  }, [seconds]);
  return tick;
}

export function CommunityWall() {
  const { data, error, loading } = usePoll<Member[]>("/members?limit=250", 300);
  const tick = useTick(PAGE_SECONDS);

  const members = data ?? [];
  const cards = buildCards(members);
  const pages = pageCount(cards.length);
  const page = tick % pages;
  const shown = pageCards(cards, page, Math.floor(tick / pages));

  const companies = new Set(members.map((m) => m.company?.trim().toLowerCase()).filter(Boolean));
  const subline = members.length
    ? `${members.length} members · ${companies.size} unternehmen · hafencity hamburg`
    : "hafencity hamburg";

  return (
    <Frame
      eyebrow="community"
      title={<>Die Menschen im House. <span className="text-accent-soft">Und was sie bauen.</span></>}
      subline={subline}
      footerLeft="house-of-ai.org/community"
      progress={cards.length ? (page + 1) / pages : 0}
      pager={cards.length ? { page, pages } : undefined}
      error={error}
    >
      {loading ? (
        <p className="font-mono text-[16px] text-dim">lädt…</p>
      ) : !cards.length ? (
        <p className="font-mono text-[16px] text-dim">Noch niemand mit öffentlichem Profil.</p>
      ) : (
        <div className="grid h-full grid-cols-4 grid-rows-[301px_301px] gap-[20px]">
          {shown.map((card, i) => {
            const row = (i < PER_PAGE / 2 ? 0 : 1) as 0 | 1;
            const isLarge = i % 3 === largeSlot(page, row);
            /* Der Schluessel traegt die Position mit: dieselbe Karte wechselt
               zwischen gross und klein, und React soll sie dann neu aufbauen
               statt das eine Layout ins andere zu morphen. */
            const key = `${card.key}:${isLarge ? "l" : "s"}`;
            return isLarge
              ? <MemberCardLarge key={key} card={card} />
              : <MemberCardSmall key={key} card={card} />;
          })}
        </div>
      )}
    </Frame>
  );
}
