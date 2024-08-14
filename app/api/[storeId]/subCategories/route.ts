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

    const { name, categoryId } = body;

    if (!userId) {
      return new NextResponse("No autentificado", { status: 403 });
    }

    if (!name) {
      return new NextResponse("Nombre es requerido", { status: 400 });
    }

    if (!categoryId) {
      return new NextResponse("Categoria Id es requerido", { status: 400 });
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

    const existingSubcategory = await prismadb.subCategory.findFirst({
      where: {
        name: name,
      },
    });

    if (existingSubcategory) {
      return new NextResponse("La subcategoría ya existe", { status: 409 });
    }

    //*Crear la nueva subcategoría
    const subCategory = await prismadb.subCategory.create({
      data: {
        name,
        categoryId,
        storeId: params.storeId,
      },
    });

    return NextResponse.json(subCategory);
  } catch (error) {
    console.log("[SUBCATEGORIES_POST]", error);
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

    const subCategories = await prismadb.subCategory.findMany({
      where: {
        storeId: params.storeId,
      },
    });

    return NextResponse.json(subCategories);
  } catch (error) {
    console.log("[SUBCATEGORIES_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
