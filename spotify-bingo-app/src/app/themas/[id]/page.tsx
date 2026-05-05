import { revalidatePath } from "next/cache";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { SpotifyZoeker } from "@/components/spotify-zoeker";

export default async function ThemaDetailPagina({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const thema = await prisma.theme.findFirst({
    where: { id, userId: user.id },
    include: { tracks: { orderBy: { volgorde: "asc" } } },
  });

  if (!thema) notFound();

  async function wijzigTrack(formData: FormData) {
    "use server";
    const userInAction = await requireUser();
    const themeId = String(formData.get("themeId"));
    const trackId = String(formData.get("trackId"));
    const actie = String(formData.get("actie"));

    const track = await prisma.themeTrack.findFirst({
      where: { id: trackId, theme: { id: themeId, userId: userInAction.id } },
    });
    if (!track) return;

    if (actie === "delete") {
      await prisma.themeTrack.delete({ where: { id: trackId } });
    } else if (actie === "toggle-joker") {
      await prisma.themeTrack.update({
        where: { id: trackId },
        data: { isJoker: !track.isJoker },
      });
    } else if (actie === "save") {
      const start = Number(formData.get("startSeconden"));
      const onthul = Number(formData.get("onthulSeconden"));
      await prisma.themeTrack.update({
        where: { id: trackId },
        data: {
          startSeconden: Number.isFinite(start) ? Math.max(0, start) : null,
          onthulSeconden: Number.isFinite(onthul) ? Math.max(0, onthul) : null,
        },
      });
    } else if (actie === "omhoog" || actie === "omlaag") {
      const richting = actie === "omhoog" ? -1 : 1;
      const buur = await prisma.themeTrack.findFirst({
        where: { themeId: track.themeId, volgorde: track.volgorde + richting },
      });
      if (buur) {
        await prisma.$transaction([
          prisma.themeTrack.update({ where: { id: track.id }, data: { volgorde: buur.volgorde } }),
          prisma.themeTrack.update({ where: { id: buur.id }, data: { volgorde: track.volgorde } }),
        ]);
      }
    }

    revalidatePath(`/themas/${themeId}`);
    revalidatePath("/kaarten");
  }

  return (
    <section className="space-y-6">
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-black text-zinc-900">{thema.naam}</h1>
        <p className="mt-1 text-zinc-600">{thema.beschrijving ?? "Geen beschrijving opgegeven."}</p>
      </div>

      <SpotifyZoeker themeId={thema.id} />

      <div className="rounded-xl border border-zinc-200 bg-white p-4">
        <h2 className="text-xl font-extrabold">Trackinstellingen</h2>
        <p className="text-sm text-zinc-600">
          Stel per nummer startpositie en onthulvertraging in. Markeer jokers voor kaartgeneratie.
        </p>
        <div className="mt-4 space-y-3">
          {thema.tracks.map((track, index) => (
            <form key={track.id} action={wijzigTrack} className="rounded-lg border border-zinc-200 p-3">
              <input type="hidden" name="themeId" value={thema.id} />
              <input type="hidden" name="trackId" value={track.id} />
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-bold text-zinc-900">
                    {index + 1}. {track.titel}
                  </p>
                  <p className="text-sm text-zinc-600">{track.artiest}</p>
                </div>
                <div className="flex gap-2">
                  <button name="actie" value="omhoog" className="rounded-md bg-zinc-200 px-2 py-1 text-xs font-bold">
                    Omhoog
                  </button>
                  <button name="actie" value="omlaag" className="rounded-md bg-zinc-200 px-2 py-1 text-xs font-bold">
                    Omlaag
                  </button>
                  <button
                    name="actie"
                    value="toggle-joker"
                    className={`rounded-md px-2 py-1 text-xs font-bold ${
                      track.isJoker ? "bg-amber-300 text-amber-900" : "bg-zinc-200 text-zinc-800"
                    }`}
                  >
                    {track.isJoker ? "Joker aan" : "Maak joker"}
                  </button>
                </div>
              </div>
              <div className="mt-3 grid gap-2 md:grid-cols-3">
                <input
                  type="number"
                  name="startSeconden"
                  defaultValue={track.startSeconden ?? 0}
                  min={0}
                  className="rounded-md border border-zinc-300 px-2 py-1"
                />
                <input
                  type="number"
                  name="onthulSeconden"
                  defaultValue={track.onthulSeconden ?? 20}
                  min={0}
                  className="rounded-md border border-zinc-300 px-2 py-1"
                />
                <div className="flex gap-2">
                  <button name="actie" value="save" className="rounded-md bg-cyan-700 px-3 py-1 text-sm font-bold text-white">
                    Opslaan
                  </button>
                  <button
                    name="actie"
                    value="delete"
                    className="rounded-md bg-red-600 px-3 py-1 text-sm font-bold text-white"
                  >
                    Verwijderen
                  </button>
                </div>
              </div>
            </form>
          ))}
          {thema.tracks.length === 0 ? <p className="text-zinc-500">Nog geen tracks toegevoegd.</p> : null}
        </div>
      </div>
    </section>
  );
}
