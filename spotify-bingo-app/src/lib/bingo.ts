import { ThemeTrack } from "@prisma/client";

export type Raster = 3 | 4 | 5;

export function shuffle<T>(input: T[]): T[] {
  const items = [...input];
  for (let i = items.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
  return items;
}

type BingoTrack = Pick<ThemeTrack, "id" | "isJoker"> & ThemeTrack;

export function maakBingoKaart(
  tracks: BingoTrack[],
  raster: Raster,
  vrijVakMidden: boolean,
  jokerPerKaart: number,
) {
  const vakjesNodig = raster * raster;
  const normaleVakjesNodig = vrijVakMidden ? vakjesNodig - 1 : vakjesNodig;

  const jokers = shuffle(tracks.filter((t) => t.isJoker)).slice(0, jokerPerKaart);
  const overig = shuffle(
    tracks.filter((t) => !jokers.map((j) => j.id).includes(t.id)),
  ).slice(0, Math.max(0, normaleVakjesNodig - jokers.length));

  const vulling = shuffle([...jokers, ...overig]).slice(0, normaleVakjesNodig);
  const kaart: Array<
    | { type: "TRACK"; track: ThemeTrack; autoAangevinkt: boolean }
    | { type: "VRIJ" }
  > = vulling.map((track) => ({
    type: "TRACK",
    track,
    autoAangevinkt: track.isJoker,
  }));

  if (vrijVakMidden) {
    const middenIndex = Math.floor(vakjesNodig / 2);
    kaart.splice(middenIndex, 0, { type: "VRIJ" });
  }

  return kaart.slice(0, vakjesNodig);
}

export const winpatronen = [
  "ENKELE_RIJ",
  "ENKELE_KOLOM",
  "DIAGONAAL",
  "T_VORM",
  "L_VORM",
  "X_VORM",
  "POSTZEGEL",
  "BUITENRAND",
  "VOLLE_KAART",
] as const;
