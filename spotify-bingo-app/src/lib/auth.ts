import { DefaultSession, getServerSession, NextAuthOptions } from "next-auth";
import Spotify from "next-auth/providers/spotify";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "database",
  },
  providers: [
    Spotify({
      clientId: process.env.AUTH_SPOTIFY_ID ?? "",
      clientSecret: process.env.AUTH_SPOTIFY_SECRET ?? "",
      authorization:
        "https://accounts.spotify.com/authorize?scope=user-read-email%20user-read-private%20user-modify-playback-state%20user-read-playback-state%20user-read-currently-playing%20streaming",
    }),
  ],
  callbacks: {
    async session({
      session,
      user,
    }: {
      session: DefaultSession & { user?: DefaultSession["user"] & { id?: string } };
      user: { id: string };
    }) {
      if (session.user) {
        session.user.id = user.id;
      }

      return session;
    },
  },
  pages: {
    signIn: "/inloggen",
  },
};

export function auth() {
  return getServerSession(authOptions);
}
