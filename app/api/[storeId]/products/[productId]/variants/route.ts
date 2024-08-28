import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

import prismadb from "@/lib/prismadb";

export async function POST(
  req: Request,
  { params }: { params: { storeId: string; productId: string } }
) {
  try {
    const { userId } = auth();

    const body = await req.json();

    const {
      name,
      sku,
      price,
      priceOffer,
      isPriceOffer,
      images,
      isFeatured,
      isArchived,
      stock,
      isStock,
      attributes,
    } = body;

    if (!userId) {
      return new NextResponse("No autorizado", { status: 403 });
    }

    if (!params.storeId) {
      return new NextResponse("Id de la tienda es requerido", { status: 400 });
    }

    if (!params.productId) {
      return new NextResponse("Id del producto es requerido", {
        status: 400,
      });
    }

    if (!name) {
      return new NextResponse("Nombre es requerido", { status: 400 });
    }

    if (!sku) {
      return new NextResponse("SKU es requerido", { status: 400 });
    }

    if (!images || !images.length) {
      return new NextResponse("Imagenes son requeridas", { status: 400 });
    }

    if (!price) {
      return new NextResponse("Precio es requerido", { status: 400 });
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

    const existingProductVariant = await prismadb.productVariant.findFirst({
      where: {
        name: name,
      },
    });

    if (existingProductVariant) {
      return new NextResponse("La variación de producto ya existe", {
        status: 409,
      });
    }

    //*Crear la nueva variación de producto
    const productVariant = await prismadb.productVariant.create({
      data: {
        storeId: params.storeId,
        productId: params.productId,
        name,
        sku,
        price,
        isPriceOffer,
        priceOffer,
        isFeatured,
        isArchived,
        isStock,
        stock,
        images: {
          createMany: {
            data: [...images.map((image: { url: string }) => image)],
          },
        },
      },
    });

    //*Asociar atributos a la variación de producto
    if (attributes && Array.isArray(attributes)) {
      const attributeEntries = attributes.map((attr: any) => ({
        storeId: params.storeId,
        attributeId: attr.attributeId,
        attributeValueId: attr.attributeValueId,
        productVariantId: productVariant.id,
      }));

      await prismadb.variantAttribute.createMany({
        data: attributeEntries,
      });
    }

    return NextResponse.json(productVariant);
  } catch (error) {
    console.log("[PRODUCTVARIANT_POST]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function GET(
  req: Request,
  { params }: { params: { storeId: string; productId: string } }
) {
  try {
    const { searchParams } = new URL(req.url);

    const isFeatured =
      searchParams.get("isFeatured") === "true" ? true : undefined;
    const isStock = searchParams.get("isStock") === "true" ? true : undefined;
    const isPriceOffer =
      searchParams.get("isPriceOffer") === "true" ? true : undefined;

    const minPrice = searchParams.get("minPrice")
      ? parseFloat(searchParams.get("minPrice")!)
      : undefined;
    const maxPrice = searchParams.get("maxPrice")
      ? parseFloat(searchParams.get("maxPrice")!)
      : undefined;
    const minPriceOffer = searchParams.get("minPriceOffer")
      ? parseFloat(searchParams.get("minPriceOffer")!)
      : undefined;
    const maxPriceOffer = searchParams.get("maxPriceOffer")
      ? parseFloat(searchParams.get("maxPriceOffer")!)
      : undefined;
    const minStock = searchParams.get("minStock")
      ? parseFloat(searchParams.get("minStock")!)
      : undefined;
    const maxStock = searchParams.get("maxStock")
      ? parseFloat(searchParams.get("maxStock")!)
      : undefined;

    // Validación de parámetros requeridos
    if (!params.storeId) {
      return new NextResponse("Id de la tienda es requerida", { status: 400 });
    }
    if (!params.productId) {
      return new NextResponse("Id del producto es requerido", { status: 400 });
    }

    // Consulta de variaciones de producto
    const productsVariants = await prismadb.productVariant.findMany({
      where: {
        storeId: params.storeId,
        productId: params.productId,
        isPriceOffer,
        isStock,
        isFeatured,
        isArchived: false,
        price:
          minPrice || maxPrice ? { gte: minPrice, lte: maxPrice } : undefined,
        priceOffer:
          minPriceOffer || maxPriceOffer
            ? { gte: minPriceOffer, lte: maxPriceOffer }
            : undefined,
        stock:
          minStock || maxStock ? { gte: minStock, lte: maxStock } : undefined,
      },
      include: {
        images: true,
        attributes: {
          include: {
            attribute: true,
            attributeValue: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(productsVariants);
  } catch (error) {
    console.log("[PRODUCTSVARIANTS_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
