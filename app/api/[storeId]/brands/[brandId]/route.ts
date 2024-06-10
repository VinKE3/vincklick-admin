import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

import prismadb from "@/lib/prismadb";

export async function GET(
  req: Request,
  { params }: { params: { brandId: string } }
) {
  try {
    if (!params.brandId) {
      return new NextResponse("Id de la marca es requerido", { status: 400 });
    }
    const brand = await prismadb.brand.findUnique({
      where: {
        id: params.brandId,
      },
    });
    return NextResponse.json(brand);
  } catch (error) {
    console.log("[BRAND_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { brandId: string; storeId: string } }
) {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("No autorizado", { status: 403 });
    }

    if (!params.brandId) {
      return new NextResponse("Id de la marca es requerido", {
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

    const brand = await prismadb.brand.delete({
      where: {
        id: params.brandId,
      },
    });
    return NextResponse.json(brand);
  } catch (error) {
    console.log("[BRAND_DELETE", error);
    return new NextResponse("Interal error", {
      status: 500,
    });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { brandId: string; storeId: string } }
) {
  try {
    const { userId } = auth();

    const body = await req.json();

    const { name, imageUrl } = body;

    if (!userId) {
      return new NextResponse("No autorizado", { status: 403 });
    }

    if (!name) {
      return new NextResponse("Nombre es requerido", { status: 400 });
    }
    if (!imageUrl) {
      return new NextResponse("URL de la Imágen es requerida", { status: 400 });
    }
    if (!params.brandId) {
      return new NextResponse("Id de la marca es requerido", { status: 400 });
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

    const brand = await prismadb.brand.update({
      where: {
        id: params.brandId,
      },
      data: {
        name,
        imageUrl,
      },
    });
    return NextResponse.json(brand);
  } catch (error) {
    console.log("[COLOR_PATCH]", error);
    return new NextResponse("Internal Error", {
      status: 500,
    });
  }
}
