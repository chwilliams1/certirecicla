import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST /api/upload/check-new-clients
// Receives client names from transformed data, returns which are new vs existing
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.companyId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { clientNames } = (await req.json()) as { clientNames: string[] };

  if (!clientNames || clientNames.length === 0) {
    return NextResponse.json({ newClients: [] });
  }

  const uniqueNames = Array.from(new Set(clientNames));

  const existingClients = await prisma.client.findMany({
    where: {
      companyId: session.user.companyId,
      active: true,
      name: { in: uniqueNames },
    },
    select: { name: true },
  });

  const existingSet = new Set(existingClients.map((c) => c.name.toLowerCase()));
  const newClients = uniqueNames.filter(
    (name) => !existingSet.has(name.toLowerCase())
  );

  return NextResponse.json({ newClients });
}
