"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type ZoekResultaat = {
  id: string;
  titel: string;
  artiest: string;
  albumNaam?: string;
  albumAfbeelding?: string;
  previewUrl?: string | null;
};

export function SpotifyZoeker({ themeId }: { themeId: string }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [laden, setLaden] = useState(false);
  const [items, setItems] = useState<ZoekResultaat[]>([]);
  const [fout, setFout] = useState<string | null>(null);

  async function zoek() {
    setLaden(true);
    setFout(null);
    const res = await fetch(`/api/spotify/zoeken?q=${encodeURIComponent(query)}`);
    const data = await res.json();
    if (!res.ok) {
      setFout(data.fout ?? "Zoeken mislukt.");
      setItems([]);
    } else {
      setItems(data.items ?? []);
    }
    setLaden(false);
  }

  async function voegToe(item: ZoekResultaat) {
    const res = await fetch(`/api/themas/${themeId}/tracks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        spotifyTrackId: item.id,
        titel: item.titel,
        artiest: item.artiest,
        albumNaam: item.albumNaam,
        albumAfbeelding: item.albumAfbeelding,
        previewUrl: item.previewUrl,
      }),
    });
    if (!res.ok) {
      const data = await res.json();
      setFout(data.fout ?? "Toevoegen mislukt.");
      return;
    }
    router.refresh();
  }

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4">
      <h3 className="text-lg font-extrabold">Spotify zoekfunctie</h3>
      <p className="text-sm text-zinc-600">Zoek een nummer en voeg het direct toe aan dit thema.</p>
      <div className="mt-3 flex gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Zoek op nummer of artiest"
          className="w-full rounded-lg border border-zinc-300 px-3 py-2"
        />
        <button
          type="button"
          onClick={zoek}
          disabled={laden || query.length < 2}
          className="rounded-lg bg-emerald-600 px-4 py-2 font-bold text-white disabled:opacity-50"
        >
          Zoeken
        </button>
      </div>
      {fout ? <p className="mt-2 text-sm font-semibold text-red-600">{fout}</p> : null}
      <ul className="mt-3 space-y-2">
        {items.map((item) => (
          <li key={item.id} className="flex items-center justify-between rounded-lg bg-zinc-50 px-3 py-2">
            <div>
              <p className="font-semibold">{item.titel}</p>
              <p className="text-sm text-zinc-600">{item.artiest}</p>
            </div>
            <button
              type="button"
              onClick={() => voegToe(item)}
              className="rounded-full bg-fuchsia-700 px-3 py-1 text-sm font-bold text-white"
            >
              Toevoegen
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
