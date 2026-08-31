/* Der einzige Ort, an dem dieses Repo die House-API anfasst.

   Zwei Dinge macht der Hook, die ein Screen wirklich braucht: er schickt den
   ETag der letzten Antwort zurueck, sodass ein unveraenderter Datenstand ein
   304 ohne Body ergibt - ein Screen, der stundenlang dasselbe zeigt, kostet
   dann fast nichts. Und er behaelt bei einem Fehler die alten Daten stehen,
   statt die Wand zu leeren: ein WLAN-Aussetzer darf keinen leeren Screen im
   Raum haengen lassen. */
import { useEffect, useRef, useState } from "react";

const BASE = import.meta.env.VITE_HOAI_API_BASE
  ?? "https://membership.house-of-ai.org/api/public/v1";
const KEY = import.meta.env.VITE_HOAI_API_KEY;

export interface Member {
  name: string;
  company: string | null;
  tier: string | null;
  title: string | null;
  socials: {
    linkedin: string | null; instagram: string | null;
    tiktok: string | null; twitter: string | null; github: string | null;
  };
}

export interface HoaiEvent {
  title: string;
  starts_at: string;
  ends_at: string | null;
  location: string | null;
  url: string | null;
  cover_url: string | null;
  description: string | null;
}

export interface Poll<T> {
  data: T | null;
  error: string | null;
  /** Wahr, solange noch nie etwas ankam. Danach steht der letzte Stand. */
  loading: boolean;
}

export function usePoll<T>(path: string, everySeconds: number): Poll<T> {
  const [state, setState] = useState<Poll<T>>({ data: null, error: null, loading: true });
  const etag = useRef<string | null>(null);

  useEffect(() => {
    if (!KEY) {
      setState({ data: null, loading: false, error: "VITE_HOAI_API_KEY fehlt. Siehe .env.example." });
      return;
    }
    let stopped = false;

    async function load() {
      try {
        const headers: Record<string, string> = { authorization: `Bearer ${KEY}` };
        if (etag.current) headers["if-none-match"] = etag.current;

        const res = await fetch(`${BASE}${path}`, { headers, cache: "no-store" });
        if (stopped) return;

        if (res.status === 304) return;
        if (!res.ok) {
          const body = await res.json().catch(() => null);
          throw new Error(body?.error?.message ?? `HTTP ${res.status}`);
        }
        etag.current = res.headers.get("etag");
        const body = await res.json();
        setState({ data: body.data as T, error: null, loading: false });
      } catch (err) {
        if (stopped) return;
        /* Alte Daten bleiben stehen, der Fehler wandert nur in die Fusszeile. */
        setState((prev) => ({ ...prev, loading: false, error: String(err) }));
      }
    }

    load();
    const timer = setInterval(load, everySeconds * 1000);
    return () => { stopped = true; clearInterval(timer); };
  }, [path, everySeconds]);

  return state;
}

/** Blaettert durch eine lange Liste, damit auch der 40. Mensch drankommt. */
export function usePages<T>(items: T[], perPage: number, everySeconds: number): T[] {
  const [page, setPage] = useState(0);
  const pages = Math.max(1, Math.ceil(items.length / perPage));

  useEffect(() => {
    if (pages < 2) return;
    const timer = setInterval(() => setPage((p) => (p + 1) % pages), everySeconds * 1000);
    return () => clearInterval(timer);
  }, [pages, everySeconds]);

  const start = (page % pages) * perPage;
  return items.slice(start, start + perPage);
}
