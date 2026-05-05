import { prisma } from "@/lib/prisma";

type SpotifyTokenResult = {
  accessToken: string | null;
};

export async function getSpotifyAccessToken(userId: string): Promise<SpotifyTokenResult> {
  const account = await prisma.account.findFirst({
    where: { userId, provider: "spotify" },
    orderBy: { id: "desc" },
  });

  if (!account?.access_token) {
    return { accessToken: null };
  }

  return { accessToken: account.access_token };
}
