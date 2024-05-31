import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

import prismadb from "@/lib/prismadb";

export async function GET(
  req: Request,
  { params }: { params: { attributeId: string } }
) {
  try {
    if (!params.attributeId) {
      return new NextResponse("Atributo id es requerido", { status: 400 });
    }

    const attribute = await prismadb.attribute.findUnique({
      where: {
        id: params.attributeId,
      },
    });

    return NextResponse.json(attribute);
  } catch (error) {
    console.log("[ATTRIBUTE_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { attributeId: string; storeId: string } }
) {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 403 });
    }

    if (!params.attributeId) {
      return new NextResponse("Billboard id is required", { status: 400 });
    }

    const storeByUserId = await prismadb.store.findFirst({
      where: {
        id: params.storeId,
        userId,
      },
    });

    if (!storeByUserId) {
      return new NextResponse("Unauthorized", { status: 405 });
    }

    const attribute = await prismadb.attribute.delete({
      where: {
        id: params.attributeId,
      },
    });

    return NextResponse.json(attribute);
  } catch (error) {
    console.log("[ATTRIBUTE_DELETE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { attributeId: string; storeId: string } }
) {
  try {
    const { userId } = auth();

    const body = await req.json();

    const { name, values } = body;

    if (!userId) {
      return new NextResponse("No autentificado", { status: 403 });
    }

    if (!params.storeId) {
      return new NextResponse("Store id es requerido", { status: 400 });
    }

    if (!name) {
      return new NextResponse("nombre es requerido", { status: 400 });
    }

    if (!values) {
      return new NextResponse("Valores son requeridos", {
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
      return new NextResponse("Unauthorized", { status: 405 });
    }

    const attribute = await prismadb.attribute.update({
      where: {
        id: params.attributeId,
      },
      data: {
        name,
        values,
      },
    });

    return NextResponse.json(attribute);
  } catch (error) {
    console.log("[BANNER_PATCH]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
