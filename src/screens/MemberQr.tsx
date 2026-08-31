/* Der Code, den man vor dem Monitor abfotografiert.

   Er zeigt nicht direkt auf LinkedIn, sondern auf eine eigene kleine Seite je
   Person: ein Code kann nur eine Adresse tragen, gewuenscht sind aber alle
   Kanaele und die Website. Die Seite liegt auf derselben Domain wie der Screen
   und laedt dieselbe API - es braucht also keinen Server dafuer.

   Weiss hinterlegt mit Rand: auf dunklem Grund und ohne Ruhezone scheitern
   viele Kameras, und ein Code, den niemand scannt, ist nur ein Muster. */
import { QRCodeSVG } from "qrcode.react";
import { slugify } from "../lib/wall";

export function MemberQr({ name, size }: { name: string; size: number }) {
  const url = `${window.location.origin}/m/${slugify(name)}`;
  return (
    <div className="rounded-[8px] bg-white p-[5px] leading-[0]">
      <QRCodeSVG value={url} size={size} level="M" marginSize={0}
        bgColor="#ffffff" fgColor="#09090b" />
    </div>
  );
}
