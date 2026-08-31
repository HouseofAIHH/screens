/* Ein Screen ist eine URL. Welcher, entscheidet der Pfad:
     /         Community-Wand
     /events   Veranstaltungen
   Mehr Router braucht ein Geraet nicht, das nie klickt. */
import { CommunityWall } from "./screens/CommunityWall";
import { Events } from "./screens/Events";

export function App() {
  const path = window.location.pathname.replace(/\/+$/, "");
  return path === "/events" ? <Events /> : <CommunityWall />;
}
