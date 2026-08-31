/* Die Icon-Slots der Karte.

   Die Reihenfolge ist fest und haengt nicht daran, was eine Person gepflegt
   hat - sonst springen die Icons beim Seitenwechsel von Karte zu Karte und die
   Wand wird unruhig. Gerendert wird nur, was hinterlegt ist. */
import { FaLinkedinIn, FaXTwitter, FaInstagram, FaGithub } from "react-icons/fa6";
import type { Member } from "../api";

const ORDER = [
  { key: "linkedin", Icon: FaLinkedinIn },
  { key: "twitter", Icon: FaXTwitter },
  { key: "instagram", Icon: FaInstagram },
  { key: "github", Icon: FaGithub },
] as const;

export function Socials({ socials, size }: { socials: Member["socials"]; size: "l" | "s" }) {
  const present = ORDER.filter(({ key }) => socials[key]);
  if (!present.length) return null;

  const box = size === "l" ? "size-[30px] rounded-[9px]" : "size-[24px] rounded-[7px]";
  const glyph = size === "l" ? 14 : 11;

  return (
    <div className={`flex shrink-0 items-center ${size === "l" ? "gap-[8px]" : "gap-[7px]"}`}>
      {present.map(({ key, Icon }) => (
        <div key={key} aria-label={key}
          className={`${box} flex shrink-0 items-center justify-center border border-white/[0.12] bg-white/[0.05]`}>
          <Icon size={glyph} className="text-mute" />
        </div>
      ))}
    </div>
  );
}
