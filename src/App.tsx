/* Ein Screen ist eine URL. Welcher, entscheidet der Pfad:
     /         Community-Wand
     /events   Veranstaltungen
     /m/<name> die Seite hinter dem QR-Code einer Karte
   Mehr Router braucht ein Geraet nicht, das nie klickt - und das Handy, das
   den Code scannt, ruft ohnehin nur eine einzige Adresse auf. */
import { CommunityWall } from "./screens/CommunityWall";
import { Events } from "./screens/Events";
import { MemberLinks } from "./screens/MemberLinks";

export function App() {
  const path = window.location.pathname.replace(/\/+$/, "");
  if (path.startsWith("/m/")) return <MemberLinks slug={decodeURIComponent(path.slice(3))} />;
  return path === "/events" ? <Events /> : <CommunityWall />;
}
