import Link from "next/link";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

export default async function ThemasPagina() {
  const user = await requireUser();
  const themas = await prisma.theme.findMany({
    where: { userId: user.id },
    include: { tracks: true },
    orderBy: { updatedAt: "desc" },
  });

  async function nieuwThema(formData: FormData) {
    "use server";
    const userInAction = await requireUser();
    const naam = String(formData.get("naam") ?? "").trim();
    const beschrijving = String(formData.get("beschrijving") ?? "").trim();

    if (!naam) return;

    await prisma.theme.create({
      data: {
        userId: userInAction.id,
        naam,
        beschrijving: beschrijving || null,
      },
    });

    revalidatePath("/themas");
    revalidatePath("/dashboard");
  }

  return (
    <section className="space-y-6">
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-black text-zinc-900">Thema&apos;s beheren</h1>
        <p className="mt-1 text-zinc-600">
          Maak herbruikbare muziekthema&apos;s met eigen tracks, jokerinstellingen en timings.
        </p>
      </div>

      <form action={nieuwThema} className="grid gap-3 rounded-xl border border-zinc-200 bg-white p-4 md:grid-cols-3">
        <input
          name="naam"
          placeholder="Themanaam (bijv. Nederlandse Hits)"
          className="rounded-lg border border-zinc-300 px-3 py-2"
          required
        />
        <input
          name="beschrijving"
          placeholder="Korte beschrijving"
          className="rounded-lg border border-zinc-300 px-3 py-2"
        />
        <button className="rounded-lg bg-fuchsia-700 px-4 py-2 font-bold text-white hover:bg-fuchsia-800" type="submit">
          Thema aanmaken
        </button>
      </form>

      <div className="grid gap-3 md:grid-cols-2">
        {themas.length === 0 ? (
          <p className="text-zinc-600">Nog geen thema&apos;s. Maak hierboven je eerste thema aan.</p>
        ) : (
          themas.map((thema) => (
            <article key={thema.id} className="rounded-xl border border-zinc-200 bg-white p-4">
              <h2 className="text-xl font-extrabold text-zinc-900">{thema.naam}</h2>
              <p className="mt-1 text-sm text-zinc-600">{thema.beschrijving ?? "Geen beschrijving"}</p>
              <p className="mt-2 text-sm font-semibold text-zinc-800">Tracks: {thema.tracks.length}</p>
              <Link
                className="mt-3 inline-flex rounded-full bg-cyan-700 px-4 py-2 text-sm font-bold text-white hover:bg-cyan-800"
                href={`/themas/${thema.id}`}
              >
                Thema bewerken
              </Link>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
