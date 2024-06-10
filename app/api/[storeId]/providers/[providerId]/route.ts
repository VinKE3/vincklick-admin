import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

import prismadb from "@/lib/prismadb";

export async function GET(
  req: Request,
  { params }: { params: { providerId: string } }
) {
  try {
    if (!params.providerId) {
      return new NextResponse("Id del Proveedor es requerido", { status: 400 });
    }
    const provider = await prismadb.provider.findUnique({
      where: {
        id: params.providerId,
      },
    });

    return NextResponse.json(provider);
  } catch (error) {
    console.log("[PROVIDER_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { providerId: string; storeId: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse("No autorizado", { status: 403 });
    }

    if (!params.providerId) {
      return new NextResponse("Id del proveedor es requerido", { status: 400 });
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
    const provider = await prismadb.provider.delete({
      where: {
        id: params.providerId,
      },
    });

    return NextResponse.json(provider);
  } catch (error) {
    console.log("[PROVIDER_DELETE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { providerId: string; storeId: string } }
) {
  try {
    const { userId } = auth();

    const body = await req.json();

    const { name, contactName, email, phone, address } = body;

    if (!userId) {
      return new NextResponse("No autorizado", { status: 403 });
    }

    if (!params.providerId) {
      return new NextResponse("Id del color es requerido", { status: 400 });
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

    const provider = await prismadb.provider.update({
      where: {
        id: params.providerId,
      },
      data: {
        name,
        contactName,
        email,
        phone,
        address,
      },
    });

    return NextResponse.json(provider);
  } catch (error) {
    console.log(error);
  }
}
