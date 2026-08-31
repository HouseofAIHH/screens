/* Was man sieht, nachdem man den Code gescannt hat.

   Kein Buehnen-Layout: das hier liegt in einer Hand, nicht an der Wand. Grosse
   Flaechen zum Antippen, ein Bildschirm ohne Scrollen, und alles, was die
   Karte auf dem Monitor nur andeutet. */
import { FaLinkedinIn, FaXTwitter, FaInstagram, FaGithub, FaGlobe } from "react-icons/fa6";
import { usePoll, type Member } from "../api";
import { findBySlug } from "../lib/wall";

const LINKS = [
  { key: "linkedin", label: "LinkedIn", Icon: FaLinkedinIn },
  { key: "twitter", label: "X", Icon: FaXTwitter },
  { key: "instagram", label: "Instagram", Icon: FaInstagram },
  { key: "github", label: "GitHub", Icon: FaGithub },
] as const;

export function MemberLinks({ slug }: { slug: string }) {
  /* Einmal laden reicht: wer die Seite offen hat, steht vor dem Monitor. */
  const { data, error, loading } = usePoll<Member[]>("/members?limit=250", 3600);
  const person = data ? findBySlug(data, slug) : undefined;

  return (
    <div className="mx-auto flex min-h-full max-w-[520px] flex-col gap-8 px-6 py-12">
      <p className="font-mono text-[13px] tracking-[2.4px] text-accent uppercase">
        <span className="text-accent">./</span>house-of.ai
      </p>

      {loading ? (
        <p className="font-mono text-mute">lädt…</p>
      ) : !person ? (
        <div className="flex flex-col gap-3">
          <h1 className="text-[28px] leading-[1.2] font-semibold">Niemanden gefunden.</h1>
          <p className="text-mute">
            {error
              ? "Die Daten sind gerade nicht erreichbar. Probier es gleich noch einmal."
              : "Vielleicht ist das Profil inzwischen nicht mehr öffentlich."}
          </p>
          <a href="https://house-of-ai.org" className="mt-2 font-mono text-accent-soft underline underline-offset-4">
            house-of-ai.org
          </a>
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-2">
            <h1 className="text-[34px] leading-[1.15] font-semibold tracking-[-0.8px] text-balance">
              {person.name}
            </h1>
            {person.title ? (
              <p className="font-mono text-[14px] tracking-[0.56px] text-dim">{person.title}</p>
            ) : null}
          </div>

          {person.company ? (
            <div className="flex flex-col gap-2 rounded-[14px] border border-white/[0.08] bg-white/[0.03] p-5">
              <p className="font-mono text-[15px] tracking-[0.3px] text-ink-soft">{person.company}</p>
              {person.company_tagline ? (
                <p className="text-[15px] leading-[1.5] text-body">{person.company_tagline}</p>
              ) : null}
            </div>
          ) : null}

          <div className="flex flex-col gap-3">
            {LINKS.filter(({ key }) => person.socials[key]).map(({ key, label, Icon }) => (
              <a key={key} href={person.socials[key]!} target="_blank" rel="noreferrer noopener"
                className="flex items-center gap-4 rounded-[12px] border border-white/[0.12] bg-white/[0.05] px-5 py-4
                           text-[17px] font-medium text-ink active:bg-white/[0.09]">
                <Icon size={20} className="shrink-0 text-mute" />
                {label}
              </a>
            ))}
            {person.company_website ? (
              <a href={person.company_website} target="_blank" rel="noreferrer noopener"
                className="flex items-center gap-4 rounded-[12px] border border-accent/[0.32] bg-accent/[0.12] px-5 py-4
                           text-[17px] font-medium text-ink active:bg-accent/[0.2]">
                <FaGlobe size={20} className="shrink-0 text-accent-pale" />
                Website
              </a>
            ) : null}
          </div>

          <p className="mt-auto pt-6 font-mono text-[13px] text-faint">
            Gescannt im House of AI, Hafencity Hamburg.
          </p>
        </>
      )}
    </div>
  );
}
