import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

import prismadb from "@/lib/prismadb";

export async function GET(
  req: Request,
  { params }: { params: { variantId: string; productId: string } }
) {
  try {
    if (!params.productId) {
      return new NextResponse("Id del producto es requerido", {
        status: 400,
      });
    }
    if (!params.variantId) {
      return new NextResponse("Id de la variación de producto es requerido", {
        status: 400,
      });
    }

    const productVariant = await prismadb.productVariant.findFirst({
      where: {
        id: params.variantId,
        productId: params.productId,
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
    });

    if (!productVariant) {
      return new NextResponse("Variación de producto no encontrada", {
        status: 404,
      });
    }

    return NextResponse.json(productVariant);
  } catch (error) {
    console.log("[PRODUCTVARIANT_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  {
    params,
  }: {
    params: { productId: string; storeId: string; productVariantId: string };
  }
) {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("No autorizado", { status: 403 });
    }

    if (!params.storeId) {
      return new NextResponse("Id de la tienda es requerido", { status: 400 });
    }

    if (!params.productId) {
      return new NextResponse("Id del producto es requerido", { status: 400 });
    }

    if (!params.productVariantId) {
      return new NextResponse("Id de la variación de producto es requerido", {
        status: 400,
      });
    }

    // Verificar si la tienda pertenece al usuario
    const storeByUserId = await prismadb.store.findFirst({
      where: {
        id: params.storeId,
        userId,
      },
    });

    if (!storeByUserId) {
      return new NextResponse("No autorizado", { status: 405 });
    }

    // Verificar si la variación de producto existe
    const existingProductVariant = await prismadb.productVariant.findUnique({
      where: {
        id: params.productVariantId,
      },
    });

    if (!existingProductVariant) {
      return new NextResponse("Variación de producto no encontrada", {
        status: 404,
      });
    }

    // Eliminar la variación de producto
    const deletedProductVariant = await prismadb.productVariant.delete({
      where: {
        id: params.productVariantId,
      },
    });

    return NextResponse.json(deletedProductVariant);
  } catch (error) {
    console.log("[PRODUCTVARIANT_DELETE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  {
    params,
  }: { params: { variantId: string; productId: string; storeId: string } }
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

    await prismadb.productVariant.update({
      where: {
        id: params.variantId,
      },
      data: {
        name,
        sku,
        price,
        isPriceOffer,
        priceOffer,
        isFeatured,
        isArchived,
        isStock,
        stock,
        storeId: params.storeId,
        images: {
          deleteMany: {},
        },
      },
    });

    const productVariant = await prismadb.productVariant.update({
      where: {
        id: params.productId,
      },
      data: {
        images: {
          createMany: {
            data: [...images.map((image: { url: string }) => image)],
          },
        },
      },
    });
    return NextResponse.json(productVariant);
  } catch (error) {
    console.log("[PRODUCT_PATCH]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
