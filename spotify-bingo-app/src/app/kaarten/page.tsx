import { KaartenGenerator } from "@/components/kaarten-generator";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

export default async function KaartenPagina() {
  const user = await requireUser();
  const themas = await prisma.theme.findMany({
    where: { userId: user.id },
    include: { tracks: true },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <section className="space-y-6">
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-black text-zinc-900">Bingokaart generator</h1>
        <p className="mt-1 text-zinc-600">
          Genereer unieke kaarten met jokerlogica, blinde modus en print-export.
        </p>
      </div>
      {themas.length === 0 ? (
        <p className="rounded-xl border border-zinc-200 bg-white p-4 text-zinc-700">
          Maak eerst een thema met tracks voordat je kaarten genereert.
        </p>
      ) : (
        <KaartenGenerator themas={themas} />
      )}
    </section>
  );
}
