"use client";

import { useEffect, useMemo, useState } from "react";

type HostLiveControlsProps = {
  trackTitel: string;
  trackArtiest: string;
  startSeconden: number;
  onthulSeconden: number;
  blindekaartmodus: boolean;
  toonArtiestVoorOnthulling: boolean;
};

export function HostLiveControls({
  trackTitel,
  trackArtiest,
  startSeconden,
  onthulSeconden,
  blindekaartmodus,
  toonArtiestVoorOnthulling,
}: HostLiveControlsProps) {
  const [resterend, setResterend] = useState(() => onthulSeconden);
  const [isOnthuld, setIsOnthuld] = useState(false);
  const [loopt, setLoopt] = useState(true);

  useEffect(() => {
    if (!loopt || isOnthuld) return;
    const timer = setInterval(() => {
      setResterend((vorige) => {
        if (vorige <= 1) {
          setIsOnthuld(true);
          setLoopt(false);
          return 0;
        }
        return vorige - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [loopt, isOnthuld]);

  const statusTekst = useMemo(() => {
    if (isOnthuld) return "Onthuld";
    if (!loopt) return "Gepauzeerd";
    return "Aftellen";
  }, [isOnthuld, loopt]);

  const magTitelTonen = isOnthuld || !blindekaartmodus;
  const magArtiestTonen = isOnthuld || toonArtiestVoorOnthulling;

  return (
    <div className="mt-3 rounded-xl bg-gradient-to-r from-fuchsia-600 to-cyan-500 p-4 text-white">
      <p className="text-sm font-semibold">Nu spelend</p>
      {magTitelTonen ? (
        <p className="text-2xl font-black">{trackTitel}</p>
      ) : (
        <p className="text-2xl font-black opacity-70">Titel verborgen (blinde modus)</p>
      )}
      {magArtiestTonen ? <p className="text-sm">{trackArtiest}</p> : <p className="text-sm opacity-70">Artiest verborgen</p>}

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-white/20 px-3 py-1 text-sm font-bold">
          Onthulling over: {resterend}s
        </span>
        <span className="rounded-full bg-white/20 px-3 py-1 text-sm font-bold">Status: {statusTekst}</span>
        <span className="rounded-full bg-white/20 px-3 py-1 text-sm font-bold">Start op: {startSeconden}s</span>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setResterend((v) => v + 10)}
          className="rounded-full bg-white px-3 py-1 text-sm font-extrabold text-fuchsia-700"
        >
          +10s
        </button>
        <button
          type="button"
          onClick={() => setResterend((v) => Math.max(0, v - 10))}
          className="rounded-full bg-white px-3 py-1 text-sm font-extrabold text-fuchsia-700"
        >
          -10s
        </button>
        <button
          type="button"
          onClick={() => {
            setIsOnthuld(true);
            setResterend(0);
            setLoopt(false);
          }}
          className="rounded-full bg-amber-300 px-3 py-1 text-sm font-extrabold text-amber-900"
        >
          Nu onthullen
        </button>
        <button
          type="button"
          onClick={() => {
            setIsOnthuld(false);
            setResterend(onthulSeconden);
            setLoopt(false);
          }}
          className="rounded-full bg-zinc-900 px-3 py-1 text-sm font-extrabold text-white"
        >
          Weer verbergen
        </button>
        <button
          type="button"
          onClick={() => setLoopt((v) => !v)}
          className="rounded-full bg-emerald-300 px-3 py-1 text-sm font-extrabold text-emerald-900"
        >
          {loopt ? "Timer pauzeren" : "Timer hervatten"}
        </button>
      </div>
    </div>
  );
}
