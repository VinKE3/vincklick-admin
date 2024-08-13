import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

import prismadb from "@/lib/prismadb";

export async function POST(
  req: Request,
  { params }: { params: { storeId: string; attributeId: string } }
) {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("No identificado", { status: 403 });
    }

    const body = await req.json();
    const { value } = body;

    if (!value) {
      return new NextResponse("Valor es requerido", { status: 400 });
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

    // Verificar si el valor ya existe para el atributo
    const existingValue = await prismadb.attributeValue.findFirst({
      where: {
        value: value,
        attributeId: params.attributeId,
      },
    });

    if (existingValue) {
      return new NextResponse("El valor ya existe", { status: 409 });
    }

    // Crear el nuevo valor del atributo
    const attributeValue = await prismadb.attributeValue.create({
      data: {
        value,
        attributeId: params.attributeId,
        storeId: params.storeId, // Include storeId here
      },
    });

    return NextResponse.json(attributeValue);
  } catch (error) {
    console.log("[ATTRIBUTEVALUE_CREATE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function GET(
  req: Request,
  { params }: { params: { storeId: string; attributeId: string } }
) {
  try {
    if (!params.storeId) {
      return new NextResponse("Id de la tienda es requerido", { status: 400 });
    }

    const attributeValues = await prismadb.attributeValue.findMany({
      where: {
        storeId: params.storeId,
        attributeId: params.attributeId,
      },
    });

    return NextResponse.json(attributeValues);
  } catch (error) {
    console.log("[SUBCATEGORIES_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
