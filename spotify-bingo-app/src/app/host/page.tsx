import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { winpatronen } from "@/lib/bingo";
import { HostLiveControls } from "@/components/host-live-controls";

const labels: Record<(typeof winpatronen)[number], string> = {
  ENKELE_RIJ: "Enkele rij",
  ENKELE_KOLOM: "Enkele kolom",
  DIAGONAAL: "Diagonaal",
  T_VORM: "T-vorm",
  L_VORM: "L-vorm",
  X_VORM: "X-vorm",
  POSTZEGEL: "Postzegel",
  BUITENRAND: "Buitenrand",
  VOLLE_KAART: "Volle kaart",
};

export default async function HostPagina() {
  const user = await requireUser();
  const [themas, sessie] = await Promise.all([
    prisma.theme.findMany({
      where: { userId: user.id },
      include: { tracks: { orderBy: { volgorde: "asc" } } },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.gameSession.findFirst({
      where: { userId: user.id },
      orderBy: { updatedAt: "desc" },
      include: { theme: { include: { tracks: { orderBy: { volgorde: "asc" } } } } },
    }),
  ]);

  async function startSessie(formData: FormData) {
    "use server";
    const userInAction = await requireUser();
    const themeId = String(formData.get("themeId") ?? "");
    const speelmodus = String(formData.get("speelmodus") ?? "EXTERN");
    const blindekaartmodus = formData.get("blindekaartmodus") === "on";
    const toonArtiestVoorOnthulling = formData.get("toonArtiestVoorOnthulling") === "on";
    const willekeurigeVolgorde = formData.get("willekeurigeVolgorde") === "on";
    const actievePatronen = formData.getAll("patronen").map(String);

    if (!themeId) return;

    await prisma.gameSession.create({
      data: {
        userId: userInAction.id,
        themeId,
        naam: `Sessie ${new Date().toLocaleString("nl-NL")}`,
        speelmodus,
        blindekaartmodus,
        toonArtiestVoorOnthulling,
        willekeurigeVolgorde,
        actievePatronenJson: JSON.stringify(actievePatronen.length ? actievePatronen : ["ENKELE_RIJ"]),
      },
    });

    revalidatePath("/host");
    revalidatePath("/dashboard");
  }

  async function sessieActie(formData: FormData) {
    "use server";
    const userInAction = await requireUser();
    const sessieId = String(formData.get("sessieId"));
    const actie = String(formData.get("actie"));
    const s = await prisma.gameSession.findFirst({
      where: { id: sessieId, userId: userInAction.id },
      include: { theme: { include: { tracks: true } } },
    });
    if (!s) return;

    if (actie === "volgende") {
      const maxIndex = Math.max(0, s.theme.tracks.length - 1);
      await prisma.gameSession.update({
        where: { id: s.id },
        data: { huidigeTrackIndex: Math.min(maxIndex, s.huidigeTrackIndex + 1), isPauze: false },
      });
    } else if (actie === "vorige") {
      await prisma.gameSession.update({
        where: { id: s.id },
        data: { huidigeTrackIndex: Math.max(0, s.huidigeTrackIndex - 1), isPauze: false },
      });
    } else if (actie === "pauze") {
      await prisma.gameSession.update({ where: { id: s.id }, data: { isPauze: !s.isPauze } });
    }
    revalidatePath("/host");
  }

  const huidigeTrack = sessie?.theme.tracks[sessie.huidigeTrackIndex];
  const gekozenPatronen = sessie ? (JSON.parse(sessie.actievePatronenJson) as string[]) : [];

  return (
    <section className="space-y-6">
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-black text-zinc-900">Host scherm</h1>
        <p className="mt-1 text-zinc-600">
          Beheer je livesessie met onthulling, pauze en patroonoverzicht.
        </p>
      </div>

      <form action={startSessie} className="rounded-xl border border-zinc-200 bg-white p-4">
        <h2 className="text-xl font-extrabold">Nieuwe sessie starten</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <select name="themeId" className="rounded-lg border border-zinc-300 px-3 py-2" required>
            <option value="">Kies thema/afspeellijst</option>
            {themas.map((thema) => (
              <option key={thema.id} value={thema.id}>
                {thema.naam} ({thema.tracks.length} tracks)
              </option>
            ))}
          </select>
          <select name="speelmodus" className="rounded-lg border border-zinc-300 px-3 py-2">
            <option value="IN_APP">In-app (Web Playback SDK)</option>
            <option value="EXTERN">Extern (Spotify app)</option>
          </select>
          <label className="flex items-center gap-2 text-sm font-semibold">
            <input name="blindekaartmodus" type="checkbox" />
            Blinde kaartemodus
          </label>
          <label className="flex items-center gap-2 text-sm font-semibold">
            <input name="toonArtiestVoorOnthulling" type="checkbox" />
            Artiest tonen voor onthulling
          </label>
          <label className="flex items-center gap-2 text-sm font-semibold">
            <input name="willekeurigeVolgorde" type="checkbox" />
            Willekeurige volgorde
          </label>
        </div>
        <div className="mt-4">
          <p className="text-sm font-bold text-zinc-700">Actieve winpatronen</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {winpatronen.map((p) => (
              <label key={p} className="rounded-full border border-zinc-300 px-3 py-1 text-sm font-semibold">
                <input className="mr-2" type="checkbox" name="patronen" value={p} />
                {labels[p]}
              </label>
            ))}
          </div>
        </div>
        <button type="submit" className="mt-4 rounded-full bg-fuchsia-700 px-5 py-2 font-bold text-white">
          Start sessie
        </button>
      </form>

      {sessie ? (
        <article className="rounded-xl border border-zinc-200 bg-white p-4">
          <h2 className="text-2xl font-extrabold">Live spelweergave</h2>
          <p className="text-sm text-zinc-600">
            Voortgang: nummer {sessie.huidigeTrackIndex + 1} van {sessie.theme.tracks.length}
          </p>
          {sessie.isPauze ? (
            <div className="mt-3 rounded-xl bg-zinc-900 p-6 text-center text-white">
              <p className="text-2xl font-black">Pauze</p>
              <p className="mt-1">Zo zijn we terug! Haal even wat te drinken.</p>
            </div>
          ) : (
            <HostLiveControls
              key={`${sessie.id}-${sessie.huidigeTrackIndex}`}
              trackTitel={huidigeTrack?.titel ?? "Geen track"}
              trackArtiest={huidigeTrack?.artiest ?? "-"}
              startSeconden={huidigeTrack?.startSeconden ?? 0}
              onthulSeconden={huidigeTrack?.onthulSeconden ?? 20}
              blindekaartmodus={sessie.blindekaartmodus}
              toonArtiestVoorOnthulling={sessie.toonArtiestVoorOnthulling}
            />
          )}

          <form action={sessieActie} className="mt-4 flex flex-wrap gap-2">
            <input type="hidden" name="sessieId" value={sessie.id} />
            <button name="actie" value="vorige" className="rounded-full bg-zinc-200 px-4 py-2 text-sm font-bold">
              Vorig nummer
            </button>
            <button name="actie" value="volgende" className="rounded-full bg-cyan-700 px-4 py-2 text-sm font-bold text-white">
              Volgende nummer
            </button>
            <button
              name="actie"
              value="pauze"
              className="rounded-full bg-amber-500 px-4 py-2 text-sm font-bold text-amber-950"
            >
              {sessie.isPauze ? "Hervat spel" : "Pauze scherm"}
            </button>
            <a
              className="rounded-full bg-emerald-700 px-4 py-2 text-sm font-bold text-white"
              href={huidigeTrack ? `https://open.spotify.com/track/${huidigeTrack.spotifyTrackId}` : "#"}
              target="_blank"
              rel="noreferrer"
            >
              Open in Spotify app
            </a>
          </form>

          <div className="mt-4">
            <p className="text-sm font-bold text-zinc-700">Actieve patronen</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {gekozenPatronen.map((p) => (
                <span key={p} className="rounded-full bg-zinc-100 px-3 py-1 text-sm font-semibold">
                  {labels[p as keyof typeof labels] ?? p}
                </span>
              ))}
            </div>
          </div>
        </article>
      ) : (
        <p className="rounded-xl border border-zinc-200 bg-white p-4 text-zinc-700">
          Nog geen actieve sessie. Start hierboven een sessie.
        </p>
      )}
    </section>
  );
}
