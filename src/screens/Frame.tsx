/* Der gemeinsame Rahmen beider Screens: Kopfzeile, Uhr, Fusszeile.

   Die Uhr steht da, weil eine stehengebliebene Wand sonst nicht von einer
   lebenden zu unterscheiden ist - wer im Raum auf die Sekunden schaut, weiss
   sofort, ob der Screen haengt. */
import { useEffect, useState } from "react";

interface Props {
  eyebrow: string;
  title: string;
  error?: string | null;
  children: React.ReactNode;
}

export function Frame({ eyebrow, title, error, children }: Props) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex h-full flex-col gap-8 p-12">
      <header className="flex items-baseline justify-between border-b border-line pb-6">
        <div>
          <p className="font-mono text-sm tracking-[0.3em] text-accent uppercase">{eyebrow}</p>
          <h1 className="mt-2 text-5xl font-semibold tracking-tight">{title}</h1>
        </div>
        <time className="font-mono text-4xl tabular-nums text-mute">
          {now.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })}
        </time>
      </header>

      <main className="min-h-0 flex-1">{children}</main>

      <footer className="flex justify-between border-t border-line pt-4 font-mono text-sm text-mute">
        <span>house-of-ai.org</span>
        {error ? <span className="text-accent">Daten evtl. nicht aktuell</span> : null}
      </footer>
    </div>
  );
}
