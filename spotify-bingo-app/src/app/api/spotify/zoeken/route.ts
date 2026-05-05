import { NextResponse } from "next/server";
import { requireUser } from "@/lib/session";
import { getSpotifyAccessToken } from "@/lib/spotify";

type SpotifyTrackResponse = {
  id: string;
  name: string;
  preview_url: string | null;
  artists: Array<{ name: string }>;
  album?: {
    name?: string;
    images?: Array<{ url: string }>;
  };
};

export async function GET(req: Request) {
  const user = await requireUser();
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q");

  if (!q || q.length < 2) {
    return NextResponse.json({ items: [] });
  }

  const { accessToken } = await getSpotifyAccessToken(user.id);
  if (!accessToken) {
    return NextResponse.json(
      { fout: "Geen Spotify toegangstoken gevonden. Log opnieuw in." },
      { status: 401 },
    );
  }

  const spotifyRes = await fetch(
    `https://api.spotify.com/v1/search?type=track&limit=10&q=${encodeURIComponent(q)}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    },
  );

  if (!spotifyRes.ok) {
    return NextResponse.json({ fout: "Zoeken in Spotify is mislukt." }, { status: 400 });
  }

  const data = (await spotifyRes.json()) as { tracks?: { items?: SpotifyTrackResponse[] } };
  const items = (data.tracks?.items ?? []).map((t) => ({
    id: t.id as string,
    titel: t.name,
    artiest: (t.artists ?? []).map((a) => a.name).join(", "),
    albumNaam: t.album?.name,
    albumAfbeelding: t.album?.images?.[0]?.url,
    previewUrl: t.preview_url,
  }));

  return NextResponse.json({ items });
}
