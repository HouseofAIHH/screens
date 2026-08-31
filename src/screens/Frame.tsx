/* Der Rahmen beider Screens: Buehne, Kopfzeile, Fusszeile.

   Gezeichnet wird immer auf 1920x1080, danach skaliert eine einzige
   Transformation das Ganze auf den Bildschirm. Das ist bei fester Gestaltung
   verlaesslicher als ein reagierendes Layout: die Wand sieht auf einem
   4K-Panel, auf dem Laptop des Beitragenden und in der PR-Vorschau gleich aus,
   und niemand muss Umbrueche fuer Groessen pruefen, die es im House nicht gibt.

   Die Uhr ist das einzige Element, an dem man von aussen sieht, ob der Screen
   noch lebt oder seit gestern Nacht eingefroren ist. */
import { useEffect, useState, type ReactNode } from "react";

const W = 1920;
const H = 1080;

interface Props {
  eyebrow: string;
  title: ReactNode;
  subline?: string;
  footerLeft: string;
  /** Fuellstand der Fortschrittsleiste, 0 bis 1. Ohne Wert bleibt sie leer. */
  progress?: number;
  pager?: { page: number; pages: number };
  error?: string | null;
  children: ReactNode;
}

function useFit(): number {
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const fit = () => setScale(Math.min(window.innerWidth / W, window.innerHeight / H));
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, []);
  return scale;
}

function useClock(): Date {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  return now;
}

export function Frame({ eyebrow, title, subline, footerLeft, progress, pager, error, children }: Props) {
  const scale = useFit();
  const now = useClock();

  return (
    /* cursor-none und overflow-hidden stehen hier und nicht am Body: die
       Seite hinter dem QR-Code wird sehr wohl bedient und gescrollt. */
    <div className="flex h-full w-full cursor-none items-center justify-center overflow-hidden bg-ground">
      <div style={{ width: W, height: H, transform: `scale(${scale})` }}
        className="relative shrink-0 origin-center">

        <header className="absolute top-[56px] left-[64px] flex h-[42px] w-[1792px] items-center justify-between">
          <div className="flex items-center gap-[14px]">
            <p className="font-mono text-[24px] font-bold text-ink">
              <span className="text-accent">./</span>house-of.ai
            </p>
            <div className="rounded-[6px] border border-accent/[0.32] bg-accent/[0.12] px-[10px] py-[5px]">
              <p className="font-mono text-[11px] font-bold tracking-[1.1px] text-accent-pale uppercase">Hamburg</p>
            </div>
          </div>
          <time className="font-mono text-[24px] font-medium tracking-[0.48px] text-ink-soft tabular-nums">
            {now.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })}
          </time>
        </header>

        <p className="absolute top-[150px] left-[64px] font-mono text-[15px] font-medium tracking-[2.4px] text-accent uppercase">
          {eyebrow}
        </p>
        <h1 className="absolute top-[184px] left-[64px] text-[50px] leading-[1.15] font-semibold tracking-[-1.5px] text-ink">
          {title}
        </h1>
        {subline ? (
          <p className="absolute top-[258px] left-[64px] font-mono text-[16px] tracking-[0.32px] text-dim">
            {subline}
          </p>
        ) : null}

        <div className="absolute top-[306px] left-[64px] h-[2px] w-[1792px] overflow-hidden bg-white/[0.08]">
          <div className="h-full bg-accent transition-[width] duration-1000 ease-linear"
            style={{ width: `${Math.min(1, Math.max(0, progress ?? 0)) * 100}%` }} />
        </div>

        <main className="absolute top-[348px] left-[64px] h-[622px] w-[1792px]">{children}</main>

        <footer className="absolute top-[1000px] left-[64px] flex h-[20px] w-[1792px] items-center justify-between">
          <p className="font-mono text-[14px] tracking-[0.28px] text-faint">
            {error ? "daten evtl. nicht aktuell" : footerLeft}
          </p>
          {pager ? (
            <div className="flex items-center gap-[16px]">
              <div className="flex items-center gap-[6px]">
                {Array.from({ length: pager.pages }, (_, i) => (
                  <div key={i} className={`h-[3px] rounded-[2px] transition-all duration-500 ${
                    i === pager.page ? "w-[24px] bg-accent" : "w-[12px] bg-white/[0.16]"}`} />
                ))}
              </div>
              <p className="font-mono text-[14px] font-medium tracking-[0.84px] text-faint tabular-nums">
                <span className="text-ink-soft">{String(pager.page + 1).padStart(2, "0")}</span>
                {` / ${String(pager.pages).padStart(2, "0")}`}
              </p>
            </div>
          ) : null}
        </footer>
      </div>
    </div>
  );
}
