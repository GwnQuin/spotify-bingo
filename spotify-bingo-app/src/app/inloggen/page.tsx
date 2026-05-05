import Link from "next/link";

export default function InloggenPagina() {
  return (
    <section className="mx-auto max-w-lg rounded-2xl border border-zinc-200 bg-white p-8">
      <h1 className="text-3xl font-black text-zinc-900">Inloggen</h1>
      <p className="mt-2 text-zinc-600">
        Log in met Spotify om je thema&apos;s, instellingen en sessies op te slaan.
      </p>
      <Link
        className="mt-6 block w-full rounded-xl bg-emerald-600 px-4 py-3 text-center font-bold text-white hover:bg-emerald-700"
        href="/api/auth/signin/spotify"
      >
        Inloggen met Spotify
      </Link>
    </section>
  );
}
