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

    const {
      categoryId,
      subCategoryId,
      name,
      price,
      priceOffer,
      images,
      isFeatured,
      isArchived,
      stock,
      isStock,
      brandId,
      providerId,
    } = body;

    if (!userId) {
      return new NextResponse("No autorizado", { status: 403 });
    }

    if (!params.storeId) {
      return new NextResponse("Id de la tienda es requerido", { status: 400 });
    }

    if (!name) {
      return new NextResponse("Nombre es requerido", { status: 400 });
    }

    if (!images || !images.length) {
      return new NextResponse("Imagenes son requeridas", { status: 400 });
    }

    if (!price) {
      return new NextResponse("Precio es requerido", { status: 400 });
    }

    if (!categoryId) {
      return new NextResponse("Id de la categoria es requerido", {
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

    const existingProduct = await prismadb.product.findFirst({
      where: {
        name: name,
      },
    });

    if (existingProduct) {
      return new NextResponse("El producto ya existe", { status: 409 });
    }

    //*Crear el nuevo producto

    const product = await prismadb.product.create({
      data: {
        name,
        price,
        priceOffer,
        isFeatured,
        isArchived,
        categoryId,
        subCategoryId,
        isStock,
        stock,
        brandId,
        providerId,
        storeId: params.storeId,
        images: {
          createMany: {
            data: [...images.map((image: { url: string }) => image)],
          },
        },
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.log("[PRODUCTS_POST]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function GET(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get("categoryId") || undefined;
    const subCategoryId = searchParams.get("subCategoryId") || undefined;
    const isFeatured = searchParams.get("isFeatured");
    const brandId = searchParams.get("brandId") || undefined;
    const providerId = searchParams.get("providerId") || undefined;
    const minPrice = searchParams.get("minPrice")
      ? parseFloat(searchParams.get("minPrice")!)
      : undefined;
    const maxPrice = searchParams.get("maxPrice")
      ? parseFloat(searchParams.get("maxPrice")!)
      : undefined;

    if (!params.storeId) {
      return new NextResponse("Store id is required", { status: 400 });
    }

    const products = await prismadb.product.findMany({
      where: {
        storeId: params.storeId,
        categoryId,
        subCategoryId,
        brandId,
        providerId,
        isFeatured: isFeatured ? true : undefined,
        isArchived: false,
        price: {
          gte: minPrice,
          lte: maxPrice,
        },
      },
      include: {
        images: true,
        category: true,
        subCategory: true,
        variants: true,
        brand: true,
        provider: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(products);
  } catch (error) {
    console.log("[PRODUCTS_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
