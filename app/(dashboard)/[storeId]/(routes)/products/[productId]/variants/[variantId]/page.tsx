import prismadb from "@/lib/prismadb";

import { ProductVariantForm } from "./components/product-variant-form";

const ProductVariantPage = async ({
  params,
}: {
  params: { variantId: string; storeId: string; productId: string };
}) => {
  const productVariant = await prismadb.productVariant.findUnique({
    where: {
      id: params.variantId,
    },
    include: {
      images: true,
    },
  });
  const product = await prismadb.product.findUnique({
    where: {
      id: params.productId,
    },
  });
  const colors = await prismadb.color.findMany({
    where: {
      storeId: params.storeId,
    },
  });
  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <ProductVariantForm
          initialData={productVariant}
          colors={colors}
          product={product}
        />
      </div>
    </div>
  );
};

export default ProductVariantPage;
