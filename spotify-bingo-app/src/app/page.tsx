import Link from "next/link";
import { auth } from "@/lib/auth";

export default async function Home() {
  const session = await auth();
  return (
    <section className="grid gap-6 rounded-3xl border border-fuchsia-200 bg-white p-8 shadow-sm md:grid-cols-2">
      <div className="space-y-4">
        <p className="text-sm font-bold uppercase tracking-wide text-fuchsia-700">Muziekavond</p>
        <h1 className="text-4xl font-black leading-tight text-zinc-900">
          Bouw en host je eigen Spotify Bingo in het Nederlands
        </h1>
        <p className="text-zinc-700">
          Maak thema&apos;s, kies jokernummers, genereer printklare kaarten en bestuur het spel live
          met onthultimers en winpatronen.
        </p>
        {session?.user ? (
          <Link
            href="/dashboard"
            className="inline-flex rounded-full bg-fuchsia-700 px-5 py-3 font-bold text-white hover:bg-fuchsia-800"
          >
            Naar dashboard
          </Link>
        ) : (
          <Link
            href="/api/auth/signin/spotify"
            className="inline-flex rounded-full bg-emerald-600 px-5 py-3 font-bold text-white hover:bg-emerald-700"
          >
            Inloggen met Spotify
          </Link>
        )}
      </div>
      <div className="rounded-2xl bg-gradient-to-br from-fuchsia-600 to-cyan-500 p-6 text-white">
        <h2 className="text-2xl font-extrabold">Wat zit er al in?</h2>
        <ul className="mt-4 space-y-2 text-sm font-medium">
          <li>• Thema&apos;s met eigen trackinstellingen (start + onthulvertraging)</li>
          <li>• Jokermarkering en kaartgenerator (3x3, 4x4, 5x5)</li>
          <li>• Hostscherm met pauze, onthulknoppen en sessievoortgang</li>
          <li>• Spotify OAuth basis klaar voor Web Playback / extern afspelen</li>
        </ul>
      </div>
    </section>
  );
}
