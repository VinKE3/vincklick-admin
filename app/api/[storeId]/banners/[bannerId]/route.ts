import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

import prismadb from "@/lib/prismadb";

export async function GET(
  req: Request,
  { params }: { params: { bannerId: string } }
) {
  try {
    if (!params.bannerId) {
      return new NextResponse("Id del banner es requerido", { status: 400 });
    }

    const banner = await prismadb.banner.findUnique({
      where: {
        id: params.bannerId,
      },
    });

    return NextResponse.json(banner);
  } catch (error) {
    console.log("[BANNER_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { bannerId: string; storeId: string } }
) {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("No autorizado", { status: 403 });
    }

    if (!params.bannerId) {
      return new NextResponse("Id del banner es requerido", { status: 400 });
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

    const banner = await prismadb.banner.delete({
      where: {
        id: params.bannerId,
      },
    });

    return NextResponse.json(banner);
  } catch (error) {
    console.log("[BANNER_DELETE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { bannerId: string; storeId: string } }
) {
  try {
    const { userId } = auth();

    const body = await req.json();

    const {
      heading,
      subHeading,
      imageUrl,
      colorId,
      color,
      btnText,
      categoryId,
      category,
    } = body;

    if (!userId) {
      return new NextResponse("No autorizado", { status: 403 });
    }

    if (!params.storeId) {
      return new NextResponse("Id de la tienda es requerido", { status: 400 });
    }

    if (!heading) {
      return new NextResponse("Cabecera es requerido", { status: 400 });
    }

    if (!imageUrl) {
      return new NextResponse("URL de la Imagen  es requerido", {
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

    const banner = await prismadb.banner.update({
      where: {
        id: params.bannerId,
      },
      data: {
        heading,
        subHeading,
        imageUrl,
        storeId: params.storeId,
        colorId,
        color,
        btnText,
        categoryId,
        category,
      },
    });

    return NextResponse.json(banner);
  } catch (error) {
    console.log("[BANNER_PATCH]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
