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

    const { name, billboardId, imageUrl, colorId } = body;

    if (!userId) {
      return new NextResponse("No identificado", { status: 403 });
    }

    if (!name) {
      return new NextResponse("Nombre es requerido", { status: 400 });
    }

    if (!imageUrl) {
      return new NextResponse("URL de la Imágen es requerid", { status: 400 });
    }

    if (!billboardId) {
      return new NextResponse("Id del banner de categoría requerido", {
        status: 400,
      });
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

    const existingCategory = await prismadb.category.findFirst({
      where: {
        name: name,
      },
    });

    if (existingCategory) {
      return new NextResponse("La categoría ya existe", { status: 409 });
    }

    //*Crear la nueva categoría

    const category = await prismadb.category.create({
      data: {
        name,
        billboardId,
        imageUrl,
        colorId,
        storeId: params.storeId,
      },
    });

    return NextResponse.json(category);
  } catch (error) {
    console.log("[CATEGORIES_POST]", error);
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

    const categories = await prismadb.category.findMany({
      where: {
        storeId: params.storeId,
      },
      include: {
        banners: true,
        subcategories: true,
      },
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.log("[CATEGORIES_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
