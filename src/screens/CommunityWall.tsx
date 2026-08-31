/* Screen 1: alle Menschen im House.

   Die API liefert derzeit kein Profilbild (siehe PLAN.md, Schritt 1). Bis das
   Feld da ist, traegt das Monogramm die Kachel - und es soll auch danach noch
   tragen, denn nicht jedes Mitglied laedt ein Bild hoch. */
import { usePoll, usePages, type Member } from "../api";
import { Frame } from "./Frame";

const PER_PAGE = 24;

const initials = (name: string) =>
  name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase();

export function CommunityWall() {
  const { data, error, loading } = usePoll<Member[]>("/members?limit=250", 300);
  const members = data ?? [];
  const shown = usePages(members, PER_PAGE, 30);

  return (
    <Frame eyebrow="Community" title={`${members.length || ""} Menschen im House`.trim()} error={error}>
      {loading ? (
        <p className="font-mono text-mute">lädt…</p>
      ) : (
        <div className="grid h-full grid-cols-4 grid-rows-6 gap-4">
          {shown.map((m) => (
            <article key={`${m.name}-${m.company}`}
              className="flex items-center gap-4 rounded-xl border border-line bg-panel px-5 py-4">
              <div className="flex size-14 shrink-0 items-center justify-center rounded-full
                              bg-accent/15 font-mono text-lg text-accent">
                {initials(m.name)}
              </div>
              <div className="min-w-0">
                <p className="truncate text-xl font-medium">{m.name}</p>
                <p className="truncate text-base text-mute">
                  {[m.title, m.company].filter(Boolean).join(" · ") || "House of AI"}
                </p>
              </div>
            </article>
          ))}
        </div>
      )}
    </Frame>
  );
}
