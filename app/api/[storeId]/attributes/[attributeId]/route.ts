import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

import prismadb from "@/lib/prismadb";

export async function GET(
  req: Request,
  { params }: { params: { attributeId: string } }
) {
  try {
    if (!params.attributeId) {
      return new NextResponse("Id del atributo es requerido", { status: 400 });
    }

    const attribute = await prismadb.attribute.findUnique({
      where: {
        id: params.attributeId,
      },
      include: {
        values: true,
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
      return new NextResponse("No autorizado", { status: 403 });
    }

    if (!params.attributeId) {
      return new NextResponse("Id del atributo es requerido", { status: 400 });
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
      return new NextResponse("No autorizado", { status: 403 });
    }

    if (!params.storeId) {
      return new NextResponse("Id de la tienda es requerido", { status: 400 });
    }

    if (!name) {
      return new NextResponse("Nombre es requerido", { status: 400 });
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

    await prismadb.attribute.update({
      where: {
        id: params.attributeId,
      },
      data: {
        name,
        values: {
          deleteMany: {},
        },
      },
    });

    const attribute = await prismadb.attribute.update({
      where: {
        id: params.attributeId,
      },
      data: {
        name,
        values: {
          createMany: {
            data: values.map((value: { value: string }) => ({
              value: value.value, // Asegúrate de que `value` sea una cadena
              storeId: params.storeId, // Incluye el storeId si es necesario
            })),
          },
        },
      },
    });

    return NextResponse.json(attribute);
  } catch (error) {
    console.log("[ATTRIBUTE_PATCH]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
