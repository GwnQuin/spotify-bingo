import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

export default async function DashboardPagina() {
  const user = await requireUser();
  const [themas, sessies] = await Promise.all([
    prisma.theme.findMany({
      where: { userId: user.id },
      include: { tracks: true },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.gameSession.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: "desc" },
      take: 5,
    }),
  ]);

  return (
    <section className="space-y-6">
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-black text-zinc-900">Dashboard</h1>
        <p className="mt-1 text-zinc-600">
          Welkom terug. Beheer je thema&apos;s, genereer kaarten en start een livesessie.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-zinc-200 bg-white p-4">
          <p className="text-sm text-zinc-500">Aantal thema&apos;s</p>
          <p className="text-3xl font-black text-fuchsia-700">{themas.length}</p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-4">
          <p className="text-sm text-zinc-500">Tracks totaal</p>
          <p className="text-3xl font-black text-cyan-700">
            {themas.reduce((acc, t) => acc + t.tracks.length, 0)}
          </p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-4">
          <p className="text-sm text-zinc-500">Recente sessies</p>
          <p className="text-3xl font-black text-emerald-700">{sessies.length}</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-zinc-200 bg-white p-4">
          <h2 className="text-xl font-extrabold">Snel starten</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link className="rounded-full bg-fuchsia-700 px-4 py-2 text-sm font-bold text-white" href="/themas">
              Thema&apos;s beheren
            </Link>
            <Link className="rounded-full bg-cyan-700 px-4 py-2 text-sm font-bold text-white" href="/kaarten">
              Kaarten genereren
            </Link>
            <Link className="rounded-full bg-emerald-700 px-4 py-2 text-sm font-bold text-white" href="/host">
              Host scherm
            </Link>
          </div>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-4">
          <h2 className="text-xl font-extrabold">Laatste sessies</h2>
          <ul className="mt-2 space-y-2 text-sm">
            {sessies.length === 0 ? (
              <li className="text-zinc-500">Nog geen sessies gestart.</li>
            ) : (
              sessies.map((s) => (
                <li key={s.id} className="rounded-lg bg-zinc-50 px-3 py-2">
                  <span className="font-semibold">{s.naam}</span> -{" "}
                  {s.isPauze ? "In pauze" : "Actief / afgerond"}
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </section>
  );
}
