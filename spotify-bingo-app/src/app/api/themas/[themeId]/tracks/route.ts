import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

export async function POST(req: Request, { params }: { params: Promise<{ themeId: string }> }) {
  const user = await requireUser();
  const { themeId } = await params;
  const thema = await prisma.theme.findFirst({
    where: { id: themeId, userId: user.id },
    include: { tracks: true },
  });

  if (!thema) {
    return NextResponse.json({ fout: "Thema niet gevonden." }, { status: 404 });
  }

  const body = await req.json();
  const titel = String(body.titel ?? "").trim();
  const artiest = String(body.artiest ?? "").trim();
  const spotifyTrackId = String(body.spotifyTrackId ?? "").trim();

  if (!titel || !artiest || !spotifyTrackId) {
    return NextResponse.json({ fout: "Titel, artiest en track-ID zijn verplicht." }, { status: 400 });
  }

  const track = await prisma.themeTrack.create({
    data: {
      themeId,
      spotifyTrackId,
      titel,
      artiest,
      albumNaam: body.albumNaam ? String(body.albumNaam) : null,
      albumAfbeelding: body.albumAfbeelding ? String(body.albumAfbeelding) : null,
      previewUrl: body.previewUrl ? String(body.previewUrl) : null,
      startSeconden: typeof body.startSeconden === "number" ? body.startSeconden : null,
      onthulSeconden: typeof body.onthulSeconden === "number" ? body.onthulSeconden : null,
      volgorde: thema.tracks.length,
    },
  });

  return NextResponse.json({ track });
}
