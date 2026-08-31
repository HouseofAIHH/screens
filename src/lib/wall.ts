/* Die Rechenregeln der Wand. Kein React, damit man sie prüfen kann, ohne
   einen Browser zu starten: node --experimental-strip-types --test test/

   Drei Fragen beantwortet diese Datei, und alle drei stehen so im Design:
   wer teilt sich eine Karte, wer steht auf welcher Seite, und welche zwei
   Plaetze einer Seite sind gross. */

import type { Member } from "../api.ts";

/** Sechs Karten je Seite, alle zwoelf Sekunden ein Wechsel. */
export const PER_PAGE = 6;
export const PAGE_SECONDS = 12;

export interface Card {
  key: string;
  company: string | null;
  people: Member[];
}

/* Person und Unternehmen leben in derselben Karte, ein Unternehmen taucht nie
   separat auf. Sind mehrere Menschen einer Firma im House, teilen sie sich
   eine Karte. Wer keine Firma hinterlegt hat, bekommt eine eigene - sonst
   fielen alle Firmenlosen zu einem Sammelposten zusammen. */
export function buildCards(members: Member[]): Card[] {
  const byCompany = new Map<string, Card>();
  const solo: Card[] = [];

  for (const person of members) {
    const company = person.company?.trim() || null;
    if (!company) {
      solo.push({ key: `person:${person.name}`, company: null, people: [person] });
      continue;
    }
    const seen = byCompany.get(company.toLowerCase());
    byCompany.set(company.toLowerCase(), seen
      ? { ...seen, people: [...seen.people, person] }
      : { key: `company:${company}`, company, people: [person] });
  }

  return [...byCompany.values(), ...solo];
}

/* Die Adresse hinter dem QR-Code. Aus dem Namen, damit sie sprechend ist und
   ohne eine id auskommt, die die API gar nicht herausgibt. */
export function slugify(name: string): string {
  return name.toLowerCase()
    .replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss")
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export const findBySlug = <T extends { name: string }>(people: T[], slug: string): T | undefined =>
  people.find((p) => slugify(p.name) === slug);

export const pageCount = (cards: number): number =>
  Math.max(1, Math.ceil(cards / PER_PAGE));

/* Welche Karten auf Seite p eines Umlaufs stehen.

   Der Versatz waechst um eine Karte je vollem Umlauf, damit niemand dauerhaft
   auf der letzten Seite landet. Geht die Zahl nicht auf, wiederholt die letzte
   Seite die ersten Karten: eine halb leere Wand sieht kaputt aus, eine Person,
   die in diesem Umlauf zweimal vorbeikommt, faellt niemandem auf. */
export function pageCards(cards: Card[], page: number, cycle: number): Card[] {
  if (!cards.length) return [];
  const offset = cycle % cards.length;
  return Array.from({ length: PER_PAGE }, (_, i) =>
    cards[(offset + page * PER_PAGE + i) % cards.length]!);
}

/* Gross und klein sind Layout-Slots, keine Wertung. Jede Reihe hat drei
   Karten, eine davon spannt zwei Spalten. Der grosse Platz wandert je Seite
   eine Position weiter, die zweite Reihe versetzt - nach drei Seiten war jede
   Position einmal gross. */
export function largeSlot(page: number, row: 0 | 1): number {
  return (page + row * 2) % 3;
}
