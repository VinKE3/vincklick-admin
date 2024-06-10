import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

import prismadb from "@/lib/prismadb";

export async function GET(
  req: Request,
  { params }: { params: { subCategoryId: string } }
) {
  try {
    if (!params.subCategoryId) {
      return new NextResponse("Id de la categoría es requerido", {
        status: 400,
      });
    }

    const subCategory = await prismadb.subCategory.findUnique({
      where: {
        id: params.subCategoryId,
      },
    });

    return NextResponse.json(subCategory);
  } catch (error) {
    console.log("[SUBCATEGORY_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { subCategoryId: string; storeId: string } }
) {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("No identificado", { status: 403 });
    }

    if (!params.subCategoryId) {
      return new NextResponse("Id de la subcategoría es requerido", {
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

    const subCategory = await prismadb.subCategory.delete({
      where: {
        id: params.subCategoryId,
      },
    });

    return NextResponse.json(subCategory);
  } catch (error) {
    console.log("[SUBCATEGORY_DELETE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { subCategoryId: string; storeId: string } }
) {
  try {
    const { userId } = auth();

    const body = await req.json();

    const { name, categoryId } = body;

    if (!userId) {
      return new NextResponse("No identificado", { status: 403 });
    }

    if (!categoryId) {
      return new NextResponse("Id de la categoría es requerido", {
        status: 400,
      });
    }

    if (!name) {
      return new NextResponse("Nombre es requerido", { status: 400 });
    }

    if (!params.subCategoryId) {
      return new NextResponse("Id de la Subcategoría es requerido", {
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

    const subCategory = await prismadb.subCategory.update({
      where: {
        id: params.subCategoryId,
      },
      data: {
        name,
        categoryId,
      },
    });

    return NextResponse.json(subCategory);
  } catch (error) {
    console.log("[SUBCATEGORY_PATCH]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
