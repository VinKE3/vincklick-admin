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

    const { name, imageUrl } = body;

    if (!userId) {
      return new NextResponse("No identificado", { status: 403 });
    }
    if (!name) {
      return new NextResponse("Nombre es requerido", { status: 400 });
    }
    if (!imageUrl) {
      return new NextResponse("IURL de la Imágen es requerida", {
        status: 400,
      });
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

    const existingBrand = await prismadb.brand.findFirst({
      where: {
        name: name,
      },
    });

    if (existingBrand) {
      return new NextResponse("La marca ya existe", { status: 409 });
    }

    //*Crear la nueva marca

    const brand = await prismadb.brand.create({
      data: {
        name,
        imageUrl,
        storeId: params.storeId,
      },
    });
    return NextResponse.json(brand);
  } catch (error) {
    console.log("[BRAND_POST]", error);
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
    const brands = await prismadb.brand.findMany({
      where: {
        storeId: params.storeId,
      },
    });
    return NextResponse.json(brands);
  } catch (error) {
    console.log("[BRAND_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
