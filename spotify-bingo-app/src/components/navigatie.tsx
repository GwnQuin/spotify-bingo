import Link from "next/link";
import { auth } from "@/lib/auth";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/themas", label: "Thema's" },
  { href: "/kaarten", label: "Kaartgenerator" },
  { href: "/host", label: "Host scherm" },
];

export async function Navigatie() {
  const session = await auth();

  return (
    <header className="border-b border-zinc-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/dashboard" className="text-xl font-black tracking-tight text-fuchsia-700">
          Spotify Bingo NL
        </Link>
        <nav className="flex items-center gap-3">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full px-3 py-1.5 text-sm font-semibold text-zinc-700 hover:bg-zinc-100"
            >
              {link.label}
            </Link>
          ))}
          {session?.user ? (
            <Link
              href="/api/auth/signout"
              className="rounded-full bg-zinc-900 px-4 py-1.5 text-sm font-semibold text-white hover:bg-zinc-700"
            >
              Uitloggen
            </Link>
          ) : null}
        </nav>
      </div>
    </header>
  );
}
