import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

import prismadb from "@/lib/prismadb";

export async function POST(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const { userId } = auth();

    const body = await req.json();

    const { name } = body;

    if (!userId) {
      return new NextResponse("No autorizado", { status: 403 });
    }

    if (!params.storeId) {
      return new NextResponse("Id de la tienda es requerido", { status: 400 });
    }

    if (!name) {
      return new NextResponse("Nombre es requerido", { status: 400 });
    }
    const storeByUserId = await prismadb.store.findFirst({
      where: {
        id: params.storeId,
        userId,
      },
    });

    if (!storeByUserId) {
      return new NextResponse("No autorizado", { status: 405 });
    }

    const attribute = await prismadb.attribute.create({
      data: {
        storeId: params.storeId,
        name,
      },
    });

    return NextResponse.json(attribute);
  } catch (error) {
    console.log("[ATTRIBUTES_POST]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function GET(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    if (!params.storeId) {
      return new NextResponse("Id de la tienda es requerido", { status: 400 });
    }

    const attributes = await prismadb.attribute.findMany({
      where: {
        storeId: params.storeId,
      },
      include: {
        values: true,
      },
    });

    return NextResponse.json(attributes);
  } catch (error) {
    console.log("[ATTRIBUTES_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
