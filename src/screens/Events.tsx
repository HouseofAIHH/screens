/* Screen 2: was als Naechstes stattfindet.

   Die Daten kommen aus der House-API, nicht aus Luma - der Screen kennt keinen
   Luma-Schluessel. Warum das so ist und so bleiben muss, steht in PLAN.md. */
import { usePoll, type HoaiEvent } from "../api";
import { Frame } from "./Frame";

const day = (iso: string) =>
  new Date(iso).toLocaleDateString("de-DE", { weekday: "short", day: "2-digit", month: "short" });
const time = (iso: string) =>
  new Date(iso).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" });

export function Events() {
  const { data, error, loading } = usePoll<HoaiEvent[]>("/events?limit=8", 300);
  const events = data ?? [];
  const [next, ...rest] = events;

  return (
    <Frame eyebrow="kalender" title={<>Als Nächstes <span className="text-accent-soft">im House.</span></>}
      footerLeft="house-of-ai.org/events" error={error}>
      {loading ? (
        <p className="font-mono text-mute">lädt…</p>
      ) : !next ? (
        <p className="text-3xl text-mute">Gerade nichts geplant. Schau auf lu.ma/houseofai.</p>
      ) : (
        <div className="flex h-full flex-col gap-6">
          <article className="rounded-2xl border border-accent/40 bg-accent/10 p-10">
            <p className="font-mono text-xl text-accent">
              {day(next.starts_at)} · {time(next.starts_at)}
              {next.ends_at ? `–${time(next.ends_at)}` : ""}
            </p>
            <h2 className="mt-3 text-6xl font-semibold tracking-tight text-balance">{next.title}</h2>
            {next.location ? <p className="mt-4 text-2xl text-mute">{next.location}</p> : null}
          </article>

          <div className="grid min-h-0 flex-1 grid-cols-2 content-start gap-4">
            {rest.map((e) => (
              <article key={`${e.title}-${e.starts_at}`}
                className="rounded-xl border border-line bg-panel p-6">
                <p className="font-mono text-base text-mute">
                  {day(e.starts_at)} · {time(e.starts_at)}
                </p>
                <h3 className="mt-2 text-2xl font-medium text-balance">{e.title}</h3>
                {e.location ? <p className="mt-1 text-lg text-mute">{e.location}</p> : null}
              </article>
            ))}
          </div>
        </div>
      )}
    </Frame>
  );
}
