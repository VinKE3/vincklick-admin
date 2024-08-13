import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

import prismadb from "@/lib/prismadb";

export async function GET(
  req: Request,
  { params }: { params: { valueId: string } }
) {
  try {
    if (!params.valueId) {
      return new NextResponse("Id deL valor es requerido", {
        status: 400,
      });
    }

    const attributeValue = await prismadb.attributeValue.findUnique({
      where: {
        id: params.valueId,
      },
    });

    return NextResponse.json(attributeValue);
  } catch (error) {
    console.log("[ATTRIBUTEVALUE_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { valueId: string; storeId: string } }
) {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("No identificado", { status: 403 });
    }

    if (!params.valueId) {
      return new NextResponse("Id deL valor es requerido", {
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

    const attributeValue = await prismadb.attributeValue.delete({
      where: {
        id: params.valueId,
      },
    });

    return NextResponse.json(attributeValue);
  } catch (error) {
    console.log("[ATTRIBUTEVALUE_DELETE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { valueId: string; storeId: string } }
) {
  try {
    const { userId } = auth();

    const body = await req.json();

    const { value, attributeId } = body;

    if (!userId) {
      return new NextResponse("No identificado", { status: 403 });
    }

    if (!attributeId) {
      return new NextResponse("Id del atributo es requerido", {
        status: 400,
      });
    }

    if (!value) {
      return new NextResponse("Valor es requerido", { status: 400 });
    }

    if (!params.valueId) {
      return new NextResponse("Id del valor es requerido", {
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

    const attributeValue = await prismadb.attributeValue.update({
      where: {
        id: params.valueId,
      },
      data: {
        value,
        attributeId,
      },
    });

    return NextResponse.json(attributeValue);
  } catch (error) {
    console.log("[ATTRIBUTEVALUE_PATCH]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
