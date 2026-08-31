/* node --experimental-strip-types --test test/wall.test.mjs */
import test from "node:test";
import assert from "node:assert/strict";
import { buildCards, pageCards, pageCount, largeSlot, PER_PAGE } from "../src/lib/wall.ts";

const person = (name, company = null) => ({
  name, company, tier: null, title: null,
  socials: { linkedin: null, instagram: null, tiktok: null, twitter: null, github: null },
});

test("eine Firma ist eine Karte, auch mit mehreren Gesichtern", () => {
  const cards = buildCards([
    person("Ann", "Acme"), person("Bo", "acme"), person("Cy", "Beta"), person("Del"),
  ]);
  assert.equal(cards.length, 3, "Acme zweimal ergibt eine Karte, nicht zwei");
  assert.deepEqual(cards.find((c) => c.company === "Acme").people.map((p) => p.name), ["Ann", "Bo"]);
  assert.equal(cards.at(-1).company, null, "ohne Firma eine eigene Karte");
});

test("Firmenlose fallen nicht zu einem Sammelposten zusammen", () => {
  const cards = buildCards([person("Ann"), person("Bo")]);
  assert.equal(cards.length, 2);
});

test("eine Seite ist immer voll, auch wenn die Zahl nicht aufgeht", () => {
  const cards = buildCards(Array.from({ length: 40 }, (_, i) => person(`P${i}`)));
  assert.equal(pageCount(cards.length), 7);
  for (let p = 0; p < 7; p++) {
    assert.equal(pageCards(cards, p, 0).length, PER_PAGE, `Seite ${p} ist voll`);
  }
  const first = pageCards(cards, 0, 0).map((c) => c.key);
  assert.deepEqual(first, cards.slice(0, 6).map((c) => c.key));
});

test("der Versatz waechst je Umlauf, damit niemand hinten festhaengt", () => {
  const cards = buildCards(Array.from({ length: 40 }, (_, i) => person(`P${i}`)));
  assert.equal(pageCards(cards, 0, 0)[0].key, "person:P0");
  assert.equal(pageCards(cards, 0, 1)[0].key, "person:P1", "ein Umlauf weiter, eine Karte weiter");
});

test("der Grossslot wandert und ist nach drei Seiten ueberall gewesen", () => {
  const seen = { 0: new Set(), 1: new Set() };
  for (let p = 0; p < 3; p++) {
    seen[0].add(largeSlot(p, 0));
    seen[1].add(largeSlot(p, 1));
  }
  assert.deepEqual([...seen[0]].sort(), [0, 1, 2]);
  assert.deepEqual([...seen[1]].sort(), [0, 1, 2]);
  assert.notEqual(largeSlot(0, 0), largeSlot(0, 1), "die zwei Reihen stehen versetzt");
  assert.equal(largeSlot(0, 0), 0, "Seite 1: links oben gross");
  assert.equal(largeSlot(0, 1), 2, "Seite 1: rechts unten gross - wie im Mockup");
});

test("ohne Mitglieder faellt nichts um", () => {
  assert.deepEqual(pageCards([], 0, 0), []);
  assert.equal(pageCount(0), 1);
});
