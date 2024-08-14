import { NextResponse } from "next/server";

import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs/server";

export async function POST(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const { userId } = auth();

    const body = await req.json();

    const { name, contactName, email, phone, address } = body;

    if (!userId) {
      return new NextResponse("No identificado", { status: 403 });
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

    const existingProvider = await prismadb.provider.findFirst({
      where: {
        name: name,
      },
    });

    if (existingProvider) {
      return new NextResponse("El proveedor ya existe", { status: 409 });
    }

    //*Crear el nuevo proveedor

    const provider = await prismadb.provider.create({
      data: {
        name,
        contactName,
        email,
        phone,
        address,
        storeId: params.storeId,
      },
    });
    return NextResponse.json(provider);
  } catch (error) {
    console.log("[PROVIDERS_POST]", error);
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

    const providers = await prismadb.provider.findMany({
      where: {
        storeId: params.storeId,
      },
    });

    return NextResponse.json(providers);
  } catch (error) {
    console.log("[PROVIDERS_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
