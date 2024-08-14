import { NextResponse } from "next/server";

import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs/server";

export async function POST(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const { userId } = auth();

    const body = await req.json();

    const { name, value } = body;

    if (!userId) {
      return new NextResponse("No autentificado", { status: 403 });
    }
    if (!params.storeId) {
      return new NextResponse("Id de la tienda es requerido", {
        status: 400,
      });
    }

    if (!name) {
      return new NextResponse("Nombre es requerido", { status: 400 });
    }

    if (!value) {
      return new NextResponse("Valor es requerido", { status: 400 });
    }

    if (!params.storeId) {
      return new NextResponse("Id de la tienda es requerido", { status: 400 });
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

    const existingColor = await prismadb.color.findFirst({
      where: {
        OR: [{ name }, { value }],
      },
    });

    if (existingColor) {
      return new NextResponse("El color o el valor ya existen", {
        status: 409,
      });
    }

    //*Crear el nuevo color

    const color = await prismadb.color.create({
      data: {
        name,
        value,
        storeId: params.storeId,
      },
    });

    return NextResponse.json(color);
  } catch (error) {
    console.log("[COLORS_POST]", error);
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

    const colors = await prismadb.color.findMany({
      where: {
        storeId: params.storeId,
      },
    });

    return NextResponse.json(colors);
  } catch (error) {
    console.log("[COLORS_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
