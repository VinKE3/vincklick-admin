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

    const { name, values } = body;

    if (!userId) {
      return new NextResponse("No autorizado", { status: 403 });
    }

    if (!params.storeId) {
      return new NextResponse("Id de la tienda es requerido", { status: 400 });
    }

    if (!name) {
      return new NextResponse("Nombre es requerido", { status: 400 });
    }

    if (!values) {
      return new NextResponse("Valor/es es/son requerido/s", { status: 400 });
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

    const existingAttribute = await prismadb.attribute.findFirst({
      where: {
        name: name,
      },
    });

    if (existingAttribute) {
      return new NextResponse("El atributo ya existe", { status: 409 });
    }

    //*Crear el nuevo atributo
    const attribute = await prismadb.attribute.create({
      data: {
        storeId: params.storeId,
        name,
      },
    });
    //* Si hay valores de atributo, crearlos
    if (values && Array.isArray(values)) {
      const attributeValues = values.map((value: { value: string }) => ({
        value: value.value,
        attributeId: attribute.id,
        storeId: params.storeId,
      }));

      await prismadb.attributeValue.createMany({
        data: attributeValues,
      });
    }

    return NextResponse.json(attribute);
  } catch (error) {
    console.log("[ATTRIBUTES_POST]", error);
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

    const attributes = await prismadb.attribute.findMany({
      where: {
        storeId: params.storeId,
      },
      include: {
        values: true,
      },
    });

    return NextResponse.json(attributes);
  } catch (error) {
    console.log("[ATTRIBUTES_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
