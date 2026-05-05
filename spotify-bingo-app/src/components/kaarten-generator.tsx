"use client";

import { useMemo, useState } from "react";
import { maakBingoKaart, Raster } from "@/lib/bingo";
import { ThemeTrack } from "@prisma/client";

type Track = ThemeTrack;

type ThemaData = {
  id: string;
  naam: string;
  tracks: Track[];
};

export function KaartenGenerator({ themas }: { themas: ThemaData[] }) {
  const [themaId, setThemaId] = useState(themas[0]?.id ?? "");
  const [raster, setRaster] = useState<Raster>(5);
  const [aantal, setAantal] = useState(2);
  const [jokerPerKaart, setJokerPerKaart] = useState(1);
  const [vrijeMidden, setVrijeMidden] = useState(true);
  const [toonArtiest, setToonArtiest] = useState(true);
  const [blindeModus, setBlindeModus] = useState(false);

  const thema = useMemo(() => themas.find((t) => t.id === themaId), [themaId, themas]);
  const kaarten = useMemo(() => {
    if (!thema) return [];
    return Array.from({ length: aantal }).map((_, index) => ({
      id: `${thema.id}-${index + 1}-${raster}x${raster}`,
      vakjes: maakBingoKaart(thema.tracks, raster, vrijeMidden, jokerPerKaart),
    }));
  }, [thema, aantal, raster, vrijeMidden, jokerPerKaart]);

  return (
    <section className="space-y-6">
      <div className="rounded-xl border border-zinc-200 bg-white p-4">
        <h2 className="text-xl font-extrabold">Instellingen</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          <select
            value={themaId}
            onChange={(e) => setThemaId(e.target.value)}
            className="rounded-lg border border-zinc-300 px-3 py-2"
          >
            {themas.map((t) => (
              <option value={t.id} key={t.id}>
                {t.naam}
              </option>
            ))}
          </select>
          <select
            value={raster}
            onChange={(e) => setRaster(Number(e.target.value) as Raster)}
            className="rounded-lg border border-zinc-300 px-3 py-2"
          >
            <option value={3}>3 x 3</option>
            <option value={4}>4 x 4</option>
            <option value={5}>5 x 5</option>
          </select>
          <input
            type="number"
            min={1}
            max={100}
            value={aantal}
            onChange={(e) => setAantal(Number(e.target.value))}
            className="rounded-lg border border-zinc-300 px-3 py-2"
            placeholder="Aantal kaarten"
          />
          <input
            type="number"
            min={0}
            max={3}
            value={jokerPerKaart}
            onChange={(e) => setJokerPerKaart(Number(e.target.value))}
            className="rounded-lg border border-zinc-300 px-3 py-2"
            placeholder="Jokers per kaart"
          />
          <label className="flex items-center gap-2 text-sm font-semibold">
            <input type="checkbox" checked={vrijeMidden} onChange={(e) => setVrijeMidden(e.target.checked)} />
            Vrij vak in het midden
          </label>
          <label className="flex items-center gap-2 text-sm font-semibold">
            <input type="checkbox" checked={toonArtiest} onChange={(e) => setToonArtiest(e.target.checked)} />
            Artiest tonen op kaart
          </label>
          <label className="flex items-center gap-2 text-sm font-semibold">
            <input type="checkbox" checked={blindeModus} onChange={(e) => setBlindeModus(e.target.checked)} />
            Blinde kaartemodus
          </label>
        </div>
        <button
          type="button"
          onClick={() => window.print()}
          className="mt-4 rounded-full bg-fuchsia-700 px-4 py-2 font-bold text-white"
        >
          Exporteer / print als PDF
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {kaarten.map((kaart, kaartIndex) => (
          <article key={kaart.id} className="rounded-xl border border-zinc-300 bg-white p-3 shadow-sm">
            <header className="mb-2 flex items-center justify-between">
              <h3 className="font-extrabold">Kaart {kaartIndex + 1}</h3>
              <p className="text-xs font-semibold">Kaart-ID: {kaart.id}</p>
            </header>
            <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${raster}, minmax(0, 1fr))` }}>
              {kaart.vakjes.map((vakje, i) => (
                <div
                  key={`${kaart.id}-${i}`}
                  className={`min-h-20 rounded-md border p-1 text-center text-xs ${
                    vakje.type === "VRIJ"
                      ? "border-emerald-300 bg-emerald-50 font-extrabold text-emerald-900"
                      : vakje.autoAangevinkt
                        ? "border-amber-300 bg-amber-50"
                        : "border-zinc-200 bg-zinc-50"
                  }`}
                >
                  {vakje.type === "VRIJ" ? (
                    <p className="mt-6">VRIJ</p>
                  ) : blindeModus ? (
                    <div className="flex h-full items-center justify-center">
                      {vakje.track.albumAfbeelding ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={vakje.track.albumAfbeelding} alt={vakje.track.titel} className="h-16 w-16 rounded object-cover" />
                      ) : (
                        <p>🎵</p>
                      )}
                    </div>
                  ) : (
                    <>
                      <p className="font-bold">{vakje.track.titel}</p>
                      {toonArtiest ? <p className="text-zinc-600">{vakje.track.artiest}</p> : null}
                      {vakje.autoAangevinkt ? <p className="mt-1 font-extrabold text-amber-700">★ JOKER</p> : null}
                    </>
                  )}
                </div>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
